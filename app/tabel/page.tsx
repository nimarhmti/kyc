"use client";

import { ColumnVisibilityState, PaginationState } from "@tanstack/react-table";
import { userColumns } from "./_column/userColumn";
import { DataTable } from "./_components/table";
import { users } from "./_types/user";
import { useState } from "react";

export default function TablePage() {
  const [columnVisibility, setColumnVisibility] =
    useState<ColumnVisibilityState>({
      email: true,
      role: true,
      status: true,
      balance: true,
    });
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 2,
    pageSize: 10,
  });
  return (
    <div className="p-6">
      <DataTable
        data={users}
        columns={userColumns}
        columnVisibility={columnVisibility}
        onColumnVisibilityChange={setColumnVisibility}
        onPaginationChange={setPagination}
        pagination={pagination}
        // showRowIndex
        rowVariant="striped"
        rowEvenClassName="bg-background"
        rowOddClassName="bg-muted/90 py-2"
      />
    </div>
  );
}
