"use client";

import Link from "next/link";

const GlobalError = ({ reset }: { reset: () => void }) => (
  <section className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6">
    <p className="text-7xl font-bold">500</p>
    <h1 className="mt-4 text-2xl font-semibold">Something went wrong!</h1>
    <p className="mt-2 text-muted-foreground">
      An unexpected error occurred. Please try again.
    </p>
    <div className="mt-6 flex gap-3">
      <button
        onClick={reset}
        className="rounded-lg border px-4 py-2 hover:bg-muted"
      >
        Try Again
      </button>
      <Link href="/" className="rounded-lg border px-4 py-2 hover:bg-muted">
        Back Home
      </Link>
    </div>
  </section>
);

export default GlobalError;
