import { Activity, ArrowRight } from "lucide-react";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";

import { signIn } from "@/auth";
import { currentActor } from "@/lib/authz";

export default async function LoginPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  if (await currentActor()) redirect("/");
  const params = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <section className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-950 p-8 shadow-2xl shadow-cyan-950/20">
        <div className="mb-8 flex size-12 items-center justify-center rounded-2xl bg-cyan-400 text-slate-950">
          <Activity aria-hidden="true" className="size-6" />
        </div>
        <p className="text-xs font-bold tracking-[0.24em] text-cyan-400 uppercase">
          Backbeat Pager
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-white">
          Sign in to the response console
        </h1>
        <p className="mt-4 leading-7 text-slate-400">
          Use an active responder email and the shared console password. Day to
          day paging still happens in Slack.
        </p>
        {params.error ? (
          <p className="mt-4 rounded-xl border border-rose-900/60 bg-rose-950/40 px-3 py-2 text-sm text-rose-200">
            Sign-in failed. Check the email, password, and that the user exists
            in Backbeat Pager.
          </p>
        ) : null}
        <form
          action={async (formData) => {
            "use server";
            try {
              await signIn("credentials", {
                email: String(formData.get("email") ?? ""),
                password: String(formData.get("password") ?? ""),
                redirectTo: "/"
              });
            } catch (error) {
              if (error instanceof AuthError) {
                redirect("/login?error=credentials");
              }
              throw error;
            }
          }}
          className="mt-8 space-y-4"
        >
          <label className="block space-y-2 text-sm text-slate-300">
            <span>Email</span>
            <input
              autoComplete="username"
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-3 text-white outline-none focus:border-cyan-400"
              name="email"
              required
              type="email"
            />
          </label>
          <label className="block space-y-2 text-sm text-slate-300">
            <span>Console password</span>
            <input
              autoComplete="current-password"
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-3 text-white outline-none focus:border-cyan-400"
              name="password"
              required
              type="password"
            />
          </label>
          <button
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-400 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
            type="submit"
          >
            Sign in
            <ArrowRight aria-hidden="true" className="size-4" />
          </button>
        </form>
      </section>
    </main>
  );
}
