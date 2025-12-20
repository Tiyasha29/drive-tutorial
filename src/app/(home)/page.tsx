import { SignInButton, useUser } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Button } from "~/components/ui/button";
import DemoPage from "../my-drive/page";

export default async function HomePage() {

  const { userId } = await auth();

  if(userId) {
    return redirect ("/my-drive");
  }
  return (
    <>
    <h1 className="mb-4 bg-gradient-to-r from-neutral-200 to-neutral-400 bg-clip-text text-5xl font-bold text-transparent md:text-6xl">
        Tiyasha&apos;s Drive
      </h1>
      <p className="mx-auto mb-8 max-w-md text-xl text-neutral-400 md:text-2xl">
        Secure, fast, and easy file storage for the modern web.
      </p>
        <SignInButton forceRedirectUrl={`/my-drive`}/>
      <footer className="mt-16 text-sm text-neutral-500">
        © {new Date().getFullYear()} Tiyasha&apos;s Drive. All rights reserved.
      </footer>
    </>
  );
}