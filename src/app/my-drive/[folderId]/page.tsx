import { QUERIES } from "~/server/db/queries"
import { DataTableFile } from "~/components/data-table-file";
import { columns } from "../columns";
import DriveUploadButton from "~/components/drive-upload-button";

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
      <DataTableFile columns={columns} data={data}/>
      <div className="absolute top-8 right-4 text-white px-4 py-2 ">
        <DriveUploadButton folderId={folderId}/>
      </div>
    </div>
  )
}