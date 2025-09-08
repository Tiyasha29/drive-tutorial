export default function HomePage(props: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center">
      <main className="text-center">
        {props.children}
      </main>
    </div>
  );
}