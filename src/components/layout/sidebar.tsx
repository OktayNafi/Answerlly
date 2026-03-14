"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  Phone,
  Bell,
  BarChart3,
  Settings,
  HelpCircle,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

interface SidebarProps {
  orgName: string;
  userName: string;
  userInitials: string;
  unreadCount: number;
}

const mainNav = [
  { href: "/dashboard", label: "Overview", icon: Home },
  { href: "/dashboard/calls", label: "Calls", icon: Phone },
  { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
];

const systemNav = [
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
  { href: "/dashboard/help", label: "Help & Docs", icon: HelpCircle },
];

export default function Sidebar({
  orgName,
  userName,
  userInitials,
  unreadCount,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  const handleNavClick = () => {
    setMobileOpen(false);
  };

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
    router.refresh();
  };

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 h-14 bg-[var(--bg-secondary)] border-b border-[var(--border)] flex items-center px-4 gap-3">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
        <div className="w-7 h-7 rounded-md bg-gradient-to-br from-[var(--accent)] to-[var(--accent-text)] flex items-center justify-center text-white font-bold text-xs">
          A
        </div>
        <span className="font-semibold text-sm tracking-tight">Answerly</span>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "bg-[var(--bg-secondary)] border-r border-[var(--border)] flex flex-col flex-shrink-0 z-50",
          "hidden md:flex md:w-60",
          mobileOpen && "!flex fixed top-14 left-0 bottom-0 w-64"
        )}
      >
        {/* Logo - desktop only */}
        <div className="hidden md:flex px-5 py-5 pb-4 border-b border-[var(--border)] items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--accent)] to-[var(--accent-text)] flex items-center justify-center text-white font-bold text-sm">
            A
          </div>
          <span className="font-semibold text-base tracking-tight">
            Answerly
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2.5 py-3 flex flex-col gap-0.5">
          <span className="text-[10px] uppercase tracking-widest text-[var(--text-tertiary)] font-semibold px-2.5 pt-2 pb-1.5">
            Main
          </span>
          {mainNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={handleNavClick}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13.5px] font-medium transition-colors",
                isActive(item.href)
                  ? "bg-[var(--accent-soft)] text-[var(--accent-text)]"
                  : "text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-primary)]"
              )}
            >
              <item.icon size={18} />
              {item.label}
              {item.label === "Notifications" && unreadCount > 0 && (
                <span className="ml-auto bg-[var(--red)] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                  {unreadCount}
                </span>
              )}
            </Link>
          ))}

          <span className="text-[10px] uppercase tracking-widest text-[var(--text-tertiary)] font-semibold px-2.5 pt-6 pb-1.5 mt-auto">
            System
          </span>
          {systemNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={handleNavClick}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13.5px] font-medium transition-colors",
                isActive(item.href)
                  ? "bg-[var(--accent-soft)] text-[var(--accent-text)]"
                  : "text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-primary)]"
              )}
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Footer / User */}
        <div className="px-4 py-3.5 border-t border-[var(--border)]">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--accent-text)] flex items-center justify-center text-white font-semibold text-xs flex-shrink-0">
              {userInitials}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[13px] font-medium truncate">{userName}</div>
              <div className="text-[11px] text-[var(--text-tertiary)] truncate">
                {orgName}
              </div>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-[13px] font-medium text-[var(--text-tertiary)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--red)] transition-colors"
          >
            <LogOut size={15} />
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}
