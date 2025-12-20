import { QUERIES } from "~/server/db/queries"
import { columns, type Files, type Folders } from "../columns";
import DriveUploadButton from "~/components/drive-upload-button";
import UploadDropDownFileAndFolder from "~/components/upload-dropdown-file-and-folder";
import { DataTable } from "~/components/data-table";
import { auth } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";
import { SidebarInset, SidebarProvider } from "~/components/ui/sidebar";
import { AppSidebar } from "~/components/app-sidebar";
import { SiteHeader } from "~/components/site-header";

//  async function getData(): Promise<(Folders | Files)[]> {
//    // Fetch data from your API here.

//    const session = await auth();
//    const { userId } = session;
//    if(!userId) {
//      throw new Error("Unauthorized");
//    }
//    const fetchedFolders = QUERIES.getFoldersByOwnerId(userId);

//    return fetchedFolders;
//  }

export default async function DemoPage(props: { params: Promise<{ folderId: string[] }>}) {
  //const router = useRouter();
  //const folderId = parseInt((await props.params).folderId);

  const folderIdArray = (await props.params).folderId;
  const lastFolderIdInURL = parseInt(folderIdArray[folderIdArray.length - 1] ?? "0")
  
  const fetchedFiles = await QUERIES.getFiles(lastFolderIdInURL);
  const fetchedFolders = await QUERIES.getFolders(lastFolderIdInURL);
  const data = [...fetchedFolders, ...fetchedFiles];
  

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <DataTable columns={columns} data={data} />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}