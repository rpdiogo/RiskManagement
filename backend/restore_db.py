"""
Restaura `risksafe.db` a partir de `db_snapshot.sql` (baseline partilhado).

Usa isto quando:
  - Fizeste setup numa maquina nova
  - Fizeste `git pull` e o snapshot mudou (novos dados da equipa)
  - Queres repor a tua BD ao baseline canonico

SEGURANCA: a tua BD local atual e copiada para um ficheiro .bak antes de
ser substituida (nao perdes o que tinhas).

NOTA: para a aplicacao antes de correr (Ctrl+C no `npm run dev`), senao a
BD pode estar bloqueada.

    cd backend
    python restore_db.py

Portavel: usa o modulo sqlite3 do Python (nao precisa do CLI `sqlite3`).
"""
import sqlite3
import os
import sys
import shutil
import datetime

DB = "risksafe.db"
SNAP = "db_snapshot.sql"

if not os.path.exists(SNAP):
    print(f"ERRO: '{SNAP}' nao encontrado. Corre este script a partir da pasta backend/.")
    sys.exit(1)

# Backup da BD existente (acesso de leitura funciona mesmo com o servidor a correr)
if os.path.exists(DB):
    ts = datetime.datetime.now().strftime("%Y%m%d-%H%M%S")
    bak = f"{DB}.{ts}.bak"
    try:
        shutil.copy2(DB, bak)
        print(f"INFO  BD anterior guardada em '{bak}'")
    except OSError as e:
        print(f"AVISO  nao foi possivel criar backup: {e}")

# Restauro IN-PLACE: drop de todas as tabelas + reload do snapshot.
# (Evita apagar o ficheiro, que falha no Windows se o servidor o tiver aberto.)
try:
    conn = sqlite3.connect(DB, timeout=5)
    cur = conn.cursor()
    cur.execute("PRAGMA foreign_keys=OFF")
    tables = [r[0] for r in cur.execute(
        "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
    )]
    for t in tables:
        cur.execute(f'DROP TABLE IF EXISTS "{t}"')
    conn.commit()
    with open(SNAP, encoding="utf-8") as f:
        conn.executescript(f.read())
    conn.commit()
except sqlite3.OperationalError as e:
    if "lock" in str(e).lower():
        print("ERRO: a BD esta bloqueada — para a aplicacao (Ctrl+C no 'npm run dev') e tenta de novo.")
        sys.exit(1)
    raise

# Confirmacao
counts = {}
for t in ("risks", "action_plans", "controls", "assets", "vendors"):
    try:
        counts[t] = conn.execute(f"SELECT COUNT(*) FROM {t}").fetchone()[0]
    except sqlite3.OperationalError:
        counts[t] = "-"
conn.close()

summary = " · ".join(f"{k}: {v}" for k, v in counts.items())
print(f"OK  '{DB}' restaurado a partir de '{SNAP}'")
print(f"    {summary}")
