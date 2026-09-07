import {
  createColumnHelper,
  tableFeatures,
  type ColumnDef,
} from "@tanstack/react-table";

import { User } from "../_types/user";
import { features } from "../_components/table";

// import type { User } from "@/data/users";

const columnHelper = createColumnHelper<typeof features, User>();

export const userColumns = columnHelper.columns([
  {
    accessorKey: "name",
    header: () => <span className="bg-amber-400">NAme</span>,

    // meta: {
    //   align: "center",
    //   width: "10%",
    // },
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "role",
    header: "Role",
  },
  {
    accessorKey: "status",
    header: "Status",
  },
  {
    accessorKey: "balance",
    header: "Balance",
  },
]);
