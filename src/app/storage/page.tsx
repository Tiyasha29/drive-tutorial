import { columns, type Files, type Folders } from "./columns"
import { MUTATIONS, QUERIES } from "~/server/db/queries"
import { auth } from "@clerk/nextjs/server"
import { folders_table, users_table } from "~/server/db/schema";
import { DataTable } from "~/components/data-table";
import { UserButton } from "@clerk/nextjs";
import { SidebarInset, SidebarProvider } from "~/components/ui/sidebar";
import { AppSidebar } from "~/components/app-sidebar";
import { SiteHeader } from "~/components/site-header";
import { db } from "~/server/db";
import { eq } from "drizzle-orm";
import { DataTableRecent } from "~/components/data-table-recent";


type FolderNameType = typeof folders_table.$inferSelect.name;
type FolderDescriptionType = typeof folders_table.$inferSelect.description;


export default async function DemoPage() {
  
  const session = await auth();
  const { userId } = session;
  if(!userId) {
    throw new Error("Unauthorized");
  }
  const fetchedFiles = await QUERIES.getAllFilesOrderedBySize();
  
  const data = fetchedFiles;

  const sizeInBytesUsedByUser = (await db.select().from(users_table).where(eq(users_table.userId, userId)))[0]?.sizeInBytesUsed ?? 0;

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
        <SiteHeader pageCategory="Storage"/>
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <DataTableRecent columns={columns} data={data} />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}