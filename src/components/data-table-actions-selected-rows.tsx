/* eslint-disable @typescript-eslint/restrict-template-expressions */
"use client"
 
import { Button } from "~/components/ui/button"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"
import { folders_table, files_table } from "~/server/db/schema"

import { deleteFile, deleteFolder, moveToBinFile, moveToBinFolder, renameFile } from "~/server/actions"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog"
import { useRouter } from "next/navigation"
import { MoreHorizontal, MoreHorizontalIcon } from "lucide-react"
import type { Row } from "@tanstack/react-table"
import { useMutation } from "@tanstack/react-query"


export type Folders = typeof folders_table.$inferSelect;
export type Files = typeof files_table.$inferSelect;

export default function DataTableActionsSelectedRows(props: { selectedRows: Row<Folders | Files>[] }) {
  const { selectedRows } = props;
  //const typeOfSelectedRows = selectedRows[0]?.original.type;
  const selectedFolderRowsIds = selectedRows
  .filter((selectedRow) => selectedRow.original.type === "folder")
  .map((selectedRow) => selectedRow.original.id);


  const selectedFileRowsIds = selectedRows
  .filter((selectedRow) => selectedRow.original.type === "file")
  .map((selectedRow) => selectedRow.original.id);
  
  const router = useRouter();

  const { mutate: server_moveToBinFile } = useMutation({
    mutationFn: moveToBinFile,
    
    onSuccess: () => {
      router.refresh();
    }
  })

  const { mutate: server_moveToBinFolder } = useMutation({
    mutationFn: moveToBinFolder,

    onSuccess: () => {
      router.refresh();
    }
  })
  
  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" aria-label="Open menu" size="sm">
            <MoreHorizontalIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-40" align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={async() => {
                server_moveToBinFolder(selectedFolderRowsIds);
                server_moveToBinFile(selectedFileRowsIds);
              }}>
              Move to bin
            </DropdownMenuItem>
            <DropdownMenuItem disabled>Download</DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}