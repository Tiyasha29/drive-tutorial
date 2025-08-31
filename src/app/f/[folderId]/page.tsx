import { files as filesSchema, folders as foldersSchema } from "~/server/db/schema";
import { db } from "~/server/db";
import DriveContents from "~/app/drive-contents";
import { eq } from "drizzle-orm";

export default async function GoogleDriveClone(props: {params: Promise<{ folderId: string }>}) {
  const params = await props.params;

  const parsedForId = parseInt(params.folderId);
  if (isNaN(parsedForId)) {
    return <div>Invalid folder ID</div>;
  }

  const files = await db
  .select()
  .from(filesSchema)
  .where(eq(filesSchema.parent, parsedForId));
  const folders = await db
  .select()
  .from(foldersSchema)
  .where(eq(foldersSchema.parent, parsedForId));

  return (
    <DriveContents files={files} folders={folders}/>
  )
}

