"use client";

import { cn } from "@/lib/utils";
import {
  flexRender,
  tableFeatures,
  useTable,
  columnVisibilityFeature,
  ColumnVisibilityState,
  metaHelper,
  rowPaginationFeature,
} from "@tanstack/react-table";
type DataTableRowVariant = "default" | "striped";
import type {
  ColumnDef,
  RowData,
  CellData,
  PaginationState,
  OnChangeFn,
} from "@tanstack/react-table";
type DataTableMobileMode = "table" | "stacked";
type DataTableColumnMeta = {
  align?: "start" | "center" | "end";
  width?: number | string;
};

const columnAlignClasses = {
  start: "text-start",
  center: "text-center",
  end: "text-end",
} as const;
function getColumnAlignClass(align?: DataTableColumnMeta["align"]) {
  return columnAlignClasses[align ?? "start"];
}

function getColumnStyle(meta?: DataTableColumnMeta): React.CSSProperties {
  return {
    width: meta?.width,
  };
}
export const features = tableFeatures({
  columnVisibilityFeature,
  rowPaginationFeature,
  columnMeta: metaHelper<DataTableColumnMeta>(),
});

type DataTableProps<TData extends RowData> = {
  data: TData[];
  columns: ColumnDef<typeof features, TData, CellData>[];
  columnVisibility?: ColumnVisibilityState;
  onColumnVisibilityChange?: (
    updater:
      | ColumnVisibilityState
      | ((prev: ColumnVisibilityState) => ColumnVisibilityState),
  ) => void;
  pagination?: PaginationState;
  onPaginationChange?: OnChangeFn<PaginationState>;
  showRowIndex?: boolean;
  rowVariant?: DataTableRowVariant;
  rowClassName?: string;
  rowEvenClassName?: string;
  rowOddClassName?: string;
  mobileMode?: DataTableMobileMode;
};

export function DataTable<TData extends RowData>({
  data,
  columns,
  columnVisibility,
  onColumnVisibilityChange,
  pagination,
  onPaginationChange,
  showRowIndex = false,
  rowVariant = "default",
  rowClassName,
  rowEvenClassName,
  rowOddClassName,
  mobileMode = "table",
}: DataTableProps<TData>) {
  const table = useTable({
    features,
    columns,
    data,
    state: {
      columnVisibility,
      pagination,
    },
    onPaginationChange,
    onColumnVisibilityChange,
  });

  const getRowClassName = (index: number) => {
    if (rowVariant === "striped") {
      return index % 2 === 0 ? rowEvenClassName : rowOddClassName;
    }

    return rowClassName;
  };

  const rows = table.getRowModel().rows;

  return (
    <div className="w-full ">
      {mobileMode === "table" ? (
        <div className="w-full overflow-x-auto no-scrollbar ">
          <table className="w-full min-w-100 table-auto!">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {showRowIndex && <th></th>}

                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className={getColumnAlignClass(
                        header.column.columnDef.meta?.align,
                      )}
                      style={getColumnStyle(header.column.columnDef.meta)}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>

            <tbody>
              {table.getRowModel().rows.map((row, rowIndex) => {
                const index =
                  (pagination?.pageIndex ?? 0) *
                    (pagination?.pageSize ?? table.getRowModel().rows.length) +
                  rowIndex +
                  1;

                return (
                  <tr key={row.id}>
                    {showRowIndex && <td>{index}</td>}

                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className={cn(
                          "whitespace-nowrap pe-4",
                          getColumnAlignClass(
                            cell.column.columnDef.meta?.align,
                          ),
                          getRowClassName(index),
                        )}
                        style={getColumnStyle(cell.column.columnDef.meta)}
                      >
                        <table.FlexRender cell={cell} />
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {rows.map((row) => (
            <div key={row.id} className="max-w-70 rounded-xl  p-4">
              <div className="flex flex-col gap-3">
                {row.getVisibleCells().map((cell) => {
                  const header = table
                    .getHeaderGroups()
                    .flatMap((headerGroup) => headerGroup.headers)
                    .find((header) => header.column.id === cell.column.id);
                  return (
                    <div
                      key={cell.id}
                      className="flex items-center justify-between gap-4"
                    >
                      {header && !header.isPlaceholder && (
                        <span className="shrink-0 text-sm text-muted-foreground">
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                        </span>
                      )}

                      <span className="min-w-0 text-end text-sm font-medium text-foreground">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
