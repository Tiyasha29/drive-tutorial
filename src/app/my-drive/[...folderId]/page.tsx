import { QUERIES } from "~/server/db/queries"
import { DataTableFile } from "~/components/data-table-file";
import { columns, type Files, type Folders } from "../columns";
import DriveUploadButton from "~/components/drive-upload-button";
import UploadDropDownFileAndFolder from "~/components/upload-dropdown-file-and-folder";
import { DataTable } from "~/components/data-table";
import { auth } from "@clerk/nextjs/server";

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
    <div className="container mx-auto py-10">
      <DataTable columns={columns} data={data}/>
      <div className="absolute top-8 right-4 text-white px-4 py-2 ">
        {/* <DriveUploadButton folderId={folderId}/> */}


        <UploadDropDownFileAndFolder folderId={lastFolderIdInURL}/>
      </div>
    </div>
  )
}