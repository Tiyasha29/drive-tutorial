/* eslint-disable @typescript-eslint/restrict-template-expressions */
"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal } from "lucide-react"
 
import { Button } from "~/components/ui/button"
import { Checkbox } from "~/components/ui/checkbox"

import { folders_table, type files_table } from "~/server/db/schema"


import dayjs from "dayjs";
import localizedFormat from 'dayjs/plugin/localizedFormat'
import { formatFileSize } from "../utility-functions/format-file-size"
import DataTableActionsFile from "~/components/data-table-actions-file"
import DataTableActionsFolder from "~/components/data-table-actions-folder"
import DataTableActionsSelectedRows from "~/components/data-table-actions-selected-rows"

import { Folder as FolderIcon, File as FileIcon } from 'lucide-react';

import {
  IconStar,
  IconStarFilled
} from "@tabler/icons-react"
import StarAction from "~/components/star-action"
import DataTableActionsForBinFile from "~/components/data-table-actions-for-bin-file"
import DataTableActionsForBinFolder from "~/components/data-table-actions-for-bin-folder"
import OriginalLocation from "~/components/original-location"

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.

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
    id: "icon",
    cell: ({ row }) => {
      return <FileIcon/>
    }
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
    }
  },
  {
    accessorKey: "size",
    header: "Storage used",
    cell: ({ row }) => {
        return <div>{`${row.getValue("size")} ${row.original.sizeUnit}`}</div>    
    }
  },
  {
    id: "actions",
    header: ({ table }) => {
      return (
        <DataTableActionsSelectedRows selectedRows={table.getSelectedRowModel().rows}/>
      )
    }
  },
]