# RiskSafe — Plataforma de Gestão de Risco

Plataforma web full-stack para gestão de risco corporativo e de terceiros (TPRM), desenvolvida para o Grupo José de Mello.

---

## Tecnologias

| Camada | Stack |
|---|---|
| Frontend | React 18 + TypeScript + Vite + Tailwind CSS v3 |
| Gráficos | Recharts |
| Estado do servidor | TanStack Query (React Query) |
| Formulários | React Hook Form + Zod |
| Backend | FastAPI + SQLAlchemy + SQLite |
| Runner | concurrently |

---

## Estrutura do Projeto

```
RiskManagement/
├── backend/                  # API FastAPI (Python)
│   ├── app/
│   │   ├── models/           # ORM models (Risk, ActionPlan, Vendor, ...)
│   │   ├── routers/          # Endpoints REST
│   │   └── main.py           # App entry point
│   ├── seed.py               # Script de seed com dados do Excel
│   ├── requirements.txt
│   └── .venv/
├── risksafe/                 # Frontend React + TypeScript
│   ├── src/
│   │   ├── api/              # Clientes da API (risks, tprm)
│   │   ├── components/       # Componentes reutilizáveis
│   │   ├── pages/            # Páginas da aplicação
│   │   └── types/            # TypeScript interfaces
│   └── package.json
└── package.json              # Runner raiz (concurrently)
```

---

## Arranque Rápido

### Pré-requisitos

- Node.js >= 18
- Python >= 3.11

### 1. Instalar dependências

```bash
# Dependências raiz (runner)
npm install

# Dependências frontend
cd risksafe && npm install && cd ..

# Dependências backend
cd backend
python -m venv .venv
.venv\Scripts\activate        # Windows
pip install -r requirements.txt
cd ..
```

### 2. Popular a base de dados (primeira vez)

A base de dados (`backend/risksafe.db`) **não está em git** (é um binário). Os dados
partilhados da equipa vivem no snapshot versionável `backend/db_snapshot.sql`.

Restaura o **baseline partilhado completo** (36 riscos, 116 controlos, 16 ativos, …):

```bash
cd backend
python restore_db.py
cd ..
```

> Alternativa só com o baseline mínimo do Excel (14 riscos): `python seed.py`

### 3. Iniciar a aplicação

```bash
npm run dev
```

Abre dois processos em paralelo:
- **API** → http://localhost:8000
- **UI** → http://localhost:5173

---

## Módulos

### Dashboard (`/`)
Visão geral com KPIs, gráficos de distribuição por nível e categoria, heatmap de risco e indicadores de segurança.

### Gestão de Riscos (`/riscos`)
Registo completo de riscos com CRUD, pesquisa, filtro por nível e 9 categorias:
`Tecnológico`, `Pessoas`, `Processos`, `Terceiros`, `Físico`, `Organizacional`, `Legal e Regulamentar`, `Estratégico`, `ESG`

### Planos de Ação (`/planos`)
Acompanhamento das ações de mitigação com barra de progresso global, filtro por estado e CRUD completo.

### TPRM — Gestão de Terceiros
| Página | Rota |
|---|---|
| Fornecedores | `/tprm/fornecedores` |
| Avaliações | `/tprm/avaliacoes` |
| Questionários | `/tprm/questionarios` |
| Contratos | `/tprm/contratos` |

---

## API

Documentação interativa disponível em http://localhost:8000/docs (Swagger UI) após iniciar o backend.

### Endpoints principais

| Método | Endpoint | Descrição |
|---|---|---|
| GET | `/api/dashboard/summary` | Resumo para o dashboard |
| GET/POST | `/api/risks/` | Listar / criar riscos |
| PUT/DELETE | `/api/risks/{id}` | Editar / eliminar risco |
| GET/POST | `/api/action-plans/` | Listar / criar planos de ação |
| PUT/DELETE | `/api/action-plans/{id}` | Editar / eliminar plano |
| GET/POST | `/api/vendors/` | Fornecedores |
| GET/POST | `/api/questionnaires/` | Questionários |
| GET/POST | `/api/contracts/` | Contratos |

---

## Dados de Base & Sincronização entre Devs

A `risksafe.db` é local a cada dev e **gitignored** (binário, com locks — não versionável).
A **fonte de verdade partilhada** é `backend/db_snapshot.sql` — um dump SQL em texto,
versionável e diffável.

### Fluxo de trabalho

| Ação | Comando | Quando |
|---|---|---|
| **Restaurar** baseline | `cd backend && python restore_db.py` | Setup novo · depois de `git pull` se o snapshot mudou |
| **Atualizar** snapshot | `cd backend && python dump_db.py` | Depois de alterares dados canónicos que a equipa deve ter |

> ⚠️ **Para a aplicação** (Ctrl+C no `npm run dev`) antes de restaurar — senão a BD está bloqueada.
> O `restore_db.py` guarda automaticamente a tua BD atual num ficheiro `.bak` antes de substituir.

### Convenção da equipa

1. O `db_snapshot.sql` é o **dataset canónico** — todos partem dele.
2. Quem alterar dados que **todos** devem ter (novos riscos, controlos…) corre `python dump_db.py`, faz commit do `db_snapshot.sql` e avisa a equipa.
3. Edições locais de teste **não** são commitadas — ficam só na `risksafe.db` local.
4. Evitar dois devs a atualizarem o snapshot em simultâneo (gera conflito no `.sql`). Coordenar.

### Seeds (baseline de raiz)

| Script | Conteúdo |
|---|---|
| `seed.py` | 14 riscos + 15 planos de **Matriz Gestao Risco 2026.xlsx** (scores residuais, categorias ISO/NIS2/ESG) |
| `seed_nis2.py` | Controlos baseline NIS2 |
| `seed_iso27001.py` | 93 controlos Anexo A ISO 27001:2022 |

> Os seeds dão o baseline **mínimo**. Para o estado **completo e atual** da equipa, usa `restore_db.py`.

---

## Repositório

https://github.com/rpdiogo/RiskManagement
