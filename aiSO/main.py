"""
Entry points for the aiSO compliance agent platform.

Commands:
    python main.py ingest              Ingest all PDFs in knowledge_base/documents/
    python main.py ingest --reset      Wipe and re-ingest
    python main.py ingest --file X.pdf Ingest a single file
    python main.py stats               Show knowledge base summary
    python main.py search "query"      Test retrieval from the CLI
"""

import argparse
import sys

from rich.console import Console
from rich.table import Table

console = Console()


def cmd_ingest(args) -> None:
    from knowledge_base.ingestion.ingestor import ingest_all, ingest_file, _get_collection
    from config import DOCUMENTS_DIR
    from pathlib import Path

    if args.file:
        col = _get_collection(reset=args.reset)
        ingest_file(Path(args.file).resolve(), col)
    else:
        ingest_all(DOCUMENTS_DIR, reset=args.reset)



def cmd_stats(args) -> None:
    from knowledge_base.retrieval.retriever import collection_stats
    stats = collection_stats()

    console.print(f"\n[bold]Knowledge Base[/bold] - {stats['total_chunks']} chunks total\n")
    table = Table("Source", "Chunks", show_header=True)
    for source, count in sorted(stats["sources"].items(), key=lambda x: -x[1]):
        table.add_row(source, str(count))
    console.print(table)


def cmd_search(args) -> None:
    from knowledge_base.retrieval.retriever import retrieve
    query = " ".join(args.query)
    console.print(f"\n[bold]Query:[/bold] {query}\n")
    results = retrieve(query, n_results=args.n)
    for i, r in enumerate(results, 1):
        console.rule(f"[{i}] {r.family} - {r.topic}  |  score {r.score}")
        console.print(f"[dim]{r.source_file}  sec:{r.section_id}  {r.heading}[/dim]")
        console.print(r.text[:600])
        console.print()


def main() -> None:
    parser = argparse.ArgumentParser(prog="aiSO", description="Cybersecurity Compliance Agent")
    sub = parser.add_subparsers(dest="command")

    p_ingest = sub.add_parser("ingest", help="Ingest PDFs into the knowledge base")
    p_ingest.add_argument("--file", help="Path to a single PDF")
    p_ingest.add_argument("--reset", action="store_true", help="Wipe existing data first")

    sub.add_parser("stats", help="Show knowledge base summary")

    p_search = sub.add_parser("search", help="Test semantic search")
    p_search.add_argument("query", nargs="+", help="Search query")
    p_search.add_argument("-n", type=int, default=5, help="Number of results")

    args = parser.parse_args()

    if args.command == "ingest":
        cmd_ingest(args)
    elif args.command == "stats":
        cmd_stats(args)
    elif args.command == "search":
        cmd_search(args)
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
