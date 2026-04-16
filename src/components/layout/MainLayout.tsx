export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-obsidian text-white flex">
      {children}
    </div>
  );
}
