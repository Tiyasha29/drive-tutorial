import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { QUERIES } from "~/server/db/queries";

export default async function DrivePage() {
  const session = await auth();

  if(!session.userId) {
    return redirect("/sign-in");
  }

  const rootFolder = await QUERIES.getRootFolderForUser(session.userId);

  if(!rootFolder) {
    //create one
  }

  return redirect(`/f/${rootFolder?.id}`);
}