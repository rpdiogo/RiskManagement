from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import Any
from ..database import get_db
from ..models.settings import Settings

router = APIRouter(prefix="/api/settings", tags=["settings"])


def _csv_to_list(s: str | None) -> list[str]:
    return [p.strip() for p in (s or "").split(",") if p.strip()]


def _to_dict(s: Settings) -> dict:
    return {
        "organization": {
            "name":               s.org_name,
            "sector":             s.org_sector,
            "nif":                s.org_nif,
            "logoUrl":            s.org_logo_url,
            "frameworks":         _csv_to_list(s.org_frameworks),
            "nis2Classification": s.org_nis2_classification,
        },
        "riskMatrix": {
            "size":               s.matrix_size,
            "probabilityLabels":  _csv_to_list(s.prob_labels),
            "impactLabels":       _csv_to_list(s.impact_labels),
            "thresholds": {
                "lowMax":    s.threshold_low_max,
                "mediumMax": s.threshold_medium_max,
                "highMax":   s.threshold_high_max,
            },
            "appetite":  s.risk_appetite,
            "tolerance": s.risk_tolerance,
        },
        "taxonomy": {
            "riskCategories": _csv_to_list(s.risk_categories),
            "assetTypes":     _csv_to_list(s.asset_types),
        },
        "profile": {
            "name":  s.user_name,
            "email": s.user_email,
            "role":  s.user_role,
        },
    }


def _get_or_create(db: Session) -> Settings:
    s = db.query(Settings).filter(Settings.id == "default").first()
    if s is None:
        s = Settings(id="default")
        db.add(s)
        db.commit()
        db.refresh(s)
    return s


@router.get("")
def get_settings(db: Session = Depends(get_db)):
    return _to_dict(_get_or_create(db))


@router.put("")
def update_settings(payload: dict[str, Any], db: Session = Depends(get_db)):
    s = _get_or_create(db)

    org = payload.get("organization") or {}
    if "name"               in org: s.org_name                = org["name"]
    if "sector"             in org: s.org_sector              = org["sector"]
    if "nif"                in org: s.org_nif                 = org["nif"]
    if "logoUrl"            in org: s.org_logo_url            = org["logoUrl"]
    if "frameworks"         in org: s.org_frameworks          = ",".join(org["frameworks"])
    if "nis2Classification" in org: s.org_nis2_classification = org["nis2Classification"]

    rm = payload.get("riskMatrix") or {}
    if "size"              in rm: s.matrix_size  = rm["size"]
    if "probabilityLabels" in rm: s.prob_labels  = ",".join(rm["probabilityLabels"])
    if "impactLabels"      in rm: s.impact_labels = ",".join(rm["impactLabels"])
    if "thresholds" in rm:
        t = rm["thresholds"]
        if "lowMax"    in t: s.threshold_low_max    = t["lowMax"]
        if "mediumMax" in t: s.threshold_medium_max = t["mediumMax"]
        if "highMax"   in t: s.threshold_high_max   = t["highMax"]
    if "appetite"  in rm: s.risk_appetite  = rm["appetite"]
    if "tolerance" in rm: s.risk_tolerance = rm["tolerance"]

    tx = payload.get("taxonomy") or {}
    if "riskCategories" in tx: s.risk_categories = ",".join(tx["riskCategories"])
    if "assetTypes"     in tx: s.asset_types     = ",".join(tx["assetTypes"])

    p = payload.get("profile") or {}
    if "name"  in p: s.user_name  = p["name"]
    if "email" in p: s.user_email = p["email"]
    if "role"  in p: s.user_role  = p["role"]

    db.commit()
    db.refresh(s)
    return _to_dict(s)
