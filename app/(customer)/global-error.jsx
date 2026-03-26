"use client";

export default function GlobalError({ error, reset }) {
  console.error("Global Error:", error);

  return (
    <html>
      <body className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Application Error
          </h1>

          <p className="mt-2 text-gray-600">
            A critical error occurred. Please refresh the page.
          </p>

          <button
            onClick={() => reset()}
            className="mt-6 rounded bg-black px-6 py-2 text-white"
          >
            Reload
          </button>
        </div>
      </body>
    </html>
  );
}
