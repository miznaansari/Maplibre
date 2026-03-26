export default function MyAccountLayout({ children }) {
  return (
    <div className="min-h-screen ">
      <div className="mx-auto flex max-w-7xl gap-6 px-2 py-2 md:px-6 md:py-4">
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
