import {
  index,
  bigint,
  text,
  singlestoreTableCreator,
  timestamp,
  float,
  int,
  boolean,
} from "drizzle-orm/singlestore-core";

export const createTable = singlestoreTableCreator(
  (name) => `drive_tutorial_${name}`,
);

export const files_table = createTable(
  "files_table",
  {
    id: bigint("id", { mode: "number", unsigned: true })
      .primaryKey()
      .autoincrement(),
    ownerId: text("owner_id").notNull(),
    name: text("name").notNull(),
    type: text("type").default("file"),
    sizeInBytes: float("size_in_bytes").notNull().default(0),
    size: float("size").notNull().default(0),
    sizeUnit: text("size_unit", { enum: ["bytes", "KB", "MB", "GB"] })
      .notNull()
      .default("bytes"),
    isStarred: boolean("is_starred").notNull().default(false),
    isBinned: boolean("is_binned").notNull().default(false),
    binnedAt: timestamp("binned_at"),
    url: text("url").notNull(),
    parent: bigint("parent", { mode: "number", unsigned: true }).notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    lastUpdatedAt: timestamp("last_updated_at").notNull().defaultNow(),
  },
  (t) => {
    return [
      index("parent_index").on(t.parent),
      index("owner_id_index").on(t.ownerId),
    ];
  },
);

export type DB_FileType = typeof files_table.$inferSelect;

export const folders_table = createTable(
  "folders_table",
  {
    id: bigint("id", { mode: "number", unsigned: true })
      .primaryKey()
      .autoincrement(),
    ownerId: text("owner_id").notNull(),
    name: text("name").notNull(),
    description: text("description"),
    type: text("type").default("folder"),
    size: float("size").notNull().default(0),
    sizeUnit: text("size_unit", { enum: ["bytes", "KB", "MB", "GB"] })
      .notNull()
      .default("bytes"),
    isStarred: boolean("is_starred").notNull().default(false),
    isBinned: boolean("is_binned").notNull().default(false),
    binnedAt: timestamp("binned_at"),
    parent: bigint("parent", { mode: "number", unsigned: true }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    lastUpdatedAt: timestamp("last_updated_at").notNull().defaultNow(),
  },
  (t) => {
    return [
      index("parent_index").on(t.parent),
      index("owner_id_index").on(t.ownerId),
    ];
  },
);

export type DB_FolderType = typeof folders_table.$inferSelect;

export const users_table = createTable("users_table", {
  userId: text("user_id").notNull().primaryKey(),
  name: text("name").notNull(),
  email: text("type").notNull(),
  profilePictureurl: text("profile_picture_url").notNull(),
  numberOfFilesUploaded: int("number_of_files_uploaded").notNull().default(0),
  numberOfFoldersUploaded: int("number_of_folders_uploaded")
    .notNull()
    .default(0),
  sizeInBytesUsed: float("size_in_bytes_used").notNull().default(0),
  sizeUsed: float("size_used").notNull().default(0),
  sizeUnitUsed: text("size_unit_used", { enum: ["bytes", "KB", "MB", "GB"] })
    .notNull()
    .default("bytes"),
  accountCreatedAt: timestamp("account_created_at").notNull().defaultNow(),
});

export type DB_UserType = typeof users_table.$inferSelect;
