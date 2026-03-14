"use client";

import { useTransition } from "react";
import { markNotificationRead } from "@/app/dashboard/actions";

export default function MarkReadButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      onClick={() => startTransition(() => markNotificationRead(id))}
      disabled={isPending}
      className="text-[11px] text-[var(--accent-text)] hover:underline disabled:opacity-50"
    >
      {isPending ? "..." : "Mark read"}
    </button>
  );
}
