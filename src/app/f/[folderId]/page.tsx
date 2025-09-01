import DriveContents from "~/app/drive-contents";
import { getAllParentsForFolder, getFiles, getFolders } from "~/server/db/queries";

export default async function GoogleDriveClone(props: {params: Promise<{ folderId: string }>}) {
  const params = await props.params;

  const parsedForId = parseInt(params.folderId);
  if (isNaN(parsedForId)) {
    return <div>Invalid folder ID</div>;
  }

  const [folders, files, parents] = await Promise.all([getFolders(parsedForId), getFiles(parsedForId), getAllParentsForFolder(parsedForId)]);

  return (
    <DriveContents files={files} folders={folders} parents={parents}/>
  )
}

