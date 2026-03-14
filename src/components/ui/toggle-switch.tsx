"use client";

import { useTransition } from "react";

interface ToggleSwitchProps {
  checked: boolean;
  action: () => Promise<void>;
}

export default function ToggleSwitch({ checked, action }: ToggleSwitchProps) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      onClick={() => startTransition(() => action())}
      disabled={isPending}
      className={`w-10 h-[22px] rounded-full relative transition-colors ${
        isPending ? "opacity-50" : ""
      } ${checked ? "bg-[var(--accent)]" : "bg-[var(--border-bright)]"}`}
    >
      <div
        className={`absolute top-[3px] left-[3px] w-4 h-4 rounded-full bg-white transition-transform ${
          checked ? "translate-x-[18px]" : ""
        }`}
      />
    </button>
  );
}
