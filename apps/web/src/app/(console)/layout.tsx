import {
  Activity,
  AlarmClock,
  BarChart3,
  BellRing,
  Blocks,
  Gauge,
  LogOut,
  Settings,
  ShieldCheck,
  Users,
  Workflow
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { signOut } from "@/auth";
import { Badge } from "@/components/ui";
import { requireActor } from "@/lib/authz";

const navigation = [
  { href: "/", icon: Gauge, label: "Dashboard" },
  { href: "/incidents", icon: BellRing, label: "Incidents" },
  { href: "/analytics", icon: BarChart3, label: "Analytics" },
  { href: "/schedules", icon: AlarmClock, label: "Schedules" },
  { href: "/services", icon: Blocks, label: "Services" },
  { href: "/policies", icon: Workflow, label: "Policies" },
  { href: "/teams", icon: ShieldCheck, label: "Teams" },
  { href: "/users", icon: Users, label: "Users" },
  { href: "/settings", icon: Settings, label: "Settings" }
];

export default async function ConsoleLayout({
  children
}: {
  children: ReactNode;
}) {
  const actor = await requireActor();

  return (
    <div className="min-h-screen bg-[#070b12] text-slate-200">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 border-r border-slate-800 bg-slate-950/95 p-5 lg:flex lg:flex-col">
        <Link className="flex items-center gap-3" href="/">
          <span className="flex size-10 items-center justify-center rounded-xl bg-cyan-400 text-slate-950">
            <Activity aria-hidden="true" className="size-5" />
          </span>
          <span>
            <span className="block font-semibold text-white">Backbeat</span>
            <span className="block text-xs text-slate-500">Pager console</span>
          </span>
        </Link>
        <nav aria-label="Main navigation" className="mt-9 grid gap-1">
          {navigation.map(({ href, icon: Icon, label }) => (
            <Link
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-400 transition hover:bg-slate-900 hover:text-white focus-visible:outline-2 focus-visible:outline-cyan-400"
              href={href}
              key={href}
            >
              <Icon aria-hidden="true" className="size-4" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto rounded-xl border border-slate-800 bg-slate-900/60 p-3">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-white">
                {actor.name}
              </p>
              <p className="truncate text-xs text-slate-500">{actor.email}</p>
            </div>
            <Badge tone={actor.role === "ADMIN" ? "cyan" : "slate"}>
              {actor.role.toLowerCase()}
            </Badge>
          </div>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/login" });
            }}
            className="mt-3"
          >
            <button
              className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-xs text-slate-400 hover:bg-slate-800 hover:text-white"
              type="submit"
            >
              <LogOut aria-hidden="true" className="size-3.5" />
              Sign out
            </button>
          </form>
        </div>
      </aside>
      <header className="sticky top-0 z-10 border-b border-slate-800 bg-slate-950/95 px-4 py-3 backdrop-blur lg:hidden">
        <div className="flex items-center justify-between">
          <Link
            className="flex items-center gap-2 font-semibold text-white"
            href="/"
          >
            <Activity aria-hidden="true" className="size-5 text-cyan-400" />
            Backbeat Pager
          </Link>
          <Badge tone={actor.role === "ADMIN" ? "cyan" : "slate"}>
            {actor.role.toLowerCase()}
          </Badge>
        </div>
        <nav
          aria-label="Mobile navigation"
          className="mt-3 flex gap-1 overflow-x-auto pb-1"
        >
          {navigation.map(({ href, label }) => (
            <Link
              className="shrink-0 rounded-md border border-slate-800 px-2.5 py-1.5 text-xs text-slate-400"
              href={href}
              key={href}
            >
              {label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="px-4 py-8 sm:px-6 lg:ml-64 lg:px-10 lg:py-10">
        <div className="mx-auto max-w-7xl">{children}</div>
      </main>
    </div>
  );
}
