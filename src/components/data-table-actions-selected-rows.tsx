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

import { deleteFile, deleteFolder, renameFile } from "~/server/actions"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog"
import { useRouter } from "next/navigation"
import { MoreHorizontal, MoreHorizontalIcon } from "lucide-react"
import type { Row } from "@tanstack/react-table"
import { useMutation } from "@tanstack/react-query"
import { Input } from "./ui/input"
import { useState } from "react"
import { Field, FieldGroup, FieldLabel } from "./ui/field"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "./ui/alert-dialog"


export type Folders = typeof folders_table.$inferSelect;
export type Files = typeof files_table.$inferSelect;

export default function DataTableActionsSelectedRows(props: { selectedRows: Row<Folders | Files>[] }) {
  const { selectedRows } = props;
  const typeOfSelectedRows = selectedRows[0]?.original.type;
  const router = useRouter();

  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const { mutate: server_deleteFile } = useMutation({
    mutationFn: deleteFile,
    
    onSuccess: () => {
      router.refresh();
    }
  })

  const { mutate: server_deleteFolder } = useMutation({
    mutationFn: deleteFolder,

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
            <DropdownMenuItem onSelect={() => setShowDeleteDialog(true)}>
              Delete Selected
            </DropdownMenuItem>
            <DropdownMenuItem disabled>Download</DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your
                data and remove your data from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={async() => {
                if(typeOfSelectedRows === "folder"){
                  server_deleteFolder(selectedRows.map((selectedRow) => selectedRow.original.id));
                } else {
                  server_deleteFile(selectedRows.map((selectedRow) => selectedRow.original.id));
                }
              }}>Continue</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
    </>
  )
}