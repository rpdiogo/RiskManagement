"""
Seed script — populates the database with all risks and action plans
from Matriz Gestao Risco 2026.xlsx.

Run from the backend/ directory:
    python seed.py
"""

import sys, os
sys.path.insert(0, os.path.dirname(__file__))

from app.database import SessionLocal, engine, Base
from app.models.risk import Risk
from app.models import action_plan  # ensure ActionPlan table registered
import uuid, datetime

Base.metadata.create_all(bind=engine)

# ---------------------------------------------------------------------------
# Category mapping: Excel → App
# ---------------------------------------------------------------------------
CAT_MAP = {
    "Segurança da Informação – Tecnológico":  "Tecnológico",
    "Segurança da Informação – Pessoas":       "Pessoas",
    "Segurança da Informação – Organizacional":"Organizacional",
    "Legal e Regulamentar":                    "Legal e Regulamentar",
    "Estratégico":                             "Estratégico",
    "ESG":                                     "ESG",
}

def level(score: int) -> str:
    if score > 16: return "critical"
    if score >= 10: return "high"
    if score >= 5:  return "medium"
    return "low"

# ---------------------------------------------------------------------------
# Risk data extracted from 5. Registo de Riscos (residual scores)
# ---------------------------------------------------------------------------
RISKS = [
    dict(
        id="R001", name="Falhas em sistemas aplicacionais",
        description="Risco de falhas na performance ou disponibilidade dos sistemas de IT que coloquem em causa a atividade normal da organização.",
        category="Tecnológico", probability=2, impact=2,
        owner="DTI", status="accepted", trend="stable",
    ),
    dict(
        id="R002", name="Falhas na infraestrutura IT",
        description="Risco de falhas na infraestrutura de IT (servidores, redes, telecomunicações) que coloquem em risco a atividade da organização.",
        category="Tecnológico", probability=2, impact=2,
        owner="DTI", status="in_treatment", trend="stable",
    ),
    dict(
        id="R003", name="Ciberataques e malware",
        description="Risco de comprometimento de sistemas e informação por ataques cibernéticos (ransomware, APTs, DDoS, phishing).",
        category="Tecnológico", probability=2, impact=4,
        owner="ISO", status="in_treatment", trend="up",
    ),
    dict(
        id="R004", name="Acessos não autorizados ou excessivos",
        description="Risco de utilizadores (internos ou externos) terem acesso a sistemas ou dados além do necessário para a sua função.",
        category="Tecnológico", probability=2, impact=3,
        owner="ISO", status="in_treatment", trend="stable",
    ),
    dict(
        id="R005", name="Falha na recuperação de backups",
        description="Risco de perda de informação por falhas no processo de backup ou impossibilidade de restauro em tempo útil.",
        category="Tecnológico", probability=1, impact=4,
        owner="DTI - Infra", status="in_treatment", trend="down",
    ),
    dict(
        id="R006", name="Comportamentos de risco por falta de consciencialização",
        description="Risco de incidentes de segurança causados por colaboradores sem formação adequada (phishing, partilha indevida, shadow IT).",
        category="Pessoas", probability=2, impact=3,
        owner="DTI / RH", status="in_treatment", trend="stable",
    ),
    dict(
        id="R007", name="Risco da cadeia de fornecimento (supply chain)",
        description="Risco de comprometimento da segurança através de fornecedores de IT/cloud com acessos privilegiados ou que processem dados da organização.",
        category="Organizacional", probability=2, impact=4,
        owner="DTI / Compras", status="in_treatment", trend="stable",
    ),
    dict(
        id="R008", name="Incumprimento do RGPD",
        description="Risco de violação de obrigações decorrentes do RGPD na recolha, tratamento, conservação e transferência de dados pessoais.",
        category="Legal e Regulamentar", probability=2, impact=4,
        owner="DPO", status="in_treatment", trend="stable",
    ),
    dict(
        id="R009", name="Incumprimento da diretiva NIS2",
        description="Risco de não conformidade com requisitos da diretiva NIS2 enquanto entidade essencial ou importante.",
        category="Legal e Regulamentar", probability=2, impact=3,
        owner="ISO / Compliance", status="in_treatment", trend="stable",
    ),
    dict(
        id="R010", name="Riscos de utilização de serviços cloud",
        description="Risco específico associado à utilização de serviços cloud: má configuração, acessos indevidos, soberania de dados, lock-in.",
        category="Tecnológico", probability=2, impact=3,
        owner="DTI - Cloud", status="in_treatment", trend="stable",
    ),
    dict(
        id="R011", name="Exploração de vulnerabilidades técnicas",
        description="Risco de exploração de vulnerabilidades em sistemas operativos, aplicações ou firmware por falta de patching ou hardening.",
        category="Tecnológico", probability=3, impact=3,
        owner="DTI - Infra", status="in_treatment", trend="up",
    ),
    dict(
        id="R012", name="Falha de continuidade de negócio",
        description="Risco de incapacidade de manter operações críticas em caso de incidente disruptivo (catástrofe, ciberataque major, pandemia).",
        category="Organizacional", probability=1, impact=4,
        owner="DTI / Direção", status="in_treatment", trend="down",
    ),
    dict(
        id="R013", name="Dificuldade na atração e retenção de talento IT",
        description="Risco de não conseguir atrair ou reter talento técnico em áreas críticas (cibersegurança, cloud, IA, dados).",
        category="Estratégico", probability=3, impact=3,
        owner="RH / DTI", status="in_treatment", trend="stable",
    ),
    dict(
        id="R014", name="Pegada ambiental da infraestrutura IT",
        description="Risco associado ao consumo energético de datacenters próprios e de serviços cloud face a metas de descarbonização.",
        category="ESG", probability=2, impact=3,
        owner="DTI / Sustentabilidade", status="open", trend="stable",
    ),
]

# ---------------------------------------------------------------------------
# Action plans from 8. Plano de Tratamento
# ---------------------------------------------------------------------------
STATUS_MAP = {
    "Em curso":      "in_progress",
    "Iniciado":      "in_progress",
    "Não iniciado":  "not_started",
    "Concluído":     "completed",
    "Atrasado":      "delayed",
}

ACTION_PLANS = [
    dict(id="A001", risk_id="R003", title="Expansão do MFA a 100% do portfólio aplicacional (on-premise + cloud)",          owner="DTI - Segurança",     due_date="2026-12-31", status="in_progress"),
    dict(id="A002", risk_id="R003", title="Implementação de plataforma SOAR para automação de resposta a incidentes",        owner="DTI - Segurança",     due_date="2027-03-31", status="in_progress"),
    dict(id="A003", risk_id="R003", title="Contratação de cyber insurance policy",                                           owner="Direção / ISO",      due_date="2026-09-30", status="not_started"),
    dict(id="A004", risk_id="R004", title="Implementar processo de revisão trimestral de acessos a sistemas críticos",       owner="DTI - Segurança",     due_date="2026-07-31", status="in_progress"),
    dict(id="A005", risk_id="R005", title="Implementar regra 3-2-1-1-0 com cópia offline (air-gapped)",                     owner="DTI - Infra",         due_date="2026-08-31", status="in_progress"),
    dict(id="A006", risk_id="R006", title="Implementar simulações de phishing trimestrais com formação personalizada",       owner="ISO / RH",           due_date="2026-12-31", status="in_progress"),
    dict(id="A007", risk_id="R007", title="Implementar processo formal de Third-Party Risk Management (TPRM)",               owner="Compras / ISO",      due_date="2026-12-31", status="not_started"),
    dict(id="A008", risk_id="R008", title="Auditoria anual de conformidade RGPD por entidade externa",                      owner="DPO",                 due_date="2026-11-30", status="not_started"),
    dict(id="A009", risk_id="R009", title="Aprovar política de cibersegurança formal pela Direção",                         owner="ISO / Direção",      due_date="2026-06-30", status="in_progress"),
    dict(id="A010", risk_id="R010", title="Implementar Cloud Security Posture Management (CSPM)",                           owner="DTI - Cloud",         due_date="2026-09-30", status="in_progress"),
    dict(id="A011", risk_id="R011", title="Reduzir SLA de patching crítico de 30 para 7 dias",                              owner="DTI - Infra",         due_date="2026-06-30", status="in_progress"),
    dict(id="A012", risk_id="R011", title="Plano de descomissionamento de sistemas legacy sem suporte",                     owner="DTI - Infra",         due_date="2027-12-31", status="in_progress"),
    dict(id="A013", risk_id="R012", title="Realizar exercício de simulação de DR semestral",                                owner="DTI / Direção",       due_date="2026-11-30", status="not_started"),
    dict(id="A014", risk_id="R013", title="Definir plano de carreira específico para IT com upskilling",                   owner="RH / DTI",            due_date="2026-12-31", status="in_progress"),
    dict(id="A015", risk_id="R014", title="Implementar medição anual da pegada de carbono IT",                              owner="DTI / Sustentabilidade", due_date="2026-12-31", status="not_started"),
]

# ---------------------------------------------------------------------------
# Seed
# ---------------------------------------------------------------------------
def seed():
    db = SessionLocal()
    try:
        existing_ids = {r.id for r in db.query(Risk.id).all()}
        if existing_ids:
            print(f"DB already has {len(existing_ids)} risk(s). Skipping risks already present.")

        added_risks = 0
        risk_id_map: dict[str, str] = {}  # "R001" → actual UUID

        for r in RISKS:
            if r["id"] in existing_ids:
                # Fetch existing UUID for action plan FK
                existing = db.query(Risk).filter(Risk.id == r["id"]).first()
                if existing:
                    risk_id_map[r["id"]] = existing.id
                continue
            score = r["probability"] * r["impact"]
            risk = Risk(
                id=r["id"],
                name=r["name"],
                description=r["description"],
                category=r["category"],
                probability=r["probability"],
                impact=r["impact"],
                score=score,
                level=level(score),
                owner=r["owner"],
                status=r["status"],
                trend=r["trend"],
            )
            db.add(risk)
            risk_id_map[r["id"]] = r["id"]
            added_risks += 1

        db.commit()
        print(f"OK  Added {added_risks} risk(s)")

        # Action plans — stored directly on the Risk model isn't the case,
        # so check if we have an ActionPlan model; if not, skip gracefully.
        try:
            from app.models.action_plan import ActionPlan
            existing_ap_ids = {a.id for a in db.query(ActionPlan.id).all()}
            added_ap = 0
            for ap in ACTION_PLANS:
                if ap["id"] in existing_ap_ids:
                    continue
                risk_fk = risk_id_map.get(ap["risk_id"], ap["risk_id"])
                action = ActionPlan(
                    id=ap["id"],
                    risk_id=risk_fk,
                    title=ap["title"],
                    owner=ap["owner"],
                    due_date=ap["due_date"],
                    status=ap["status"],
                )
                db.add(action)
                added_ap += 1
            db.commit()
            print(f"OK  Added {added_ap} action plan(s)")
        except ImportError:
            print("INFO:   ActionPlan model not found — skipping action plans")

    finally:
        db.close()

if __name__ == "__main__":
    seed()
