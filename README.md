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

```bash
cd backend
python seed.py
cd ..
```

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

## Dados de Base

O ficheiro `backend/seed.py` popula a base de dados com os 14 riscos e 15 planos de ação extraídos de **Matriz Gestao Risco 2026.xlsx**, com scores residuais e mapeamento de categorias ISO 27001 / NIS2 / ESG.

---

## Repositório

https://github.com/rpdiogo/RiskManagement
