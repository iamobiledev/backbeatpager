"use client";

import { AlertTriangle } from "lucide-react";

export default function ConsoleError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <section className="rounded-2xl border border-red-500/30 bg-red-500/5 p-8 text-center">
      <AlertTriangle
        aria-hidden="true"
        className="mx-auto size-8 text-red-300"
      />
      <h1 className="mt-4 text-xl font-semibold text-white">
        The console could not load this view
      </h1>
      <p className="mt-2 text-sm text-slate-400">
        {error.message || "An unexpected error occurred."}
      </p>
      <button
        className="mt-6 rounded-lg bg-slate-800 px-4 py-2 text-sm text-white"
        onClick={reset}
        type="button"
      >
        Try again
      </button>
    </section>
  );
}
