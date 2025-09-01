import { files as filesSchema, folders as foldersSchema } from "~/server/db/schema";
import { db } from "~/server/db";
import DriveContents from "~/app/drive-contents";
import { eq } from "drizzle-orm";

async function getAllParents(folderId: number) {
  const parents = [];
  let currentId: number | null = folderId;
  while (currentId !== null) {
    const folder = await db
    .selectDistinct()
    .from(foldersSchema)
    .where(eq(foldersSchema.id, currentId));

    if(!folder[0]) {
      throw new Error("Folder not found");
    }

    parents.unshift(folder[0]);
    currentId = folder[0]?.parent;
  }
  return parents;
}

export default async function GoogleDriveClone(props: {params: Promise<{ folderId: string }>}) {
  const params = await props.params;

  const parsedForId = parseInt(params.folderId);
  if (isNaN(parsedForId)) {
    return <div>Invalid folder ID</div>;
  }

  const filesPromise = db
  .select()
  .from(filesSchema)
  .where(eq(filesSchema.parent, parsedForId));

  const foldersPromise = db
  .select()
  .from(foldersSchema)
  .where(eq(foldersSchema.parent, parsedForId));

  const parentsPromise = getAllParents(parsedForId);

  const [folders, files, parents] = await Promise.all([foldersPromise, filesPromise, parentsPromise]);

  return (
    <DriveContents files={files} folders={folders} parents={parents}/>
  )
}

