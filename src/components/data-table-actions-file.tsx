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

import { deleteFile, deleteFolder, getFolderOptionsForMovingFile, moveFile, moveToBinFile, renameFile } from "~/server/actions"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog"
import { useRouter } from "next/navigation"
import { Check, ChevronsUpDown, MoreHorizontal, MoreHorizontalIcon } from "lucide-react"
import type { Row } from "@tanstack/react-table"
import { useMutation, useQuery } from "@tanstack/react-query"
import { Input } from "./ui/input"
import { useState } from "react"
import { Field, FieldGroup, FieldLabel } from "./ui/field"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "./ui/alert-dialog"
import { IconEdit, IconFolderSymlink, IconTrash, IconUserPlus } from "@tabler/icons-react"
import { Label } from "./ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "./ui/command"
import { cn } from "~/lib/utils"
import { useUser } from "@clerk/nextjs"


export type Folders = typeof folders_table.$inferSelect;
export type Files = typeof files_table.$inferSelect;

export default function DataTableActionsFile(props: { row: Row<Folders | Files> }) {

//   const folders = [
//   {
//     value: "next.js",
//     label: "Next.js",
//   },
//   {
//     value: "sveltekit",
//     label: "SvelteKit",
//   },
//   {
//     value: "nuxt.js",
//     label: "Nuxt.js",
//   },
//   {
//     value: "remix",
//     label: "Remix",
//   },
//   {
//     value: "astro",
//     label: "Astro",
//   },
// ]

  const { row } = props;
  const router = useRouter();
  const { user } = useUser();
  const [showRenameDialog, setShowRenameDialog] = useState(false)
  const [showShareDialog, setShowShareDialog] = useState(false)
  const [showMoveToDialog, setShowMoveToDialog] = useState(false);

  const [open, setOpen] = useState(false)
  const [folderValue, setFolderValue] = useState<Folders>();

  const { mutate: server_moveFileToBin } = useMutation({
    mutationFn: moveToBinFile,
    
    onSuccess: () => {
      router.refresh();
    }
  })

  const { mutate: server_renameFile } = useMutation({
    mutationFn: renameFile,

    onSuccess: () => {
      router.refresh();
    }
  })

  const { mutate: server_moveFile } = useMutation({
    mutationFn: moveFile,

    onSuccess: () => {
      router.refresh();
    }
  })

  const { data: server_foldersForMoveFile} = useQuery({
    queryKey: [row.original.parent, user?.id],
    queryFn: () => getFolderOptionsForMovingFile({ excludedFolderId: row.original.parent ?? 0, userId: user?.id ?? ""}),
  })
  
  const folders = server_foldersForMoveFile?.map((server_folderForMoveFile) => {
    return {
      ...server_folderForMoveFile,
      value: server_folderForMoveFile.name,
      label: server_folderForMoveFile.name
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
          <DropdownMenuLabel>File Actions</DropdownMenuLabel>
          <DropdownMenuGroup>
            <DropdownMenuItem onSelect={() => setShowRenameDialog(true)}>
              <IconEdit/>Rename
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => server_moveFileToBin([row.original.id])}>
              <IconTrash/>Move to bin
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setShowShareDialog(true)}>
              <IconUserPlus/>Share
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
          <form action={server_renameFile}>
            <DialogHeader>
              <DialogTitle>Rename File</DialogTitle>
              <DialogDescription>
                Provide a new name for your file. Click save when you&apos;re
                done.
              </DialogDescription>
            </DialogHeader>
            <FieldGroup className="pb-3">
              <Field>
                <FieldLabel htmlFor="filename">File Name</FieldLabel>
                <Input id="filename" name="filename" defaultValue={row.original.name.split(".")[0]} />
                <input type="hidden" name="fileId" value={row.original.id} />
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
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share link</DialogTitle>
          <DialogDescription>
            Anyone who has this link will be able to view this file.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center gap-2">
          <div className="grid flex-1 gap-2">
            <Label htmlFor="link" className="sr-only">
              Link
            </Label>
            <Input
              id="link"
              defaultValue={(row.original as { url: string }).url}
              readOnly
            />
          </div>
        </div>
        <DialogFooter className="sm:justify-start">
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    <Dialog open={showMoveToDialog} onOpenChange={setShowMoveToDialog}>
      <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Move {row.original.name}</DialogTitle>
            <DialogDescription>
              Move your file to a new location.
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
              <Button type="submit" onClick={() => server_moveFile({fileId: row.original.id, parentId: folderValue?.id?? 0, userId: user?.id ?? ""})}>Move</Button>
            </DialogClose>
          </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  )
}