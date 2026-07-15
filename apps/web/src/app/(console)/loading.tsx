export default function ConsoleLoading() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading console"
      className="animate-pulse"
    >
      <div className="h-9 w-64 rounded bg-slate-800" />
      <div className="mt-3 h-4 w-96 max-w-full rounded bg-slate-900" />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div
            className="h-28 rounded-2xl border border-slate-800 bg-slate-950"
            key={index}
          />
        ))}
      </div>
    </div>
  );
}
