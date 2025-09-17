import { QUERIES } from "~/server/db/queries"
import { DataTable } from "~/components/data-table";
import { columns } from "../columns";
import DriveUploadButton from "~/components/drive-upload-button";
import { ModeToggle } from "~/components/mode-toggle";

// async function getData(): Promise<Folders[]> {
//   // Fetch data from your API here.

//   const session = await auth();
//   const { userId } = session;
//   if(!userId) {
//     throw new Error("Unauthorized");
//   }
//   const fetchedFolders = QUERIES.getFoldersByOwnerId(userId);

//   return fetchedFolders;
// }

export default async function DemoPage(props: { params: Promise<{ folderId: string }>}) {
  const folderId = parseInt((await props.params).folderId);
  const data =await  QUERIES.getFiles(folderId);
  
  //const router = useRouter();

  return (
    <div className="container mx-auto py-10">
      <ModeToggle/>
      <DataTable columns={columns} data={data}/>
      <div className="absolute top-8 right-4 bg-blue-500 text-white px-4 py-2 rounded-4xl">
        <DriveUploadButton folderId={folderId}/>
      </div>
    </div>
  )
}