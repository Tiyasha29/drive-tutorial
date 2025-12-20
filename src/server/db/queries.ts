import {
  files_table as filesSchema,
  folders_table as foldersSchema,
  users_table,
  users_table as usersSchema,
} from "~/server/db/schema";
import { db } from "~/server/db";
import { eq, isNull, and, sql, desc } from "drizzle-orm";
import { updateLastModifiedAtAllParents } from "~/app/utility-functions/update-last-modified-at-all-parents";
import { formatFileSize } from "~/app/utility-functions/format-file-size";

export const QUERIES = {
  getAllParentsForFolder: async function (folderId: number) {
    const parents = [];
    let currentId: number | null = folderId;
    while (currentId !== null) {
      const folder = await db
        .selectDistinct()
        .from(foldersSchema)
        .where(eq(foldersSchema.id, currentId));

      if (!folder[0]) {
        throw new Error("Folder not found");
      }

      parents.unshift(folder[0]);
      currentId = folder[0]?.parent;
    }
    return parents;
  },

  getFileById: async function (fileId: number) {
    const file = await db
      .select()
      .from(filesSchema)
      .where(eq(filesSchema.id, fileId));
    return file[0];
  },

  getFolderById: async function (folderId: number) {
    const folder = await db
      .select()
      .from(foldersSchema)
      .where(eq(foldersSchema.id, folderId));
    return folder[0];
  },

  getFiles: function (folderId: number) {
    return db
      .select()
      .from(filesSchema)
      .where(eq(filesSchema.parent, folderId))
      .orderBy(filesSchema.id);
  },

  getFolders: function (folderId: number) {
    return db
      .select()
      .from(foldersSchema)
      .where(eq(foldersSchema.parent, folderId))
      .orderBy(foldersSchema.id);
  },

  getRootFolderForUser: async function (userId: string) {
    const folder = await db
      .select()
      .from(foldersSchema)
      .where(
        and(eq(foldersSchema.ownerId, userId), isNull(foldersSchema.parent)),
      );

    return folder[0];
  },

  getFoldersByOwnerId: async function (ownerId: string) {
    const folders = await db
      .select()
      .from(foldersSchema)
      .where(eq(foldersSchema.ownerId, ownerId))
      .orderBy(desc(foldersSchema.lastUpdatedAt));

    return folders;
  },

  getUserByUserId: async function (userId: string) {
    const users = await db
      .select()
      .from(usersSchema)
      .where(eq(usersSchema.userId, userId));

    return users[0];
  },
};

export const MUTATIONS = {
  createFile: async function (input: {
    file: {
      name: string;
      sizeInBytes: number;
      size: number;
      sizeUnit: "bytes" | "KB" | "MB" | "GB";
      url: string;
      parent: number;
    };
    userId: string;
  }) {
    await db
      .insert(filesSchema)
      .values({ ...input.file, ownerId: input.userId });
    let currentParentFolder = await QUERIES.getFolderById(input.file.parent);

    while (currentParentFolder) {
      await MUTATIONS.updateLastModifiedAtFolder(currentParentFolder.id);

      // If this folder has no parent, stop climbing
      if (!currentParentFolder.parent || currentParentFolder.parent === 0) {
        break;
      }

      currentParentFolder = await QUERIES.getFolderById(
        currentParentFolder.parent,
      );
    }

    await db
      .update(usersSchema)
      .set({
        numberOfFilesUploaded: sql`${usersSchema.numberOfFilesUploaded} + ${1}`,
      })
      .where(eq(usersSchema.userId, input.userId));

    await MUTATIONS.addToSizeUsedByUser(input.userId, input.file.sizeInBytes);
  },

  createFolder: async function (input: {
    folder: {
      name: string;
      description: string;
      parent: number;
    };
    userId: string;
  }) {
    await db
      .insert(foldersSchema)
      .values({ ...input.folder, ownerId: input.userId });

    if (input.folder.parent !== 0) {
      // return Promise.all([
      //   folderCreated,
      //   MUTATIONS.updateLastModifiedAt(input.folder.parent),
      // ]);

      updateLastModifiedAtAllParents(input.folder.parent);
    }

    await db
      .update(usersSchema)
      .set({
        numberOfFoldersUploaded: sql`${usersSchema.numberOfFoldersUploaded} + ${1}`,
      })
      .where(eq(usersSchema.userId, input.userId));
  },

  updateLastModifiedAtFolder: async function (folderId: number) {
    return db
      .update(foldersSchema)
      .set({ lastUpdatedAt: new Date() })
      .where(eq(foldersSchema.id, folderId));
  },

  updateLastModifiedAtFile: async function (fileId: number) {
    return db
      .update(filesSchema)
      .set({ lastUpdatedAt: new Date() })
      .where(eq(filesSchema.id, fileId));
  },

  addToFolderSize: async function (input: {
    sizeInBytes: number;
    folderId: number;
  }) {
    return db
      .update(foldersSchema)
      .set({ size: sql`${foldersSchema.size} + ${input.sizeInBytes}` })
      .where(eq(foldersSchema.id, input.folderId));
  },

  subtractFromFolderSize: async function (input: {
    sizeInBytes: number;
    folderId: number;
  }) {
    return db
      .update(foldersSchema)
      .set({ size: sql`${foldersSchema.size} - ${input.sizeInBytes}` })
      .where(eq(foldersSchema.id, input.folderId));
  },

  renameFileById: async function (input: {
    fileId: number;
    fileNameToBeRenamed: string;
  }) {
    return db
      .update(filesSchema)
      .set({ name: input.fileNameToBeRenamed })
      .where(eq(filesSchema.id, input.fileId));
  },

  renameFolderById: async function (input: {
    folderId: number;
    folderNameToBeRenamed: string;
  }) {
    return db
      .update(foldersSchema)
      .set({ name: input.folderNameToBeRenamed })
      .where(eq(foldersSchema.id, input.folderId));
  },

  addUser: async function (user: {
    userId: string;
    name: string;
    email: string;
    profilePictureUrl: string;
  }) {
    await db.insert(usersSchema).values({
      userId: user.userId,
      name: user.name,
      email: user.email,
      profilePictureurl: user.profilePictureUrl,
    });
  },

  addToSizeUsedByUser: async function (userId: string, sizeInBytes: number) {
    await db
      .update(usersSchema)
      .set({
        sizeInBytesUsed: sql`${usersSchema.sizeInBytesUsed} + ${sizeInBytes}`,
      })
      .where(eq(usersSchema.userId, userId));

    const users = await db
      .select()
      .from(usersSchema)
      .where(eq(usersSchema.userId, userId));

    const { fileSize: sizeUsed, fileSizeUnit: sizeUnitUsed } = formatFileSize(
      users[0]?.sizeInBytesUsed ?? 0,
    );

    await db
      .update(usersSchema)
      .set({ sizeUsed, sizeUnitUsed })
      .where(eq(usersSchema.userId, userId));
  },

  subtractFromSizeUsedByUser: async function (
    userId: string,
    sizeInBytes: number,
  ) {
    await db
      .update(usersSchema)
      .set({
        sizeInBytesUsed: sql`${usersSchema.sizeInBytesUsed} - ${sizeInBytes}`,
      })
      .where(eq(usersSchema.userId, userId));

    const users = await db
      .select()
      .from(usersSchema)
      .where(eq(usersSchema.userId, userId));

    const { fileSize: sizeUsed, fileSizeUnit: sizeUnitUsed } = formatFileSize(
      users[0]?.sizeInBytesUsed ?? 0,
    );

    await db
      .update(usersSchema)
      .set({ sizeUsed, sizeUnitUsed })
      .where(eq(usersSchema.userId, userId));
  },

  onboardUser: async function (userId: string) {
    const rootFolder = await db
      .insert(foldersSchema)
      .values({
        ownerId: userId,
        name: "root",
        parent: null,
      })
      .$returningId();

    const rootFolderId = rootFolder[0]?.id;

    await db.insert(foldersSchema).values([
      {
        ownerId: userId,
        name: "Trash",
        parent: rootFolderId,
      },
      {
        ownerId: userId,
        name: "Shared",
        parent: rootFolderId,
      },
      {
        ownerId: userId,
        name: "Documents",
        parent: rootFolderId,
      },
    ]);

    return rootFolderId;
  },
};
