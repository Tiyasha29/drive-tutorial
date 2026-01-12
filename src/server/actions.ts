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
import { addToFolderSizeAllParents } from "~/app/utility-functions/add-to-folder-size-all-parents";
import getAllDescendantFolders from "~/app/utility-functions/get-all-descendant-folders";

export type Folders = typeof folders_table.$inferSelect;
export type Files = typeof files_table.$inferSelect;

export async function getUserById(userId: string) {
  const user = await QUERIES.getUserByUserId(userId);
  if (user !== undefined) {
    return user;
  }
}

export async function getFolderById(id: number) {
  const folder = await QUERIES.getFolderById(id);
  return folder;
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

export async function updateIsStarredFileOrFolder({
  rowObject,
  isStarred,
  pathname,
}: {
  rowObject: Folders | Files;
  isStarred: boolean;
  pathname: string;
}) {
  try {
    if (rowObject.type === "folder") {
      await db
        .update(folders_table)
        .set({ isStarred })
        .where(eq(folders_table.id, rowObject.id));
    } else {
      await db
        .update(files_table)
        .set({ isStarred })
        .where(eq(files_table.id, rowObject.id));
    }
  } catch (e) {
    throw new Error("Database update failed.");
  } finally {
    console.log(pathname);
    revalidatePath(pathname);
  }
}

export async function moveToBinFile(fileIds: number[]) {
  const session = await auth();

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

  await MUTATIONS.updateIsBinnedForDeletingFile(fileIds);

  files.forEach(async (file) => {
    updateLastModifiedAtAllParents(file.parent);

    subtractFromFolderSizeAllParents({
      size: file.sizeInBytes,
      parentFolderId: file.parent,
    });
  });

  return { success: true };
}

export async function moveToBinFolder(folderIds: number[]) {
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

  // get all folders we need to move to bin (selected + children)
  const allFolderIds = Array.from(
    new Set(await getAllDescendantFolders(folderIds)),
  );

  // Get all files in all of these folders
  const allFiles = await db
    .select()
    .from(files_table)
    .where(inArray(files_table.parent, allFolderIds));

  const allFileIds = allFiles.map((file) => file.id);

  // Bin all files
  await MUTATIONS.updateIsBinnedForDeletingFile(allFileIds);

  // Bin all folders
  await MUTATIONS.updateIsBinnedForDeletingFolder(allFolderIds);

  folders.forEach(async (folder) => {
    if (folder.parent === null) folder.parent = 0; //Can be deleted later - changed all folder parent ids to 0 for home page
    updateLastModifiedAtAllParents(folder.parent);

    subtractFromFolderSizeAllParents({
      size: folder.size,
      parentFolderId: folder.parent,
    });
  });

  return { success: true };
}

export async function restoreFile(fileIds: number[]) {
  const session = await auth();

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

  await MUTATIONS.updateIsBinnedForRestoringFile(fileIds);

  files.forEach(async (file) => {
    updateLastModifiedAtAllParents(file.parent);

    addToFolderSizeAllParents({
      size: file.sizeInBytes,
      parentFolderId: file.parent,
    });
  });

  return { success: true };
}

export async function restoreFolder(folderIds: number[]) {
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

  // get all folders we need to restore (selected + children)
  const allFolderIds = Array.from(
    new Set(await getAllDescendantFolders(folderIds)),
  );

  // Get all files in all of these folders
  const allFiles = await db
    .select()
    .from(files_table)
    .where(inArray(files_table.parent, allFolderIds));

  const allFileIds = allFiles.map((file) => file.id);

  // Restore all files
  await MUTATIONS.updateIsBinnedForRestoringFile(allFileIds);

  // Restore all folders
  await MUTATIONS.updateIsBinnedForRestoringFolder(allFolderIds);

  folders.forEach(async (folder) => {
    if (folder.parent === null) folder.parent = 0; //Can be deleted later - changed all folder parent ids to 0 for home page
    updateLastModifiedAtAllParents(folder.parent);

    addToFolderSizeAllParents({
      size: folder.size,
      parentFolderId: folder.parent,
    });
  });

  return { success: true };
}

export async function updateProfilePictureUrl({
  profilePictureUrl,
  userId,
}: {
  profilePictureUrl: string;
  userId: string;
}) {
  await MUTATIONS.updateProfilePictureUrl({ profilePictureUrl, userId });
  return { success: true };
}

export async function getFolderOptionsForMovingFile({
  excludedFolderId,
  userId,
}: {
  excludedFolderId: number;
  userId: string;
}) {
  const folderOptions = await QUERIES.getAllFoldersExceptByIds({
    excludedFolderIds: [excludedFolderId],
    userId,
  });
  return folderOptions;
}

// ...existing code...
export async function getFolderOptionsForMovingFolder({
  folderId,
  userId,
}: {
  folderId: number;
  userId: string;
}) {
  const folder = await QUERIES.getFolderById(folderId);

  const descendantFolderIds = await getAllDescendantFolders([folderId]);
  let excludedFolderIds = descendantFolderIds;
  if (folder?.parent !== 0) {
    excludedFolderIds.push(folder?.parent ?? 0);
  }
  let folderOptions = await QUERIES.getAllFoldersExceptByIds({
    excludedFolderIds: descendantFolderIds,
    userId,
  });

  return folderOptions;
}

export async function moveFile({
  fileId,
  parentId,
  userId,
}: {
  fileId: number;
  parentId: number;
  userId: string;
}) {
  const file = await QUERIES.getFileById(fileId);
  const originalParent = await QUERIES.getFolderById(file?.parent ?? 0);
  const newParent = await QUERIES.getFolderById(parentId);

  await MUTATIONS.updateParentForFileById({ fileId, parentId });

  if (originalParent) {
    await subtractFromFolderSizeAllParents({
      size: file?.sizeInBytes ?? 0,
      parentFolderId: originalParent?.id ?? 0,
    });
  }

  await addToFolderSizeAllParents({
    size: file?.sizeInBytes ?? 0,
    parentFolderId: newParent?.id ?? 0,
  });
  if (originalParent) {
    updateLastModifiedAtAllParents(originalParent?.id ?? 0);
  }

  await updateLastModifiedAtAllParents(newParent?.id ?? 0);

  return { success: true };
}

export async function moveFolder({
  folderId,
  parentId,
  userId,
}: {
  folderId: number;
  parentId: number;
  userId: string;
}) {
  const folder = await QUERIES.getFolderById(folderId);
  const originalParent = await QUERIES.getFolderById(folder?.parent ?? 0);
  const newParent = await QUERIES.getFolderById(parentId);

  await MUTATIONS.updateParentForFolderById({ folderId, parentId });

  if (originalParent) {
    await subtractFromFolderSizeAllParents({
      size: folder?.size ?? 0,
      parentFolderId: originalParent?.id ?? 0,
    });
  }

  await addToFolderSizeAllParents({
    size: folder?.size ?? 0,
    parentFolderId: newParent?.id ?? 0,
  });
  if (originalParent) {
    updateLastModifiedAtAllParents(originalParent?.id ?? 0);
  }

  await updateLastModifiedAtAllParents(newParent?.id ?? 0);

  return { success: true };
}

export async function getDOBByUserId(userId: string) {
  const dob = await QUERIES.getDOBByUserId(userId);
  return dob;
}

export async function getGenderByUserId(userId: string) {
  const gender = await QUERIES.getGenderByUserId(userId);
  return gender;
}

export async function updateDOBByUserId({
  userId,
  dob,
}: {
  userId: string;
  dob: Date | undefined;
}) {
  await MUTATIONS.updateDOBByUserId({ userId, dob });
  return { success: true };
}

export async function updateGenderByUserId({
  userId,
  gender,
}: {
  userId: string;
  gender: "Male" | "Female" | "Third Gender" | "Prefer not to disclose";
}) {
  await MUTATIONS.updateGenderByUserId({ userId, gender });
  return { success: true };
}
