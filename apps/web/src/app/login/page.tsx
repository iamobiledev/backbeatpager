import { Activity, ArrowRight } from "lucide-react";
import { redirect } from "next/navigation";

import { signIn } from "@/auth";
import { currentActor } from "@/lib/authz";

export default async function LoginPage() {
  if (await currentActor()) redirect("/");

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
          Use your organization Google account. Access is limited to active
          responders already configured in Backbeat Pager.
        </p>
        <form
          action={async () => {
            "use server";
            await signIn("google", { redirectTo: "/" });
          }}
          className="mt-8"
        >
          <button
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-400 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
            type="submit"
          >
            Continue with Google
            <ArrowRight aria-hidden="true" className="size-4" />
          </button>
        </form>
      </section>
    </main>
  );
}
