"use client";

import { useTransition } from "react";
import { markAllNotificationsRead } from "@/app/dashboard/actions";

export default function MarkAllReadButton() {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      onClick={() => startTransition(() => markAllNotificationsRead())}
      disabled={isPending}
      className="text-xs text-[var(--accent-text)] font-medium hover:underline disabled:opacity-50"
    >
      {isPending ? "Marking..." : "Mark all read"}
    </button>
  );
}
