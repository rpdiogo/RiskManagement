from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import date
from ..database import get_db
from ..models.risk import Risk
from ..models.action_plan import ActionPlan
from ..models.snapshot import MonthlySnapshot

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


def _level(score: int) -> str:
    if score > 16: return "critical"
    if score >= 10: return "high"
    if score >= 5:  return "medium"
    return "low"


def _pct_change(current: int, previous: int) -> int:
    """Return % change vs previous, rounded to nearest int. 0 if no previous data."""
    if previous == 0:
        return 0
    return round((current - previous) / previous * 100)


def _prev_month(ym: str) -> str:
    """Return 'YYYY-MM' for the month before the given 'YYYY-MM'."""
    y, m = int(ym[:4]), int(ym[5:7])
    if m == 1:
        return f"{y - 1}-12"
    return f"{y}-{m - 1:02d}"


@router.get("/summary")
def summary(db: Session = Depends(get_db)):
    risks = db.query(Risk).all()
    total = len(risks)
    by_level = {"critical": 0, "high": 0, "medium": 0, "low": 0}
    by_category: dict[str, int] = {}
    top_risks = []

    # Build 5x5 risk matrix
    matrix = [[0] * 5 for _ in range(5)]

    for r in risks:
        lvl = r.level or _level(r.score or 0)
        if lvl in by_level:
            by_level[lvl] += 1
        cat = r.category or "Outro"
        by_category[cat] = by_category.get(cat, 0) + 1

        prob   = max(1, min(5, r.probability or 1))
        impact = max(1, min(5, r.impact or 1))
        matrix[5 - prob][impact - 1] += 1

        top_risks.append({"id": r.id, "name": r.name, "level": lvl, "score": r.score or 0, "trend": r.trend or "stable"})

    top_risks = sorted(top_risks, key=lambda x: x["score"], reverse=True)[:5]

    avg_score = int(sum(r.score or 0 for r in risks) / total) if total else 0
    risk_score = min(avg_score * 10, 100)

    categories = [
        {"category": cat, "count": count, "percentage": round(count / total * 100) if total else 0}
        for cat, count in sorted(by_category.items(), key=lambda x: x[1], reverse=True)
    ]

    # Action plan stats
    action_plans = db.query(ActionPlan).all()
    ap_total      = len(action_plans)
    ap_completed  = sum(1 for a in action_plans if a.status == "completed")
    ap_inprogress = sum(1 for a in action_plans if a.status == "in_progress")
    ap_delayed    = sum(1 for a in action_plans if a.status == "delayed")
    ap_notstarted = sum(1 for a in action_plans if a.status == "not_started")
    ap_completion = round(ap_completed / ap_total * 100) if ap_total else 0

    in_treatment  = sum(1 for r in risks if r.status in ("in_treatment", "mitigated", "accepted", "closed"))
    treatment_rate = round(in_treatment / total * 100) if total else 0

    # -----------------------------------------------------------------------
    # Monthly snapshot: persist this month's counts if not yet saved,
    # then load last month's snapshot to compute real trends.
    # -----------------------------------------------------------------------
    this_month = date.today().strftime("%Y-%m")
    snap = db.query(MonthlySnapshot).filter(MonthlySnapshot.month == this_month).first()
    if snap is None:
        snap = MonthlySnapshot(
            month=this_month,
            total=total,
            critical=by_level["critical"],
            high=by_level["high"],
            medium=by_level["medium"],
            low=by_level["low"],
        )
        db.add(snap)
        db.commit()
    else:
        # Update the snapshot with current counts (catches intra-month changes)
        snap.total    = total
        snap.critical = by_level["critical"]
        snap.high     = by_level["high"]
        snap.medium   = by_level["medium"]
        snap.low      = by_level["low"]
        db.commit()

    prev = db.query(MonthlySnapshot).filter(
        MonthlySnapshot.month == _prev_month(this_month)
    ).first()

    trends = {
        "total":    _pct_change(total,               prev.total    if prev else 0),
        "critical": _pct_change(by_level["critical"], prev.critical if prev else 0),
        "high":     _pct_change(by_level["high"],     prev.high     if prev else 0),
        "medium":   _pct_change(by_level["medium"],   prev.medium   if prev else 0),
        "low":      _pct_change(by_level["low"],      prev.low      if prev else 0),
    }

    return {
        "totalRisks":       total,
        "criticalRisks":    by_level["critical"],
        "highRisks":        by_level["high"],
        "mediumRisks":      by_level["medium"],
        "lowRisks":         by_level["low"],
        "riskScore":        risk_score,
        "trends":           trends,
        "risksByCategory":  categories,
        "topCriticalRisks": top_risks,
        "riskTrends":       [],
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
