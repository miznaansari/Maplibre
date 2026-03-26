export default function Loading() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-300 border-t-gray-900" />
      <p className="ml-3 text-sm text-gray-600">Loading...</p>
    </div>
  );
}
