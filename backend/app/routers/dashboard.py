from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import date
from ..database import get_db
from ..models.risk import Risk
from ..models.action_plan import ActionPlan
from ..models.snapshot import MonthlySnapshot
from ..models.control import Control

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


# ─── Compliance score helpers ──────────────────────────────────────────────────
# Pontuação combinada: status (implementação) × eficácia (operacionalidade).
# Eficácia só se aplica a controlos já operacionais (implemented/partial);
# planned/not_implemented ficam com pontuação fixa porque não estão a funcionar.
_EFFECTIVENESS_MULT = {
    "effective":         1.0,
    "needs_improvement": 0.7,
    "ineffective":       0.3,
    "untested":          0.6,   # conservador — não sabemos se funciona
}

def _control_points(status: str, effectiveness: str) -> float | None:
    """Pontuação 0-100 de um controlo combinando status e eficácia.
    Retorna None para 'not_applicable' (excluído do cálculo)."""
    if status == "not_applicable":
        return None
    if status == "not_implemented":
        return 0.0
    if status == "planned":
        return 25.0
    mult = _EFFECTIVENESS_MULT.get(effectiveness or "untested", 0.6)
    if status == "implemented":
        return 100.0 * mult
    if status == "partial":
        return 50.0 * mult
    return 0.0


def _compliance_score(controls) -> int:
    """Score 0-100 ponderado por status × eficácia. Ignora not_applicable."""
    pts = []
    for c in controls:
        p = _control_points(c.status, c.effectiveness)
        if p is not None:
            pts.append(p)
    if not pts:
        return 0
    return round(sum(pts) / len(pts))


@router.get("/summary")
def summary(db: Session = Depends(get_db)):
    risks = db.query(Risk).all()
    total = len(risks)
    by_level = {"critical": 0, "high": 0, "medium": 0, "low": 0}
    by_category: dict[str, int] = {}
    top_risks = []

    # Build 5x5 risk matrix (inherent + residual)
    matrix          = [[0] * 5 for _ in range(5)]
    residual_matrix = [[0] * 5 for _ in range(5)]
    res_level_counts: dict[str, int] = {"critical": 0, "high": 0, "medium": 0, "low": 0}
    res_scores: list[int] = []

    for r in risks:
        lvl = r.level or _level(r.score or 0)
        if lvl in by_level:
            by_level[lvl] += 1
        cat = r.category or "Outro"
        by_category[cat] = by_category.get(cat, 0) + 1

        prob   = max(1, min(5, r.probability or 1))
        impact = max(1, min(5, r.impact or 1))
        matrix[5 - prob][impact - 1] += 1

        # Residual matrix — only when both values set
        if r.residual_probability and r.residual_impact:
            rp = max(1, min(5, r.residual_probability))
            ri = max(1, min(5, r.residual_impact))
            residual_matrix[5 - rp][ri - 1] += 1
            rs = r.residual_score or rp * ri
            res_scores.append(rs)
            rl = r.residual_level or _level(rs)
            if rl in res_level_counts:
                res_level_counts[rl] += 1

        top_risks.append({"id": r.id, "name": r.name, "level": lvl, "score": r.score or 0, "trend": r.trend or "stable"})

    top_risks = sorted(top_risks, key=lambda x: x["score"], reverse=True)[:5]

    avg_score  = sum(r.score or 0 for r in risks) / total if total else 0
    risk_score = round(avg_score / 25 * 100)   # escala 0-25 → 0-100
    avg_residual   = sum(res_scores) / len(res_scores) if res_scores else None
    residual_score = round(avg_residual / 25 * 100) if avg_residual is not None else None

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

    # Controls — eficácia agregada
    controls = db.query(Control).all()
    ineffective_controls = sum(1 for c in controls if c.effectiveness in ("ineffective", "untested"))

    # NIS2 compliance stats (category = 'Regulamentar')
    nis2_controls = [c for c in controls if c.category == "Regulamentar"]
    nis2_total         = len(nis2_controls)
    nis2_implemented   = sum(1 for c in nis2_controls if c.status == "implemented")
    nis2_partial       = sum(1 for c in nis2_controls if c.status == "partial")
    nis2_planned       = sum(1 for c in nis2_controls if c.status == "planned")
    nis2_not_impl      = sum(1 for c in nis2_controls if c.status == "not_implemented")
    nis2_not_applicable = sum(1 for c in nis2_controls if c.status == "not_applicable")
    nis2_applicable    = nis2_total - nis2_not_applicable
    nis2_score = _compliance_score(nis2_controls)

    # Per-article breakdown for NIS2 widget
    nis2_by_article: dict[str, dict] = {}
    for c in nis2_controls:
        # Extract article from code e.g. "NIS2.21.2.a" → "Art. 21"
        parts = (c.code or "").split(".")
        if len(parts) >= 2:
            article_key = f"Art. {parts[1]}"
        else:
            article_key = c.code or "?"
        if article_key not in nis2_by_article:
            nis2_by_article[article_key] = {
                "article": article_key,
                "total": 0, "implemented": 0, "partial": 0,
                "planned": 0, "notImplemented": 0, "notApplicable": 0,
            }
        entry = nis2_by_article[article_key]
        entry["total"] += 1
        if c.status == "implemented":       entry["implemented"] += 1
        elif c.status == "partial":         entry["partial"] += 1
        elif c.status == "planned":         entry["planned"] += 1
        elif c.status == "not_implemented": entry["notImplemented"] += 1
        elif c.status == "not_applicable":  entry["notApplicable"] += 1

    # ISO 27001 compliance stats (id starts with "A.")
    iso_controls = [c for c in controls if (c.id or "").startswith("A.")]
    iso_total          = len(iso_controls)
    iso_implemented    = sum(1 for c in iso_controls if c.status == "implemented")
    iso_partial        = sum(1 for c in iso_controls if c.status == "partial")
    iso_planned        = sum(1 for c in iso_controls if c.status == "planned")
    iso_not_impl       = sum(1 for c in iso_controls if c.status == "not_implemented")
    iso_not_applicable = sum(1 for c in iso_controls if c.status == "not_applicable")
    iso_applicable     = iso_total - iso_not_applicable
    iso_score = _compliance_score(iso_controls)

    # Per-section breakdown (5/6/7/8) for ISO widget
    iso_section_labels = {
        "5": "5. Organizacionais",
        "6": "6. Pessoas",
        "7": "7. Físicos",
        "8": "8. Tecnológicos",
    }
    iso_by_section: dict[str, dict] = {}
    for c in iso_controls:
        # Extract section from id e.g. "A.5.1" → "5"
        parts = (c.id or "").split(".")
        section_key = parts[1] if len(parts) >= 2 else "?"
        label = iso_section_labels.get(section_key, section_key)
        if section_key not in iso_by_section:
            iso_by_section[section_key] = {
                "section": label,
                "key":     section_key,
                "total": 0, "implemented": 0, "partial": 0,
                "planned": 0, "notImplemented": 0, "notApplicable": 0,
            }
        entry = iso_by_section[section_key]
        entry["total"] += 1
        if c.status == "implemented":       entry["implemented"] += 1
        elif c.status == "partial":         entry["partial"] += 1
        elif c.status == "planned":         entry["planned"] += 1
        elif c.status == "not_implemented": entry["notImplemented"] += 1
        elif c.status == "not_applicable":  entry["notApplicable"] += 1

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
        "residualMatrix":        residual_matrix,
        "residualScore":         residual_score,
        "residualCriticalRisks": res_level_counts["critical"],
        "residualHighRisks":     res_level_counts["high"],
        "residualMediumRisks":   res_level_counts["medium"],
        "residualLowRisks":      res_level_counts["low"],
        "securityIndicators": {
            "incidents": 0, "incidentsTrend": 0,
            "criticalVulns": by_level["critical"], "criticalVulnsTrend": 0,
            "highRiskAssets": by_level["high"], "highRiskAssetsTrend": 0,
            "ineffectiveControls": ineffective_controls, "ineffectiveControlsTrend": 0,
            "treatmentRate": treatment_rate, "treatmentRateTrend": 0,
        },
        "recentIncidents": [],
        "riskMatrix": matrix,
        "nis2Compliance": {
            "score":         nis2_score,
            "total":         nis2_total,
            "implemented":   nis2_implemented,
            "partial":       nis2_partial,
            "planned":       nis2_planned,
            "notImplemented": nis2_not_impl,
            "notApplicable": nis2_not_applicable,
            "byArticle":     sorted(nis2_by_article.values(), key=lambda x: x["article"]),
        },
        "iso27001Compliance": {
            "score":         iso_score,
            "total":         iso_total,
            "implemented":   iso_implemented,
            "partial":       iso_partial,
            "planned":       iso_planned,
            "notImplemented": iso_not_impl,
            "notApplicable": iso_not_applicable,
            "bySection":     sorted(iso_by_section.values(), key=lambda x: x["key"]),
        },
    }
