"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "./db";
import { files_table, folders_table, users_table } from "./db/schema";
import { eq, and, inArray, sql } from "drizzle-orm";
import { UTApi } from "uploadthing/server";
import { MUTATIONS, QUERIES } from "./db/queries";
import { revalidatePath } from "next/cache";
import { updateLastModifiedAtAllParents } from "~/app/utility-functions/update-last-modified-at-all-parents";
import { subtractFromFolderSizeAllParents } from "~/app/utility-functions/subtract-from-folder-size-all-parents";

export type Folders = typeof folders_table.$inferSelect;
export type Files = typeof files_table.$inferSelect;

// export async function deleteFolder(folderIds: number[]) {
//   const session = await auth();
//   const utApi = new UTApi();

//   if (!session.userId) {
//     return { error: "Unauthorized" };
//   }

//   const folders = await db
//     .select()
//     .from(folders_table)
//     .where(
//       and(
//         inArray(folders_table.id, folderIds),
//         eq(folders_table.ownerId, session.userId),
//       ),
//     );

//   const files = await db
//     .select()
//     .from(files_table)
//     .where(inArray(files_table.parent, folderIds));

//   if (folders.length === 0) {
//     return { error: "Folder Not Found" };
//   }

//   await db.delete(files_table).where(inArray(files_table.parent, folderIds));
//   await db.delete(folders_table).where(inArray(folders_table.id, folderIds));

//   const filesDeleteKeys = files.map((file) =>
//     file.url.replace("https://ebt4rxu2e3.ufs.sh/f/", ""),
//   );

//   await utApi.deleteFiles(filesDeleteKeys);

//   folders.forEach(async (folder) => {
//     if (folder.parent === null) folder.parent = 0; //Can be deleted later - changed all folder parent ids to 0 for home page
//     updateLastModifiedAtAllParents(folder.parent);

//     subtractFromFolderSizeAllParents({
//       size: folder.size,
//       parentFolderId: folder.parent,
//     });
//   });

//   return { success: true };
// }

export async function getUserById(userId: string) {
  const user = await QUERIES.getUserByUserId(userId);
  if (user !== undefined) {
    return user;
  }
}

export async function deleteFolder(folderIds: number[]) {
  const session = await auth();
  const utApi = new UTApi();

  if (!session.userId) {
    return { error: "Unauthorized" };
  }

  const folders = await db
    .select()
    .from(folders_table)
    .where(
      and(
        inArray(folders_table.id, folderIds),
        eq(folders_table.ownerId, session.userId),
      ),
    );

  //Collect ALL descendant folders recursively
  async function getAllDescendantFolders(ids: number[]): Promise<number[]> {
    const children = await db
      .select()
      .from(folders_table)
      .where(inArray(folders_table.parent, ids)); //children of all selected folders

    if (children.length === 0) return ids;

    const childIds = children.map((f) => f.id); //storing ids of all children in childIds

    const deeper = await getAllDescendantFolders(childIds); //recursively calling with new child IDs as IDs

    return [...ids, ...childIds, ...deeper];
  }

  // get all folders we need to delete (selected + children)
  const allFolderIds = Array.from(
    new Set(await getAllDescendantFolders(folderIds)),
  );

  // Get all files in all of these folders
  const allFiles = await db
    .select()
    .from(files_table)
    .where(inArray(files_table.parent, allFolderIds));

  let totalSizeInBytesToBeSubtracted = 0;

  allFiles.forEach((file) => {
    totalSizeInBytesToBeSubtracted += file.sizeInBytes;
  });

  await db
    .update(users_table)
    .set({
      numberOfFilesUploaded: sql`${users_table.numberOfFilesUploaded} - ${allFiles.length}`,
    })
    .where(eq(users_table.userId, session.userId));

  await MUTATIONS.subtractFromSizeUsedByUser(
    session.userId,
    totalSizeInBytesToBeSubtracted,
  );

  // Delete all files in UploadThing
  const fileKeys = allFiles.map((file) =>
    file.url.replace("https://ebt4rxu2e3.ufs.sh/f/", ""),
  );
  if (fileKeys.length > 0) {
    await utApi.deleteFiles(fileKeys);
  }

  // Delete files from DB
  await db.delete(files_table).where(inArray(files_table.parent, allFolderIds));

  // Delete all folders from DB
  await db.delete(folders_table).where(inArray(folders_table.id, allFolderIds));

  folders.forEach(async (folder) => {
    if (folder.parent === null) folder.parent = 0; //Can be deleted later - changed all folder parent ids to 0 for home page
    updateLastModifiedAtAllParents(folder.parent);

    subtractFromFolderSizeAllParents({
      size: folder.size,
      parentFolderId: folder.parent,
    });
  });

  await db
    .update(users_table)
    .set({
      numberOfFoldersUploaded: sql`${users_table.numberOfFoldersUploaded} - ${allFolderIds.length}`,
    })
    .where(eq(users_table.userId, session.userId));

  return { success: true };
}

export async function deleteFile(fileIds: number[]) {
  const session = await auth();
  const utApi = new UTApi();

  if (!session.userId) {
    return { error: "Unauthorized" };
  }

  const files = await db
    .select()
    .from(files_table)
    .where(
      and(
        inArray(files_table.id, fileIds),
        eq(files_table.ownerId, session.userId),
      ),
    );

  if (files.length === 0) {
    return { error: "File not found" };
  }

  const filesDeleteKeys = files.map((file) =>
    file.url.replace("https://ebt4rxu2e3.ufs.sh/f/", ""),
  );

  await utApi.deleteFiles(filesDeleteKeys);

  await db.delete(files_table).where(inArray(files_table.id, fileIds));

  let totalSizeInBytesToBeSubtracted = 0;

  files.forEach(async (file) => {
    updateLastModifiedAtAllParents(file.parent);

    subtractFromFolderSizeAllParents({
      size: file.sizeInBytes,
      parentFolderId: file.parent,
    });

    totalSizeInBytesToBeSubtracted += file.sizeInBytes;
  });

  await db
    .update(users_table)
    .set({
      numberOfFilesUploaded: sql`${users_table.numberOfFilesUploaded} - ${files.length}`,
    })
    .where(eq(users_table.userId, session.userId));

  await MUTATIONS.subtractFromSizeUsedByUser(
    session.userId,
    totalSizeInBytesToBeSubtracted,
  );

  return { success: true };
}

export async function createFolderAction(formData: FormData) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const folderName = JSON.stringify(formData.get("name"));
  const folderDescription = JSON.stringify(formData.get("description"));
  const folderParentFolderId = JSON.parse(
    JSON.stringify(formData.get("parent")),
  );
  const pathName = JSON.stringify(formData.get("pathname"));
  MUTATIONS.createFolder({
    folder: {
      name: JSON.parse(folderName) as string,
      description: JSON.parse(folderDescription) as string,
      parent: folderParentFolderId,
    },
    userId,
  });
  revalidatePath(`${pathName}`);
}

export async function renameFile(formData: FormData) {
  const { userId } = await auth();
  if (!userId) {
    return { error: "Unauthorized" };
  }

  const fileNameToBeRenamed = JSON.stringify(formData.get("filename"));

  const file = await QUERIES.getFileById(Number(formData.get("fileId")));

  if (!file) {
    return { error: "File not found" };
  }

  await MUTATIONS.renameFileById({
    fileId: Number(formData.get("fileId")),
    fileNameToBeRenamed: (JSON.parse(fileNameToBeRenamed) as string)
      .concat(".")
      .concat(file.name.split(".").pop() ?? ""),
  });

  const utApi = new UTApi();

  await utApi.renameFiles({
    fileKey: file.url.replace("https://ebt4rxu2e3.ufs.sh/f/", ""),
    newName: (JSON.parse(fileNameToBeRenamed) as string)
      .concat(".")
      .concat(file.name.split(".").pop() ?? ""),
  });

  await MUTATIONS.updateLastModifiedAtFile(Number(formData.get("fileId")));

  updateLastModifiedAtAllParents(file.parent);

  return { success: true };
}

export async function renameFolder(formData: FormData) {
  const { userId } = await auth();
  if (!userId) {
    return { error: "Unauthorized" };
  }

  const folderNameToBeRenamed = JSON.stringify(formData.get("foldername"));

  const folder = await QUERIES.getFolderById(Number(formData.get("folderId")));

  if (!folder) {
    return { error: "Folder not found" };
  }

  await MUTATIONS.renameFolderById({
    folderId: Number(formData.get("folderId")),
    folderNameToBeRenamed: JSON.parse(folderNameToBeRenamed) as string,
  });

  await MUTATIONS.updateLastModifiedAtFolder(Number(formData.get("folderId")));

  if (folder.parent === null) return; //can be deleted later, temporary

  updateLastModifiedAtAllParents(folder.parent);

  return { success: true };
}
