"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "./db";
import { files_table, folders_table } from "./db/schema";
import { eq, and, inArray } from "drizzle-orm";
import { UTApi } from "uploadthing/server";
import { MUTATIONS, QUERIES } from "./db/queries";
import { revalidatePath } from "next/cache";

export async function deleteFolder(folderIds: number[]) {
  console.log("hello");
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

  if (folders.length === 0) {
    return { error: "Folder Not Found" };
  }

  await db.delete(files_table).where(inArray(files_table.parent, folderIds));
  await db.delete(folders_table).where(inArray(folders_table.id, folderIds));

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

  files.forEach(async (file) => {
    await MUTATIONS.updateLastModifiedAt(file.parent);
  });

  files.forEach(async (file) => {
    await MUTATIONS.updateLastModifiedAt(file.parent);

    await MUTATIONS.subtractFromFolderSize({
      sizeInBytes: file.sizeInBytes,
      folderId: file.parent,
    });
  });

  return { success: true };
}

export async function createFolderAction(formData: FormData) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const folderName = JSON.stringify(formData.get("name"));
  const folderDescription = JSON.stringify(formData.get("description"));
  await MUTATIONS.createFolder({
    folder: {
      name: JSON.parse(folderName) as string,
      description: JSON.parse(folderDescription) as string,
      parent: null,
    },
    userId,
  });
  revalidatePath("/my-drive");
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

  await MUTATIONS.updateLastModifiedAt(Number(formData.get("folderId")));

  return { success: true };
}
