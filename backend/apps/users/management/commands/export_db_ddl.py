from datetime import datetime
from pathlib import Path

from django.apps import apps
from django.conf import settings
from django.core.management.base import BaseCommand
from django.db import connection


SYSTEM_TABLE_PREFIXES = ("auth_", "django_")
SYSTEM_TABLE_EXACT = {"sqlite_sequence"}


class Command(BaseCommand):
    help = "Export current database CREATE TABLE DDL to a .sql file."

    def add_arguments(self, parser):
        parser.add_argument(
            "--output",
            default="docs/db-ddl-current.sql",
            help="Output SQL path, relative to project root.",
        )
        parser.add_argument(
            "--business-only",
            action="store_true",
            help="Export only project business tables.",
        )

    def handle(self, *args, **options):
        output_rel = options["output"]
        business_only = options["business_only"]

        project_root = Path(settings.BASE_DIR).parent
        output_path = project_root / output_rel
        output_path.parent.mkdir(parents=True, exist_ok=True)

        all_tables = self._get_all_tables()
        tables = self._filter_tables(all_tables, business_only=business_only)

        ddl_text = self._build_ddl_text(tables=tables, business_only=business_only)
        output_path.write_text(ddl_text, encoding="utf-8")

        self.stdout.write(self.style.SUCCESS(f"DDL exported: {output_path}"))

    def _get_all_tables(self):
        with connection.cursor() as cursor:
            return sorted(connection.introspection.table_names(cursor))

    def _filter_tables(self, tables, business_only=False):
        if not business_only:
            return tables

        model_tables = self._get_model_tables()
        if model_tables:
            return [table for table in tables if table in model_tables]

        filtered = []
        for table in tables:
            if table in SYSTEM_TABLE_EXACT:
                continue
            if table.startswith(SYSTEM_TABLE_PREFIXES):
                continue
            filtered.append(table)
        return filtered

    def _get_model_tables(self):
        table_names = set()
        for app_config in apps.get_app_configs():
            if not app_config.name.startswith("apps."):
                continue
            for model in app_config.get_models():
                table_names.add(model._meta.db_table)
        return table_names

    def _build_ddl_text(self, tables, business_only=False):
        now_text = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        db_info = connection.settings_dict
        engine = db_info.get("ENGINE", "")
        db_name = db_info.get("NAME", "")

        lines = [
            f"-- DDL export time: {now_text}",
            f"-- Database engine: {engine}",
            f"-- Database name: {db_name}",
            f"-- Filter mode: {'business-only' if business_only else 'all-tables'}",
            f"-- Table count: {len(tables)}",
            "",
        ]

        for table in tables:
            create_sql = self._get_create_table_sql(table)
            if not create_sql:
                continue
            lines.append(f"-- Table: {table}")
            lines.append(create_sql.rstrip().rstrip(";") + ";")
            lines.append("")

        return "\n".join(lines).rstrip() + "\n"

    def _get_create_table_sql(self, table):
        vendor = connection.vendor

        if vendor == "mysql":
            return self._get_create_table_mysql(table)
        if vendor == "sqlite":
            return self._get_create_table_sqlite(table)

        self.stderr.write(
            self.style.WARNING(
                f"Skip table {table}: unsupported database vendor '{vendor}'."
            )
        )
        return ""

    def _get_create_table_mysql(self, table):
        quoted_table = connection.ops.quote_name(table)
        with connection.cursor() as cursor:
            cursor.execute(f"SHOW CREATE TABLE {quoted_table}")
            row = cursor.fetchone()
        if not row or len(row) < 2:
            return ""
        return row[1]

    def _get_create_table_sqlite(self, table):
        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT sql FROM sqlite_master WHERE type = 'table' AND name = %s",
                [table],
            )
            row = cursor.fetchone()
        if not row:
            return ""
        return row[0] or ""

