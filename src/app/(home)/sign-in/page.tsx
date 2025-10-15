import { SignInButton } from "@clerk/nextjs";

export default function HomePage() {
  return (
    <>
      <SignInButton forceRedirectUrl={`/my-drive`}/>
      <footer className="mt-16 text-sm text-neutral-500">
        © {new Date().getFullYear()} Tiyasha&apos;s Drive. All rights reserved.
      </footer>
    </>
  );
}