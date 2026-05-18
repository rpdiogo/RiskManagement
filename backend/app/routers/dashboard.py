from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.risk import Risk
from ..models.action_plan import ActionPlan

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


def _level(score: int) -> str:
    if score > 16: return "critical"
    if score >= 10: return "high"
    if score >= 5:  return "medium"
    return "low"


@router.get("/summary")
def summary(db: Session = Depends(get_db)):
    risks = db.query(Risk).all()
    total = len(risks)
    by_level = {"critical": 0, "high": 0, "medium": 0, "low": 0}
    by_category: dict[str, int] = {}
    top_risks = []

    # Build 5x5 risk matrix
    # Row 0 = prob 5 (Muito Alta) … Row 4 = prob 1 (Muito Baixa)
    # Col 0 = impact 1 (Muito Baixo) … Col 4 = impact 5 (Muito Alto)
    matrix = [[0] * 5 for _ in range(5)]

    for r in risks:
        lvl = r.level or _level(r.score or 0)
        if lvl in by_level:
            by_level[lvl] += 1
        cat = r.category or "Outro"
        by_category[cat] = by_category.get(cat, 0) + 1

        # Place risk in matrix cell
        prob   = max(1, min(5, r.probability or 1))
        impact = max(1, min(5, r.impact or 1))
        row = 5 - prob       # prob 5 → row 0, prob 1 → row 4
        col = impact - 1     # impact 1 → col 0, impact 5 → col 4
        matrix[row][col] += 1

        top_risks.append({"id": r.id, "name": r.name, "level": lvl, "score": r.score or 0, "trend": r.trend or "stable"})

    top_risks = sorted(top_risks, key=lambda x: x["score"], reverse=True)[:5]

    avg_score = int(sum(r.score or 0 for r in risks) / total) if total else 0
    risk_score = min(avg_score * 10, 100)  # scale to 0-100

    categories = [
        {"category": cat, "count": count, "percentage": round(count / total * 100) if total else 0}
        for cat, count in sorted(by_category.items(), key=lambda x: x[1], reverse=True)
    ]

    # Action plan stats
    action_plans = db.query(ActionPlan).all()
    ap_total = len(action_plans)
    ap_completed  = sum(1 for a in action_plans if a.status == "completed")
    ap_inprogress = sum(1 for a in action_plans if a.status == "in_progress")
    ap_delayed    = sum(1 for a in action_plans if a.status == "delayed")
    ap_notstarted = sum(1 for a in action_plans if a.status == "not_started")
    ap_completion = round(ap_completed / ap_total * 100) if ap_total else 0

    # Treatment rate: risks in treatment / total
    in_treatment = sum(1 for r in risks if r.status in ("in_treatment", "mitigated", "accepted", "closed"))
    treatment_rate = round(in_treatment / total * 100) if total else 0

    return {
        "totalRisks":    total,
        "criticalRisks": by_level["critical"],
        "highRisks":     by_level["high"],
        "mediumRisks":   by_level["medium"],
        "lowRisks":      by_level["low"],
        "riskScore":     risk_score,
        "risksByCategory": categories,
        "topCriticalRisks": top_risks,
        "riskTrends":    [],
        "actionPlanCompletion": ap_completion,
        "actionPlanStats": {
            "completed":  ap_completed,
            "inProgress": ap_inprogress,
            "delayed":    ap_delayed,
            "notStarted": ap_notstarted,
        },
        "securityIndicators": {
            "incidents": 0, "incidentsTrend": 0,
            "criticalVulns": by_level["critical"], "criticalVulnsTrend": 0,
            "highRiskAssets": by_level["high"], "highRiskAssetsTrend": 0,
            "ineffectiveControls": 0, "ineffectiveControlsTrend": 0,
            "treatmentRate": treatment_rate, "treatmentRateTrend": 0,
        },
        "recentIncidents": [],
        "riskMatrix": matrix,
    }
