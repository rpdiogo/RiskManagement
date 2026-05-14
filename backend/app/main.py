from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import engine, Base
from .models import risk, tprm  # ensure tables are registered
from .routers import risks
from .routers.tprm import vendors, questionnaires, contracts

Base.metadata.create_all(bind=engine)

app = FastAPI(title="RiskSafe API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(risks.router)
app.include_router(vendors.router)
app.include_router(questionnaires.router)
app.include_router(contracts.router)


@app.get("/health")
def health():
    return {"status": "ok"}
