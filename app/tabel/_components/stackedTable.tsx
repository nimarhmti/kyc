"use client";

import type { RowData, Table } from "@tanstack/react-table";
import { flexRender } from "@tanstack/react-table";

type DataTableMobileStackedProps<TData extends RowData> = {
  table: Table<TData>;
};

function getColumnLabel<TData extends RowData>(
  column: ReturnType<Table<TData>["getAllColumns"]>[number],
) {
  const header = column.columnDef.header;

  if (typeof header === "string") {
    return header;
  }

  return column.id;
}

export function DataTableMobileStacked<TData extends RowData>({
  table,
}: DataTableMobileStackedProps<TData>) {
  const rows = table.getRowModel().rows;

  return (
    <div className="flex flex-col gap-3">
      {rows.map((row) => (
        <div key={row.id} className="rounded-xl bg-card p-4">
          <div className="flex flex-col gap-3">
            {row.getVisibleCells().map((cell) => (
              <div
                key={cell.id}
                className="flex items-center justify-between gap-4"
              >
                <span className="shrink-0 text-sm text-muted-foreground">
                  {getColumnLabel(cell.column)}
                </span>

                <span className="min-w-0 text-end text-sm font-medium text-foreground">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
