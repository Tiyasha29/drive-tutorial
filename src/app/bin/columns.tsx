/* eslint-disable @typescript-eslint/restrict-template-expressions */
"use client";

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
import OriginalLocationForBin from "~/components/original-location-for-bin";

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
      return (row.original.type === "folder") ? <FolderIcon/> : <FileIcon/>
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
    accessorKey: "binnedAt",
    header: "Date binned",
    cell: ({ row }) => {

      dayjs.extend(localizedFormat);
      const formattedDate = dayjs(new Date(row.getValue("binnedAt"))).format('lll');
  
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
    accessorKey: "originalLocation",
    header: "Original location",
    cell: ({ row }) => {
      return (
      <OriginalLocationForBin id={row.original.parent ?? 0}/>
      )
      
    }
  },
  {
    id: "actions",
    header: ({ table }) => {
      return (
        <DataTableActionsSelectedRows selectedRows={table.getSelectedRowModel().rows}/>
      )
    },
    cell: ({ row }) => {
 
        if (row.original.type === "file" && row.original.isBinned === false) {
          return <DataTableActionsFile row={row}/>;
        } else if (row.original.type === "folder" && row.original.isBinned === false) {
          return <DataTableActionsFolder row={row}/>;
        } else if(row.original.type === "file" && row.original.isBinned === true) {
          return <DataTableActionsForBinFile row={row}/>;
        } else if(row.original.type === "folder" && row.original.isBinned === true) {
          return <DataTableActionsForBinFolder row={row}/>;
        }
    },
  },
]