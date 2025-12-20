import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "~/server/db";
import { MUTATIONS, QUERIES } from "~/server/db/queries";

export async function checkUserOnSignIn() {
  const { userId } = await auth();
  if (!userId) {
    return;
  }
  const user = await QUERIES.getUserByUserId(userId);

  if (!user) {
    const cUser = await currentUser();
    if (cUser) {
      await MUTATIONS.addUser({
        userId: cUser?.id,
        name: `${cUser.firstName ?? ""} ${cUser.lastName ?? ""}`.trim(),
        email: cUser.emailAddresses[0]?.emailAddress ?? "",
        profilePictureUrl: cUser.imageUrl,
      });
    }
  }
}
