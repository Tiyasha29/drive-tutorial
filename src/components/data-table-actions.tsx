/* eslint-disable @typescript-eslint/restrict-template-expressions */
"use client"
 
import { Button } from "~/components/ui/button"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"
import { folders_table, type files_table } from "~/server/db/schema"


import { deleteFile, deleteFolder } from "~/server/actions"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog"
import { useRouter } from "next/navigation"
import { MoreHorizontal } from "lucide-react"
import type { ColumnDef, Row } from "@tanstack/react-table"
import { useMutation } from "@tanstack/react-query"
import { Spinner } from "./ui/spinner"

export type Folders = typeof folders_table.$inferSelect;
export type Files = typeof files_table.$inferSelect;

export default function DataTableActions(props: { row: Row<Folders | Files> }) {
  const { row } = props;
  const router = useRouter();

  const { mutate: server_deleteFile, status } = useMutation({
    mutationFn: deleteFile,
    
    onSuccess: () => {
      router.refresh();
    }
  })
  
  return (
    <Dialog>
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
              <DialogTrigger asChild>
              <DropdownMenuItem>
                Delete
              </DropdownMenuItem>
              </DialogTrigger>
            </DropdownMenuContent>
          </DropdownMenu>
          <DialogContent>
              <DialogHeader>
                <DialogTitle>Are you absolutely sure?</DialogTitle>
                <DialogDescription>
                  This action cannot be undone. Are you sure you want to permanently
                  delete this file from our servers?
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>               
                  {(status === "pending") ? 
                  <Button>
                    <Spinner/> 
                    Loading...
                  </Button>
                  :
                <DialogClose asChild>
                <Button onClick={async() => {
                  if(typeof row.original === typeof folders_table.$inferSelect) {
                await deleteFolder(row.original.id);
              } else {
                server_deleteFile(row.original.id);
              }
                }}>Confirm</Button>
                </DialogClose>}
                
              </DialogFooter>
          </DialogContent>
        </Dialog>
  )
}