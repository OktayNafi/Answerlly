import { redirect } from "next/navigation";
import { getCurrentUser, getCurrentOrg } from "@/lib/auth";
import Sidebar from "@/components/layout/sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  const orgData = await getCurrentOrg();

  if (!user || !orgData) {
    redirect("/auth/login");
  }

  const { organization, membership } = orgData;

  const initials = user.full_name
    ? user.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "??";

  // Get unread notification count
  // This runs server-side so it's fast and secure
  const { createServerSupabaseClient } = await import(
    "@/lib/supabase/server"
  );
  const supabase = createServerSupabaseClient();
  const { count } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("org_id", organization.id)
    .eq("is_read", false);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        orgName={organization.name}
        userName={user.full_name || "User"}
        userInitials={initials}
        unreadCount={count || 0}
      />
      <main className="flex-1 flex flex-col overflow-hidden min-w-0 md:pt-0 pt-14">
        {children}
      </main>
    </div>
  );
}
