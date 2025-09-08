import { SignInButton } from "@clerk/nextjs";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center">
      <main className="text-center">
        <SignInButton forceRedirectUrl={`/drive`}/>
      </main>
      <footer className="mt-16 text-sm text-neutral-500">
        © {new Date().getFullYear()} Tiyasha&apos;s Drive. All rights reserved.
      </footer>
    </div>
  );
}