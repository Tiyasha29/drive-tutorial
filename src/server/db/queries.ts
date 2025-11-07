import {
  files_table as filesSchema,
  folders_table as foldersSchema,
} from "~/server/db/schema";
import { db } from "~/server/db";
import { eq, isNull, and, sql, desc } from "drizzle-orm";

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
    const fileCreated = db
      .insert(filesSchema)
      .values({ ...input.file, ownerId: input.userId });
    //const updatedLastModifiedAt = db.update(foldersSchema).set({ lastUpdatedAt: new Date()}).where(eq(foldersSchema.id, input.file.parent));

    return Promise.all([
      fileCreated,
      MUTATIONS.updateLastModifiedAt(input.file.parent),
    ]);
  },
  createFolder: async function (input: {
    folder: {
      name: string;
      description: string;
      parent: number | null;
    };
    userId: string;
  }) {
    const folderCreated = db
      .insert(foldersSchema)
      .values({ ...input.folder, ownerId: input.userId });

    if (input.folder.parent !== null) {
      return Promise.all([
        folderCreated,
        MUTATIONS.updateLastModifiedAt(input.folder.parent),
      ]);
    } else {
      return folderCreated;
    }
  },

  updateLastModifiedAt: async function (folderId: number) {
    return db
      .update(foldersSchema)
      .set({ lastUpdatedAt: new Date() })
      .where(eq(foldersSchema.id, folderId));
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
