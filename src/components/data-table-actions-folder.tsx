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

import { deleteFile, deleteFolder, getFolderOptionsForMovingFolder, moveFolder, moveToBinFolder, renameFile, renameFolder } from "~/server/actions"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog"
import { useRouter } from "next/navigation"
import { Check, ChevronsUpDown, MoreHorizontal, MoreHorizontalIcon } from "lucide-react"
import type { Row } from "@tanstack/react-table"
import { useMutation, useQuery } from "@tanstack/react-query"
import { Input } from "./ui/input"
import { useState } from "react"
import { Field, FieldGroup, FieldLabel } from "./ui/field"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "./ui/alert-dialog"
import { IconEdit, IconFolderSymlink, IconTrash } from "@tabler/icons-react"
import { useUser } from "@clerk/nextjs"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "./ui/command"
import { cn } from "~/lib/utils"


export type Folders = typeof folders_table.$inferSelect;
export type Files = typeof files_table.$inferSelect;

export default function DataTableActionsFolder(props: { row: Row<Folders | Files> }) {
  const { row } = props;
  const router = useRouter();
  const { user, isLoaded } = useUser();

  const [showRenameDialog, setShowRenameDialog] = useState(false)
  const [showMoveToDialog, setShowMoveToDialog] = useState(false);

  const [open, setOpen] = useState(false)
  const [folderValue, setFolderValue] = useState<Folders>();

  const { mutate: server_moveFolderToBin } = useMutation({
    mutationFn: moveToBinFolder,

    onSuccess: () => {
      router.refresh();
    }
  })

  const { mutate: server_renameFolder } = useMutation({
    mutationFn: renameFolder,

    onSuccess: () => {
      router.refresh();
    }
  })

  const { mutate: server_moveFolder } = useMutation({
      mutationFn: moveFolder,
  
      onSuccess: () => {
        router.refresh();
      }
    })

  const { data: server_foldersForMoveFolder} = useQuery({
    queryKey: [row.original.id, user?.id],
    queryFn: () => getFolderOptionsForMovingFolder({ folderId: row.original.id ?? 0, userId: user?.id ?? ""}),
  })

  const folders = server_foldersForMoveFolder?.map((server_folderForMoveFolder) => {
    return {
      ...server_folderForMoveFolder,
      value: server_folderForMoveFolder.name,
      label: server_folderForMoveFolder.name
    }});

  if(row.original.parent !== 0) {
    folders?.unshift({
      id: 0,
      name: "My Drive",
      value: "My Drive",
      label: "My Drive"
    } as any)
  }
  
  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" aria-label="Open menu" size="sm">
            <MoreHorizontalIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-40" align="end">
          <DropdownMenuLabel>Folder Actions</DropdownMenuLabel>
          <DropdownMenuGroup>
            <DropdownMenuItem onSelect={() => setShowRenameDialog(true)}>
              <IconEdit/>Rename
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => server_moveFolderToBin([row.original.id])}>
              <IconTrash/>Move to bin
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setShowMoveToDialog(true)}>
              <IconFolderSymlink/>Move
            </DropdownMenuItem>
            <DropdownMenuItem disabled>Download</DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <Dialog open={showRenameDialog} onOpenChange={setShowRenameDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <form action={server_renameFolder}>
            <DialogHeader>
              <DialogTitle>Rename Folder</DialogTitle>
              <DialogDescription>
                Provide a new name for your folder. Click save when you&apos;re
                done.
              </DialogDescription>
            </DialogHeader>
            <FieldGroup className="pb-3">
              <Field>
                <FieldLabel htmlFor="foldername">Folder Name</FieldLabel>
                <Input id="foldername" name="foldername" defaultValue={row.original.name} />
                <input type="hidden" name="folderId" value={row.original.id} />
              </Field>
            </FieldGroup>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <DialogClose asChild>
                <Button type="submit">Save</Button>
              </DialogClose>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog open={showMoveToDialog} onOpenChange={setShowMoveToDialog}>
      <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Move {row.original.name}</DialogTitle>
            <DialogDescription>
              Move your folder to a new location.
            </DialogDescription>
          </DialogHeader>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-[200px] justify-between"
              >
                {folderValue
                  ? folders?.find((folder) => folder.value === folderValue.name)?.label
                  : "Select folder..."}
                <ChevronsUpDown className="opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
              <Command>
                <CommandInput placeholder="Search folder..." className="h-9" />
                <CommandList>
                  <CommandEmpty>No folder found.</CommandEmpty>
                  <CommandGroup>
                    {folders?.map((folder) => (
                      <CommandItem
                        key={folder.value}
                        value={folder.value}
                        onSelect={(currentValue) => {
                          setFolderValue(folder)
                          setOpen(false)
                        }}
                      >
                        {folder.label}
                        <Check
                          className={cn(
                            "ml-auto",
                            folderValue === folder ? "opacity-100" : "opacity-0"
                          )}
                        />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <DialogClose asChild>
              <Button type="submit" onClick={() => server_moveFolder({folderId: row.original.id, parentId: folderValue?.id?? 0, userId: user?.id ?? ""})}>Move</Button>
            </DialogClose>
          </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  )
}