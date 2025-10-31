"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "./db";
import { files_table, folders_table } from "./db/schema";
import { eq, and } from "drizzle-orm";
import { UTApi } from "uploadthing/server";
import { cookies } from "next/headers";
import { MUTATIONS } from "./db/queries";
import { revalidatePath } from "next/cache";
import z from "zod";

// export async function deleteFile(fileId: number) {
//   const session = await auth();
//   const utApi = new UTApi(); 

//   if (!session.userId) {
//     return { error: "Unauthorized" };
//   }

//   const [file] = await db
//   .select()
//   .from(files_table)
//   .where(and(eq(files_table.id, fileId), eq(files_table.ownerId, session.userId)));

//   if(!file) {
//     return { error: "File not found" };
//   }

//   const utApiResult = await utApi.deleteFiles([file.url.replace("https://ebt4rxu2e3.ufs.sh/f/", "")]);

//   console.log(utApiResult);

//   const dbDeleteResult = await db.delete(files_table)
//   .where(eq(files_table.id, fileId));

//   console.log(dbDeleteResult);

//   const c = await cookies();

//   c.set("force-refresh", JSON.stringify(Math.random()));

//   return { success: true};
// }

export async function deleteFolder(folderId: number) {
  const session = await auth();
  const utApi = new UTApi(); 

  if (!session.userId) {
    return { error: "Unauthorized" };
  }

  await db
  .delete(folders_table)
  .where(and(eq(folders_table.id, folderId), eq(folders_table.ownerId, session.userId)));

  await db
  .delete(files_table)
  .where(and(eq(files_table.parent, folderId), eq(files_table.ownerId, session.userId)));
  
}

export async function deleteFile(fileId: number) {
  const session = await auth();
  const utApi = new UTApi(); 

  if (!session.userId) {
    return { error: "Unauthorized" };
  }

  const [file] = await db
  .select()
  .from(files_table)
  .where(and(eq(files_table.id, fileId), eq(files_table.ownerId, session.userId)));

  if(!file) {
    return { error: "File not found" };
  }

  await utApi.deleteFiles([file.url.replace("https://ebt4rxu2e3.ufs.sh/f/", "")]);


  await db.delete(files_table)
  .where(eq(files_table.id, file.id));

  await MUTATIONS.updateLastModifiedAt(file.parent);


  await MUTATIONS.subtractFromFolderSize({sizeInBytes: file.sizeInBytes, folderId: file.parent});

  revalidatePath(`/my-drive/${file.parent}`);


  return {success: true};
  }

  export async function createFolderAction(formData: FormData) {
  const { userId } = await auth();
  if(!userId) {
    throw new Error("Unauthorized");
  }

  const folderName = JSON.stringify(formData.get("name"));
  const folderDescription = JSON.stringify(formData.get("description"));
  await MUTATIONS.createFolder({
    folder: {
      name: JSON.parse(folderName) as string,
      description: JSON.parse(folderDescription) as string,
      parent: null
    },
    userId
  })
  revalidatePath("/my-drive");
}