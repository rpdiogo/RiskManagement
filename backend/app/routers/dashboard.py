from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from ..database import get_db
from ..models.risk import Risk
from ..models.tprm import Vendor

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


def _level(score: int) -> str:
    if score >= 20: return "critical"
    if score >= 12: return "high"
    if score >= 6:  return "medium"
    return "low"


@router.get("/summary")
def summary(db: Session = Depends(get_db)):
    risks = db.query(Risk).all()
    total = len(risks)
    by_level = {"critical": 0, "high": 0, "medium": 0, "low": 0}
    by_category: dict[str, int] = {}
    top_critical = []

    for r in risks:
        lvl = r.level or _level(r.score or 0)
        if lvl in by_level:
            by_level[lvl] += 1
        cat = r.category or "Outro"
        by_category[cat] = by_category.get(cat, 0) + 1
        if lvl == "critical":
            top_critical.append({"id": r.id, "name": r.name, "level": lvl, "score": r.score, "trend": r.trend or "stable"})

    top_critical = sorted(top_critical, key=lambda x: x["score"] or 0, reverse=True)[:5]

    avg_score = int(sum(r.score or 0 for r in risks) / total) if total else 0
    risk_score = min(avg_score, 100)

    categories = [
        {"category": cat, "count": count, "percentage": round(count / total * 100) if total else 0}
        for cat, count in sorted(by_category.items(), key=lambda x: x[1], reverse=True)
    ]

    return {
        "totalRisks":    total,
        "criticalRisks": by_level["critical"],
        "highRisks":     by_level["high"],
        "mediumRisks":   by_level["medium"],
        "lowRisks":      by_level["low"],
        "riskScore":     risk_score,
        "risksByCategory": categories,
        "topCriticalRisks": top_critical,
        "riskTrends":    [],
        "actionPlanCompletion": 0,
        "actionPlanStats": {"completed": 0, "inProgress": 0, "delayed": 0, "notStarted": 0},
        "securityIndicators": {
            "incidents": 0, "incidentsTrend": 0,
            "criticalVulns": 0, "criticalVulnsTrend": 0,
            "highRiskAssets": 0, "highRiskAssetsTrend": 0,
            "ineffectiveControls": 0, "ineffectiveControlsTrend": 0,
            "treatmentRate": 0, "treatmentRateTrend": 0,
        },
        "recentIncidents": [],
        "riskMatrix": [
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
        ],
    }
