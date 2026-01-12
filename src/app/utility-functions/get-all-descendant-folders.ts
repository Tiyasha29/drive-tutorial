import { inArray } from "drizzle-orm";
import { db } from "~/server/db";
import { QUERIES } from "~/server/db/queries";
import { folders_table } from "~/server/db/schema";

export default async function getAllDescendantFolders(
  ids: number[],
): Promise<number[]> {
  const children = await db
    .select()
    .from(folders_table)
    .where(inArray(folders_table.parent, ids)); //children of all selected folders

  if (children.length === 0) return ids;

  const childIds = children.map((f) => f.id); //storing ids of all children in childIds

  const deeper = await getAllDescendantFolders(childIds); //recursively calling with new child IDs as IDs

  return [...ids, ...childIds, ...deeper];
}
