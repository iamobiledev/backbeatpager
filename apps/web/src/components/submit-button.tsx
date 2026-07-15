"use client";

import { LoaderCircle } from "lucide-react";
import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";

export function SubmitButton({
  children,
  destructive = false
}: {
  children: ReactNode;
  destructive?: boolean;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
        destructive
          ? "border border-red-500/40 bg-red-500/10 text-red-300 hover:bg-red-500/20"
          : "bg-cyan-400 text-slate-950 hover:bg-cyan-300"
      }`}
      disabled={pending}
      type="submit"
    >
      {pending ? (
        <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
      ) : null}
      {children}
    </button>
  );
}
