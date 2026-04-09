from datetime import datetime
from pathlib import Path

from django.conf import settings
from django.core.management.base import BaseCommand
from django.db import connection


SYSTEM_TABLE_PREFIXES = ("auth_", "django_")
SYSTEM_TABLE_EXACT = {"sqlite_sequence"}


class Command(BaseCommand):
    help = "Export current database schema and ER relationships to a Markdown file."

    def add_arguments(self, parser):
        parser.add_argument(
            "--output",
            default="docs/db-er-current.md",
            help="Output markdown path, relative to project root.",
        )
        parser.add_argument(
            "--business-only",
            action="store_true",
            help="Exclude Django/framework system tables.",
        )

    def handle(self, *args, **options):
        output_rel = options["output"]
        business_only = options["business_only"]

        project_root = Path(settings.BASE_DIR).parent
        output_path = project_root / output_rel
        output_path.parent.mkdir(parents=True, exist_ok=True)

        tables = self._get_tables(business_only=business_only)
        constraints = self._get_constraints(tables)
        columns_map = self._get_columns_map(tables)

        markdown = self._build_markdown(
            tables=tables,
            constraints=constraints,
            columns_map=columns_map,
            business_only=business_only,
        )

        output_path.write_text(markdown, encoding="utf-8")
        self.stdout.write(self.style.SUCCESS(f"Schema exported: {output_path}"))

    def _get_tables(self, business_only=False):
        with connection.cursor() as cursor:
            tables = sorted(connection.introspection.table_names(cursor))

        if not business_only:
            return tables

        filtered = []
        for table in tables:
            if table in SYSTEM_TABLE_EXACT:
                continue
            if table.startswith(SYSTEM_TABLE_PREFIXES):
                continue
            filtered.append(table)
        return filtered

    def _get_constraints(self, tables):
        constraints = {}
        with connection.cursor() as cursor:
            introspection = connection.introspection
            for table in tables:
                constraints[table] = introspection.get_constraints(cursor, table)
        return constraints

    def _get_columns_map(self, tables):
        if connection.vendor == "mysql":
            return self._get_columns_map_mysql(tables)
        return self._get_columns_map_fallback(tables)

    def _get_columns_map_mysql(self, tables):
        result = {}
        with connection.cursor() as cursor:
            for table in tables:
                cursor.execute(
                    """
                    SELECT
                        COLUMN_NAME,
                        COLUMN_TYPE,
                        IS_NULLABLE,
                        COLUMN_DEFAULT,
                        EXTRA
                    FROM information_schema.COLUMNS
                    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = %s
                    ORDER BY ORDINAL_POSITION
                    """,
                    [table],
                )
                result[table] = [
                    {
                        "name": row[0],
                        "type": row[1],
                        "nullable": row[2] == "YES",
                        "default": row[3],
                        "extra": row[4],
                    }
                    for row in cursor.fetchall()
                ]
        return result

    def _get_columns_map_fallback(self, tables):
        result = {}
        with connection.cursor() as cursor:
            introspection = connection.introspection
            for table in tables:
                fields = introspection.get_table_description(cursor, table)
                columns = []
                for field in fields:
                    field_type = introspection.get_field_type(field.type_code, field)
                    columns.append(
                        {
                            "name": field.name,
                            "type": field_type,
                            "nullable": getattr(field, "null_ok", True),
                            "default": getattr(field, "default", None),
                            "extra": "",
                        }
                    )
                result[table] = columns
        return result

    def _build_markdown(self, tables, constraints, columns_map, business_only):
        now_text = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        db_info = connection.settings_dict
        engine = db_info.get("ENGINE", "")
        db_name = db_info.get("NAME", "")

        lines = [
            "# 数据库结构与 ER 关系（自动导出）",
            "",
            f"- 导出时间：`{now_text}`",
            f"- 数据库引擎：`{engine}`",
            f"- 数据库名：`{db_name}`",
            f"- 表数量：`{len(tables)}`",
            f"- 过滤模式：`{'仅业务表' if business_only else '全部表'}`",
            "",
            "## ER 关系图（Mermaid）",
            "",
            "```mermaid",
            "erDiagram",
        ]

        relation_lines = self._build_er_lines(constraints)
        if relation_lines:
            lines.extend(relation_lines)
        else:
            lines.append("  %% No foreign key relationships found")

        lines.extend(["```", "", "## 表字段清单", ""])

        for table in tables:
            lines.extend(self._build_table_section(table, constraints[table], columns_map.get(table, [])))

        return "\n".join(lines) + "\n"

    def _build_er_lines(self, constraints):
        lines = []
        for child_table, cons in constraints.items():
            for item in cons.values():
                fk = item.get("foreign_key")
                if not fk:
                    continue
                parent_table, parent_col = fk
                child_cols = item.get("columns") or []
                child_col = child_cols[0] if child_cols else ""
                label = f"{child_col} -> {parent_col}" if child_col else "references"
                lines.append(f"  {parent_table} ||--o{{ {child_table} : \"{label}\"")
        return sorted(set(lines))

    def _build_table_section(self, table, table_constraints, columns):
        pk_columns = set()
        fk_map = {}

        for item in table_constraints.values():
            cols = item.get("columns") or []
            if item.get("primary_key"):
                pk_columns.update(cols)
            fk = item.get("foreign_key")
            if fk and cols:
                fk_map[cols[0]] = f"{fk[0]}.{fk[1]}"

        lines = [
            f"### `{table}`",
            "",
            "| 字段 | 类型 | 可空 | 默认值 | 主键 | 外键引用 |",
            "|---|---|---|---|---|---|",
        ]

        for col in columns:
            default_val = "" if col["default"] is None else str(col["default"])
            if col.get("extra"):
                default_val = f"{default_val} {col['extra']}".strip()

            lines.append(
                "| {name} | {type_} | {nullable} | {default} | {pk} | {fk} |".format(
                    name=col["name"],
                    type_=col["type"],
                    nullable="是" if col["nullable"] else "否",
                    default=default_val or "",
                    pk="是" if col["name"] in pk_columns else "否",
                    fk=fk_map.get(col["name"], ""),
                )
            )

        lines.append("")
        return lines

