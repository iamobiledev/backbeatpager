export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl items-center px-6 py-16">
      <section className="w-full rounded-3xl border border-slate-800 bg-slate-950/80 p-10 shadow-2xl shadow-cyan-950/20">
        <p className="mb-3 text-sm font-semibold tracking-[0.24em] text-cyan-400 uppercase">
          Backbeat Pager
        </p>
        <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-white sm:text-6xl">
          Keep incidents moving without leaving Slack.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-400">
          The administration console is being prepared. Alert routing, on-call
          schedules, escalation policies, and incident history will live here.
        </p>
        <div className="mt-10 flex items-center gap-3 text-sm text-slate-500">
          <span className="inline-flex size-2 rounded-full bg-emerald-400 shadow-[0_0_16px_#34d399]" />
          Foundation online
        </div>
      </section>
    </main>
  );
}
