import { IconStar, IconStarFilled } from "@tabler/icons-react";
import type { Row } from "@tanstack/react-table";
import { eq } from "drizzle-orm";
import { usePathname } from "next/navigation";
import { useOptimistic, useTransition } from "react";
import { updateIsStarredFileOrFolder } from "~/server/actions";
import { db } from "~/server/db";
import { folders_table, files_table } from "~/server/db/schema"

export type Folders = typeof folders_table.$inferSelect;
export type Files = typeof files_table.$inferSelect;

export default function StarAction({ row }: { row: Row<Folders | Files> }) {

  const rowObject = row.original;

  const pathname = usePathname();

  const  [ isPending, startTransition ] = useTransition();

  const [ optimisticRowObject, updateStarred ] = useOptimistic(rowObject, ( rowObject, isStarred: boolean) => {
    return  { ...rowObject, isStarred }
  })

  async function handleStarred(isStarred: boolean) {

    updateStarred(isStarred);

    await updateIsStarredFileOrFolder({ rowObject: optimisticRowObject, isStarred, pathname });
  }

  return (
    optimisticRowObject.isStarred ? (<IconStarFilled
    onClick={() => startTransition(() => handleStarred(false))}/>) 
    : 
    (<IconStar onClick={() => startTransition(() => handleStarred(true))}/>)
  )
}