"""
Seed script — adiciona os controlos NIS2 (Diretiva (UE) 2022/2555)
na totalidade, categorizados como 'Regulamentar'.

Cobre os artigos com obrigações ao nível das entidades:
- Art. 20 — Governança (responsabilidade do órgão de administração)
- Art. 21(2)(a–j) — 10 medidas obrigatórias de gestão de risco
- Art. 21(3) — Considerações específicas sobre fornecedores
- Art. 21(4) — Medidas corretivas em caso de não conformidade
- Art. 23(4)(a) — Alerta precoce 24h
- Art. 23(4)(b) — Notificação de incidente 72h
- Art. 23(4)(d) — Relatório final 1 mês
- Art. 23(1)/(2) — Comunicação a destinatários dos serviços
- Art. 24      — Utilização de sistemas europeus de certificação
- Art. 27      — Registo de entidades (digital service providers)
- Art. 29      — Acordos de partilha de informações
- Art. 30      — Notificação voluntária (quase-incidentes / ameaças)
- Art. 32      — Cooperação com medidas de supervisão
- Art. 35      — Coordenação RGPD em incidentes com dados pessoais

Status/effectiveness inferidos a partir dos riscos e action plans existentes.
"""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
import sqlite3

DB = os.path.join(os.path.dirname(__file__), "risksafe.db")

NIS2_CONTROLS = [
    # ─── Art. 20 — Governança ────────────────────────────────────────────
    (
        "NIS2.20", "NIS2.20",
        "Governança — Responsabilidade do órgão de administração",
        "O órgão de administração das entidades essenciais e importantes aprova as medidas de gestão de risco de cibersegurança, supervisiona a sua implementação e é responsabilizável por incumprimentos. Os membros são obrigados a frequentar ações de formação periódicas para identificarem e avaliarem práticas de gestão de risco de cibersegurança.",
        "NIS2 Art.20",
        "partial", "needs_improvement", "Direção / ISO",
        "R009",
        "Plano A009 (aprovação formal da política pela Direção) em curso. Falta plano de formação obrigatória para Conselho de Administração.",
    ),

    # ─── Art. 21(2) — 10 Medidas Obrigatórias ────────────────────────────
    (
        "NIS2.21.2.a", "NIS2.21.2.a",
        "Políticas de análise de risco e segurança dos sistemas de informação",
        "Estabelecer políticas formais para análise de risco e para a segurança dos sistemas de informação, documentadas, aprovadas pela direção e revistas periodicamente. Aplicar abordagem baseada em todos os riscos (cyber, físico, ambiental, humano).",
        "NIS2 Art.21(2)(a)",
        "partial", "needs_improvement", "ISO",
        "R009",
        "Processo de gestão de risco está operacional (esta plataforma). Política formal NIS2-aligned ainda não aprovada pela Direção.",
    ),
    (
        "NIS2.21.2.b", "NIS2.21.2.b",
        "Tratamento de incidentes",
        "Procedimentos para deteção, análise, contenção, erradicação, recuperação e lições aprendidas de incidentes. Classificação por severidade, cadeia de escalonamento documentada, equipa de resposta (CSIRT/SOC interno ou externo) com competências definidas.",
        "NIS2 Art.21(2)(b)",
        "partial", "needs_improvement", "ISO / DTI - Segurança",
        "R035,R009",
        "Equipa de resposta informal existe. Falta runbook documentado, classificação de incidentes e teste do processo de escalonamento.",
    ),
    (
        "NIS2.21.2.c", "NIS2.21.2.c",
        "Continuidade das atividades, backup e gestão de crises",
        "Inclui: gestão de cópias de segurança (3-2-1), recuperação após desastre (DR) com RTO/RPO definidos por sistema crítico, plano de continuidade de negócio (BCP) testado periodicamente, e gestão de crises com porta-vozes e comunicação interna/externa.",
        "NIS2 Art.21(2)(c)",
        "not_implemented", "ineffective", "Direção / DTI",
        "R012,R005,R024",
        "Risco R012 — ausência de BCP formal. Backups existem (Commvault) mas crisis management não está formalizado.",
    ),
    (
        "NIS2.21.2.d", "NIS2.21.2.d",
        "Segurança da cadeia de fornecimento",
        "Avaliação e gestão dos riscos decorrentes das relações com fornecedores diretos e prestadores de serviços. Inclui due diligence pré-contratual, cláusulas de segurança obrigatórias, direito de auditoria, requisitos de notificação de incidentes pelo fornecedor.",
        "NIS2 Art.21(2)(d)",
        "planned", "untested", "Compras / ISO",
        "R007,R024,R033",
        "Plano A007 (TPRM formal) ainda não iniciado. Sem questionários de avaliação enviados a fornecedores críticos.",
    ),
    (
        "NIS2.21.2.e", "NIS2.21.2.e",
        "Segurança na aquisição, desenvolvimento e manutenção de sistemas",
        "Inclui gestão de vulnerabilidades técnicas, divulgação coordenada (CVD), revisão de código segura, requisitos de segurança no SDLC, e gestão de patches em prazos definidos por criticidade.",
        "NIS2 Art.21(2)(e)",
        "partial", "needs_improvement", "DTI - Infra / DTI - Dev",
        "R011,R003",
        "Patching crítico ainda em 30 dias (plano A011 para reduzir a 7). Sem programa formal de vulnerability disclosure.",
    ),
    (
        "NIS2.21.2.f", "NIS2.21.2.f",
        "Políticas e procedimentos de avaliação da eficácia das medidas",
        "Mecanismos para avaliar periodicamente a eficácia das medidas implementadas: auditorias internas, testes de intrusão, exercícios de simulação (red/purple team), métricas KPI/KRI de cibersegurança e reporting periódico ao órgão de administração.",
        "NIS2 Art.21(2)(f)",
        "not_implemented", "untested", "ISO / Auditoria Interna",
        "R009",
        "Sem auditorias internas planeadas, sem pentest periódico, sem framework de KPIs de cibersegurança.",
    ),
    (
        "NIS2.21.2.g", "NIS2.21.2.g",
        "Higiene cibernética básica e formação em cibersegurança",
        "Programas de formação obrigatória para todos os colaboradores e formação especializada para perfis técnicos. Cobre phishing, password hygiene, classificação da informação, procedimentos de reporte e práticas seguras em mobilidade/teletrabalho.",
        "NIS2 Art.21(2)(g)",
        "partial", "needs_improvement", "ISO / RH",
        "R006",
        "Plano A006 (simulações trimestrais de phishing) em execução. Falta currículo formal e completion tracking.",
    ),
    (
        "NIS2.21.2.h", "NIS2.21.2.h",
        "Políticas e procedimentos sobre criptografia e cifragem",
        "Política formal de criptografia: algoritmos aprovados (ex: AES-256, RSA-2048+), gestão de chaves (KMS), cifragem de dados em repouso (databases, backups, endpoints) e em trânsito (TLS 1.2+). Aplicação especial para dados pessoais.",
        "NIS2 Art.21(2)(h)",
        "partial", "needs_improvement", "DTI - Segurança",
        "R033,R008",
        "TLS/HTTPS em uso. Falta política formal, inventário de uso de cifragem em databases e gestão centralizada de chaves.",
    ),
    (
        "NIS2.21.2.i", "NIS2.21.2.i",
        "Segurança de recursos humanos, controlo de acessos e gestão de ativos",
        "Política de acesso baseada em least-privilege, revisão periódica de acessos, gestão do ciclo joiners-movers-leavers, due diligence em onboarding, inventário atualizado de ativos com classificação de criticidade.",
        "NIS2 Art.21(2)(i)",
        "partial", "needs_improvement", "DTI - Segurança / RH",
        "R004,R009",
        "Plano A004 (revisão trimestral de acessos) em curso. Inventário de ativos parcial.",
    ),
    (
        "NIS2.21.2.j", "NIS2.21.2.j",
        "Autenticação multifator (MFA) e comunicações seguras",
        "MFA obrigatório para acessos privilegiados e a sistemas críticos. Comunicações de voz, vídeo e texto cifradas dentro da entidade. Sistemas seguros de comunicação de emergência (out-of-band) para gestão de crises quando os canais habituais estão comprometidos.",
        "NIS2 Art.21(2)(j)",
        "partial", "needs_improvement", "DTI - Segurança",
        "R003,R004",
        "Plano A001 (expansão MFA a 100% do portfólio) em curso. Comunicações de emergência out-of-band não definidas.",
    ),

    # ─── Art. 21(3) — Considerações específicas sobre fornecedores ───────
    (
        "NIS2.21.3", "NIS2.21.3",
        "Considerações específicas sobre cada fornecedor direto",
        "Ao avaliar fornecedores, ter em conta as vulnerabilidades específicas de cada fornecedor direto, a qualidade global dos produtos e as práticas de cibersegurança dos fornecedores (incluindo procedimentos de desenvolvimento seguro), e os resultados de avaliações coordenadas a nível da UE (Art. 22) sobre cadeias de abastecimento críticas.",
        "NIS2 Art.21(3)",
        "not_implemented", "untested", "Compras / ISO",
        "R007,R033",
        "Sem matriz de avaliação por fornecedor. Aguardar publicação das avaliações coordenadas UE (DNS, cloud, MSP).",
    ),

    # ─── Art. 21(4) — Medidas corretivas ─────────────────────────────────
    (
        "NIS2.21.4", "NIS2.21.4",
        "Medidas corretivas em caso de não conformidade",
        "Quando a entidade conclui que não cumpre as medidas do Art. 21(2), deve tomar todas as medidas corretivas necessárias, adequadas e proporcionadas, sem demora injustificada. Implica processo formal de gap assessment, planos de remediação com prazos, e tracking de progresso.",
        "NIS2 Art.21(4)",
        "partial", "needs_improvement", "ISO",
        "R009",
        "Esta plataforma (planos de ação) suporta gap remediation. Falta gap assessment formal contra Art. 21(2).",
    ),

    # ─── Art. 23 — Obrigações de notificação ─────────────────────────────
    (
        "NIS2.23.4.a", "NIS2.23.4.a",
        "Alerta precoce — 24 horas",
        "Comunicação inicial ao CSIRT competente (em PT: CNCS) no prazo de 24h após tomada de conhecimento de incidente significativo. Deve indicar se há suspeita de ato ilícito/malicioso e se pode ter impacto transfronteiriço.",
        "NIS2 Art.23(4)(a)",
        "not_implemented", "ineffective", "ISO",
        "R035",
        "Sem procedimento definido. Sem canal estabelecido com o CNCS (CSIRT nacional PT).",
    ),
    (
        "NIS2.23.4.b", "NIS2.23.4.b",
        "Notificação de incidente — 72 horas",
        "Notificação completa ao CSIRT em 72h após tomada de conhecimento de incidente significativo. Atualiza o alerta precoce com avaliação inicial do incidente, severidade, impacto e indicadores de exposição a riscos disponíveis (IoCs).",
        "NIS2 Art.23(4)(b)",
        "not_implemented", "ineffective", "ISO",
        "R035",
        "Risco R035 explicitamente identifica esta lacuna. Sem template, sem owner, sem cadeia de escalonamento.",
    ),
    (
        "NIS2.23.4.d", "NIS2.23.4.d",
        "Relatório final — 1 mês",
        "Relatório final ao CSIRT em 1 mês após a notificação de 72h, contendo: descrição pormenorizada do incidente e impacto, tipo de ameaça/causa primária, medidas de mitigação aplicadas, impacto transfronteiriço (se aplicável). Se incidente em curso à data, apresentar relatório intercalar.",
        "NIS2 Art.23(4)(d)",
        "not_implemented", "ineffective", "ISO",
        "R035",
        "Sem template de post-incident review formalizado.",
    ),
    (
        "NIS2.23.dest", "NIS2.23.dest",
        "Comunicação a destinatários dos serviços afetados",
        "Quando um incidente significativo possa afetar negativamente a prestação de serviços, comunicar sem demora indevida aos destinatários (clientes/utilizadores). Quando há ciberameaça significativa que os pode afetar, comunicar as medidas/soluções que podem adotar.",
        "NIS2 Art.23(1)/(2)",
        "not_implemented", "ineffective", "ISO / Comunicação",
        "R035",
        "Sem template de comunicação externa de incidentes. Sem matriz de decisão sobre quando comunicar.",
    ),

    # ─── Art. 24 — Certificação ──────────────────────────────────────────
    (
        "NIS2.24", "NIS2.24",
        "Utilização de sistemas europeus de certificação de cibersegurança",
        "Quando aplicável, utilizar produtos, serviços e processos TIC certificados ao abrigo de esquemas europeus de certificação (EUCC para produtos, EUCS para serviços cloud) para demonstrar conformidade. A Comissão pode tornar obrigatório em setores específicos por atos delegados.",
        "NIS2 Art.24",
        "not_applicable", "untested", "DTI / Compras",
        "",
        "Esquemas EUCC/EUCS ainda em adoção pelos fornecedores. Reavaliar em 2027.",
    ),

    # ─── Art. 27 — Registo de entidades ──────────────────────────────────
    (
        "NIS2.27", "NIS2.27",
        "Registo de entidades junto da autoridade nacional",
        "Aplicável a prestadores de serviços de DNS, registos TLD, prestadores de serviços de nuvem, centros de dados, CDN, MSP, MSSP, marketplaces online, motores de pesquisa e plataformas de redes sociais. Devem registar-se até 17/01/2025 junto da autoridade nacional, fornecendo nome, setor, contactos, endereços IP e EMs onde prestam serviços.",
        "NIS2 Art.27",
        "not_applicable", "untested", "ISO",
        "",
        "Não aplicável — a organização não opera nenhum dos serviços digitais listados no Art. 27(1). O estatuto NIS2 é atribuído pela autoridade competente via Anexo I/II.",
    ),

    # ─── Art. 29 — Partilha de informações ───────────────────────────────
    (
        "NIS2.29", "NIS2.29",
        "Acordos de partilha de informações sobre cibersegurança",
        "Participação voluntária em acordos formais de partilha de informação cyber (ISACs, comunidades setoriais, plataformas TIC dedicadas) para troca de IoCs, TTPs, tendências de ameaças e boas práticas. Notificar a autoridade competente da adesão e saída.",
        "NIS2 Art.29",
        "not_implemented", "untested", "ISO",
        "",
        "Sem participação em ISACs ou comunidades setoriais. Avaliar adesão ao H-ISAC (saúde) e CNCS Community.",
    ),

    # ─── Art. 30 — Notificação voluntária ────────────────────────────────
    (
        "NIS2.30", "NIS2.30",
        "Notificação voluntária de quase-incidentes e ciberameaças",
        "Para além das notificações obrigatórias (Art. 23), as entidades podem notificar voluntariamente ao CSIRT: quase-incidentes (near-misses), ciberameaças detetadas e incidentes não-significativos. Beneficia da partilha agregada de tendências pela ENISA.",
        "NIS2 Art.30",
        "not_implemented", "untested", "ISO",
        "",
        "Sem processo definido para canalizar near-misses ao CNCS.",
    ),

    # ─── Art. 32 — Cooperação com supervisão ─────────────────────────────
    (
        "NIS2.32", "NIS2.32",
        "Cooperação com medidas de supervisão e execução",
        "Cooperação plena com a autoridade nacional competente em medidas de supervisão: inspeções in loco e fora do local, auditorias de segurança (regulares e ad-hoc), análises de segurança (scans), pedidos de informação, acesso a dados, documentos e medidas implementadas. Aplicável a entidades essenciais.",
        "NIS2 Art.32",
        "not_implemented", "untested", "ISO / Direção",
        "",
        "Sem auditorias da autoridade competente realizadas até à data. Capacidade de resposta a pedidos formais por testar.",
    ),

    # ─── Art. 35 — Coordenação RGPD ──────────────────────────────────────
    (
        "NIS2.35", "NIS2.35",
        "Coordenação RGPD-NIS2 em incidentes com dados pessoais",
        "Quando um incidente significativo NIS2 implica violação de dados pessoais, articular as notificações: 24h CSIRT (NIS2) + 72h CNPD (RGPD). Procedimento conjunto único, evitando duplicação. As autoridades NIS2 e RGPD cooperam entre si.",
        "NIS2 Art.35 + RGPD Art.33",
        "partial", "needs_improvement", "ISO / DPO",
        "R035,R008,R033",
        "DPO designado. Procedimento conjunto NIS2+RGPD para incidentes mistos ainda não documentado.",
    ),
]


def seed():
    conn = sqlite3.connect(DB)
    cur  = conn.cursor()

    # Limpar controlos NIS2 existentes para reinserção limpa
    cur.execute("SELECT COUNT(*) FROM controls WHERE id LIKE 'NIS2.%'")
    existing = cur.fetchone()[0]
    if existing > 0:
        print(f"A apagar {existing} controlos NIS2 existentes...")
        cur.execute("DELETE FROM controls WHERE id LIKE 'NIS2.%'")

    added = 0
    for (cid, code, name, desc, fw_refs, status, eff, owner, risk_ids, notes) in NIS2_CONTROLS:
        cur.execute("""
            INSERT INTO controls (id, code, name, description, category, framework_refs, status, effectiveness, owner, risk_ids, notes)
            VALUES (?, ?, ?, ?, 'Regulamentar', ?, ?, ?, ?, ?, ?)
        """, (cid, code, name, desc, fw_refs, status, eff, owner, risk_ids, notes))
        added += 1

    conn.commit()
    print(f"OK — {added} controlos NIS2 inseridos.")

    # Resumo
    cur.execute("SELECT status, COUNT(*) FROM controls WHERE category='Regulamentar' GROUP BY status ORDER BY 2 DESC")
    print("\nResumo por estado:")
    for r in cur.fetchall():
        print(f"  {r[0]}: {r[1]}")

    cur.execute("SELECT COUNT(*) FROM controls")
    total = cur.fetchone()[0]
    cur.execute("SELECT COUNT(*) FROM controls WHERE category='Regulamentar'")
    nis2 = cur.fetchone()[0]
    print(f"\nTotal de controlos na plataforma: {total} ({nis2} NIS2 + {total - nis2} ISO 27001)")

    conn.close()


if __name__ == "__main__":
    seed()
