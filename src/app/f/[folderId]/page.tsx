import DriveContents from "~/app/drive-contents";
import { QUERIES } from "~/server/db/queries";

export default async function GoogleDriveClone(props: {params: Promise<{ folderId: string }>}) {
  const params = await props.params;

  const parsedForId = parseInt(params.folderId);
  if (isNaN(parsedForId)) {
    return <div>Invalid folder ID</div>;
  }

  const [folders, files, parents] = await Promise.all([QUERIES.getFolders(parsedForId), QUERIES.getFiles(parsedForId), QUERIES.getAllParentsForFolder(parsedForId)]);

  return (
    <DriveContents files={files} folders={folders} parents={parents} currentFolderId={parsedForId}/>
  )
}

