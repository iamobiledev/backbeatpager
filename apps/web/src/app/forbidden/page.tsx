import Link from "next/link";

export default function ForbiddenPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <section className="max-w-lg rounded-3xl border border-amber-500/30 bg-amber-500/5 p-10 text-center">
        <p className="text-sm font-bold tracking-widest text-amber-300 uppercase">
          Read-only access
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-white">
          Administrator access required
        </h1>
        <p className="mt-4 text-slate-400">
          Your responder account can view incidents and schedules but cannot
          change organization configuration.
        </p>
        <Link
          className="mt-8 inline-block rounded-lg border border-slate-700 px-4 py-2 text-sm text-white hover:bg-slate-800"
          href="/"
        >
          Return to dashboard
        </Link>
      </section>
    </main>
  );
}
