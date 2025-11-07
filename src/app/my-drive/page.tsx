import { columns, type Files, type Folders } from "./columns"
import { MUTATIONS, QUERIES } from "~/server/db/queries"
import { auth } from "@clerk/nextjs/server"
import { Button } from "~/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { folders_table } from "~/server/db/schema";
import { createFolderAction } from "~/server/actions";
import { DataTableFolder } from "~/components/data-table-folder";


type FolderNameType = typeof folders_table.$inferSelect.name;
type FolderDescriptionType = typeof folders_table.$inferSelect.description;

 
async function getData(): Promise<(Folders | Files)[]> {
  // Fetch data from your API here.

  const session = await auth();
  const { userId } = session;
  if(!userId) {
    throw new Error("Unauthorized");
  }
  const fetchedFolders = QUERIES.getFoldersByOwnerId(userId);

  return fetchedFolders;
}

export default async function DemoPage() {
  const data = await getData()

  return (
      <div className="container mx-auto py-10">
        <Dialog>         
            <DialogTrigger asChild>
              <Button className="absolute top-8 right-4 h-15 w-18">
                <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24" //coordinates from (0,0) to (24, 24)
                        stroke="currentColor"
                        width="2em" //2 times the font size
                        height="2em" 
                        className="text-primary-foreground"
                      >
                        <path d="M9 4.5v15m7.5-7.5h-15" />
                </svg>
                <div className="text-primary-foreground">
                  New
                </div>
              </Button>
            </DialogTrigger>
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
        <DataTableFolder columns={columns} data={data} />
      </div>
      
  )
}