import { columns, type Files, type Folders } from "./columns"
import { DataTable } from "../../components/data-table"
import { QUERIES } from "~/server/db/queries"
import { auth } from "@clerk/nextjs/server"

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
      <DataTable columns={columns} data={data} />
    </div>
  )
}