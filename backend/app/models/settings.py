from sqlalchemy import Column, String, Integer, Text
from ..database import Base


class Settings(Base):
    """Single-row settings table. id is always 'default'."""
    __tablename__ = "settings"

    id = Column(String, primary_key=True, default="default")

    # Organização
    org_name                = Column(String,  default="José de Mello")
    org_sector              = Column(String,  default="Saúde / Indústria")
    org_nif                 = Column(String,  default="")
    org_logo_url            = Column(String,  default="")
    org_frameworks          = Column(Text,    default="ISO 27001:2022,NIS2,RGPD")          # CSV
    org_nis2_classification = Column(String,  default="essential")                          # essential | important | none

    # Matriz de Risco
    matrix_size             = Column(Integer, default=5)
    prob_labels             = Column(Text,    default="Raro,Improvável,Possível,Provável,Quase Certo")
    impact_labels           = Column(Text,    default="Insignificante,Menor,Moderado,Maior,Catastrófico")
    threshold_low_max       = Column(Integer, default=4)    # score <= X → low
    threshold_medium_max    = Column(Integer, default=9)    # score <= X → medium
    threshold_high_max      = Column(Integer, default=16)   # score <= X → high; > X → critical
    risk_appetite           = Column(Integer, default=15)   # 1–25
    risk_tolerance          = Column(Integer, default=20)   # 1–25

    # Taxonomia
    risk_categories         = Column(Text,    default="Tecnológico,Pessoas,Organizacional,Legal e Regulamentar,Estratégico,ESG,Operacional,Financeiro,Reputacional")
    asset_types             = Column(Text,    default="Aplicação,Servidor,Base de Dados,Rede,Dados,Cloud,Dispositivo,Documento")

    # Perfil (placeholder até existir sistema de auth)
    user_name               = Column(String,  default="Admin")
    user_email              = Column(String,  default="admin@example.com")
    user_role               = Column(String,  default="ISO")
