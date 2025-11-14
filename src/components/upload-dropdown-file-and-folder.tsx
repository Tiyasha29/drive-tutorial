"use client";

import { useState } from "react"
import { Button } from "./ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import { Field, FieldGroup, FieldLabel } from "./ui/field"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Textarea } from "./ui/textarea"
import { MoreHorizontalIcon, Plus } from "lucide-react"
import { createFolderAction } from "~/server/actions";
import DriveUploadButton from "./drive-upload-button";
import { usePathname } from "next/navigation";

export default function UploadDropDownFileAndFolder(props: {folderId: number}) {
  const [showCreateNewFolderDialog, setShowCreateNewFolderDialog] = useState(false)
  const [showShareDialog, setShowShareDialog] = useState(false)

  const pathname = usePathname();

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button><Plus/> New</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-40" align="end">
          <DropdownMenuLabel>File Actions</DropdownMenuLabel>
          <DropdownMenuGroup>
            <DropdownMenuItem onSelect={() => setShowCreateNewFolderDialog(true)}>
              New Folder
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setShowShareDialog(true)}>
              Folder Upload
            </DropdownMenuItem>
            <DriveUploadButton folderId={props.folderId}/>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <Dialog open={showCreateNewFolderDialog} onOpenChange={setShowCreateNewFolderDialog}>
        <DialogContent className="sm:max-w-[425px]">   
          <form action={createFolderAction}>         
            <DialogHeader>
              <DialogTitle>New folder</DialogTitle>
              <DialogDescription>
                Create a new folder here. Click create when you&apos;re
                done.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4">
              <div className="grid gap-3">
                <Label htmlFor="name-1">Name</Label>
                <Input id="name-1" name="name" defaultValue="New Folder" minLength={1} required/>
              </div>
              <div className="grid gap-3">
                <Label htmlFor="description-1">Description</Label>
                <Input id="description-1" name="description" defaultValue="" />
              </div>
              <Input name="parent" defaultValue={props.folderId} hidden/>
              <Input name="pathanme" defaultValue={pathname} hidden/>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <DialogClose asChild>
                <Button type="submit">Create</Button>
              </DialogClose>
            </DialogFooter>
          </form>  
        </DialogContent>
      </Dialog>
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Share File</DialogTitle>
            <DialogDescription>
              Anyone with the link will be able to view this file.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup className="py-3">
            <Field>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="shadcn@vercel.com"
                autoComplete="off"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="message">Message (Optional)</FieldLabel>
              <Textarea
                id="message"
                name="message"
                placeholder="Check out this file"
              />
            </Field>
          </FieldGroup>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit">Send Invite</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}