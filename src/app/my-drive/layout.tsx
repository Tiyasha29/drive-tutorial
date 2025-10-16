import { ModeToggle } from "~/components/mode-toggle";

export default function HomePage({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div>
      <ModeToggle/>
      <main>
        {children}
      </main>
    </div>
  );
}