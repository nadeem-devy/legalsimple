import { redirect } from "next/navigation";
import { createClient, isMockMode } from "@/lib/supabase/server";
import { Sidebar } from "@/components/layout/Sidebar";
import { getUnreadCount } from "@/lib/chat/unread";

const baseNavigation = [
  { name: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
  { name: "New Case", href: "/chat", icon: "MessageSquare" },
  { name: "My Cases", href: "/cases", icon: "FolderOpen" },
  { name: "Court Forms", href: "/court-forms", icon: "FileCode" },
  { name: "Find a Lawyer", href: "/lawyers", icon: "Users" },
  { name: "Messages", href: "/messages", icon: "Mail" },
  { name: "Settings", href: "/settings", icon: "Settings" },
  { name: "Help", href: "/help", icon: "HelpCircle" },
];

// Demo data for mock mode
const DEMO_USER = {
  id: 'demo-user-123',
  email: 'demo@legalsimple.ai',
};

const DEMO_PROFILE = {
  id: 'demo-user-123',
  email: 'demo@legalsimple.ai',
  full_name: 'Demo User',
  role: 'client',
  state: 'AZ',
};

export default async function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let user = DEMO_USER;
  let profile = DEMO_PROFILE;

  if (!isMockMode()) {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();

    if (!authUser) {
      redirect("/login");
    }

    user = authUser;

    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    profile = profileData || DEMO_PROFILE;
  }

  // Fetch unread message count for sidebar badge
  let unreadCount = 0;
  try {
    unreadCount = await getUnreadCount(user.id);
  } catch {
    // Silently fail - badge just won't show
  }

  const navigation = baseNavigation.map((item) =>
    item.name === "Messages" && unreadCount > 0
      ? { ...item, badge: String(unreadCount) }
      : item
  );

  return (
    <Sidebar
      navigation={navigation}
      userRole="client"
      userName={profile?.full_name || "User"}
      userEmail={user.email || ""}
      userInitial={profile?.full_name?.charAt(0) || user.email?.charAt(0)?.toUpperCase()}
    >
      {children}
    </Sidebar>
  );
}
