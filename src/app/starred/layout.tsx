import { UserButton } from "@clerk/nextjs";
import { ModeToggle } from "~/components/mode-toggle";

export default function HomePage({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
      <div className="container mx-auto px-4">
        <div className="flex justify-between py-4">
        </div>
        <main>
          {children}
        </main>
      </div>
  );
}