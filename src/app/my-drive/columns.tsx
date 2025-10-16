/* eslint-disable @typescript-eslint/restrict-template-expressions */
"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal } from "lucide-react"
 
import { Button } from "~/components/ui/button"
import { Checkbox } from "~/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"
import { folders_table, type files_table } from "~/server/db/schema"


import dayjs from "dayjs";
import localizedFormat from 'dayjs/plugin/localizedFormat'
import { MUTATIONS } from "~/server/db/queries"
import { deleteFile, deleteFolder } from "~/server/actions"
import { useRouter } from "next/navigation"
import { formatFileSize } from "../utility-functions/format-file-size"

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.

// export type Folders = {
//   name: typeof folders_table.$inferSelect.name,
//   type: typeof folders_table.$inferSelect.type,
//   lastUpdatedAt: typeof folders_table.$inferSelect.lastUpdatedAt,
//   size: typeof folders_table.$inferSelect.size,
//   sizeUnit: typeof folders_table.$inferSelect.sizeUnit,
// }


// export type Files = {
//   name: typeof files_table.$inferSelect.name,
//   type: typeof folders_table.$inferSelect.type,
//   lastUpdatedAt: typeof files_table.$inferSelect.lastUpdatedAt,
//   size: typeof files_table.$inferSelect.size,
//   sizeUnit: typeof files_table.$inferSelect.sizeUnit,
// }

export type Folders = typeof folders_table.$inferSelect;
export type Files = typeof files_table.$inferSelect;


export const columns: ColumnDef<(Folders | Files)>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: "lastUpdatedAt",
    header: "Last modified",
    cell: ({ row }) => {

      dayjs.extend(localizedFormat);
      const formattedDate = dayjs(new Date(row.getValue("lastUpdatedAt"))).format('lll');
  

      return <div>{formattedDate}</div>;
    }
  },
  {
    accessorKey: "size",
    header: "Size",
    cell: ({ row }) => {
      if (row.original.type === "file"){
        return <div>{`${row.getValue("size")} ${row.original.sizeUnit}`}</div>
      } else {
        const { fileSize, fileSizeUnit } = formatFileSize(row.original.size);
        return <div>{`${fileSize} ${fileSizeUnit}`}</div>
      }
      
    }
  },
  {
    id: "actions",
    cell: ({ row }) => {
 
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => {return}}
            >
              Rename
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={async() => {
                if(typeof row.original === typeof folders_table.$inferSelect) {
                  await deleteFolder(row.original.id);
                } else {
                  await deleteFile(row.original.id);
                }
              }}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]