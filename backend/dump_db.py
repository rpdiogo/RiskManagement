"""
Regenera `db_snapshot.sql` a partir da BD atual (`risksafe.db`).

O snapshot e a FONTE DE VERDADE versionavel dos dados baseline partilhados
entre todos os devs. Corre isto sempre que alterares os dados canonicos e
queiras versiona-los para a equipa:

    cd backend
    python dump_db.py
    git add db_snapshot.sql
    git commit -m "chore: update db snapshot"
    git push

Portavel: usa o modulo sqlite3 do Python (nao precisa do CLI `sqlite3`).
"""
import sqlite3
import os
import sys
import datetime

DB = "risksafe.db"
OUT = "db_snapshot.sql"

if not os.path.exists(DB):
    print(f"ERRO: '{DB}' nao encontrado. Corre este script a partir da pasta backend/.")
    sys.exit(1)

conn = sqlite3.connect(DB)
with open(OUT, "w", encoding="utf-8") as f:
    f.write("-- ============================================================\n")
    f.write("-- RiskSafe - Snapshot completo da BD (BASELINE PARTILHADO)\n")
    f.write(f"-- Gerado: {datetime.date.today().isoformat()}\n")
    f.write("-- Fonte de verdade versionavel dos dados. Sem PII / sem segredos.\n")
    f.write("--\n")
    f.write("-- Restaurar:  python restore_db.py\n")
    f.write("-- Atualizar:  python dump_db.py\n")
    f.write("-- ============================================================\n\n")
    for line in conn.iterdump():
        f.write(line + "\n")
conn.close()

inserts = sum(1 for line in open(OUT, encoding="utf-8") if line.startswith("INSERT"))
size_kb = os.path.getsize(OUT) // 1024
print(f"OK  '{OUT}' atualizado: {inserts} registos, {size_kb} KB")
print("    Faz commit + push para partilhar com a equipa.")
