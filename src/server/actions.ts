"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "./db";
import { files_table } from "./db/schema";
import { eq, and } from "drizzle-orm";
import { UTApi } from "uploadthing/server";
import { cookies } from "next/headers";

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

  const utApiResult = await utApi.deleteFiles([file.url.replace("https://ebt4rxu2e3.ufs.sh/f/", "")]);

  console.log(utApiResult);

  const dbDeleteResult = await db.delete(files_table)
  .where(eq(files_table.id, fileId));

  console.log(dbDeleteResult);

  const c = await cookies();

  c.set("force-refresh", JSON.stringify(Math.random()));

  return { success: true};
}