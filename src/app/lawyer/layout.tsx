import { redirect } from "next/navigation";
import { createClient, isMockMode } from "@/lib/supabase/server";
import { Sidebar } from "@/components/layout/Sidebar";
import { getUnreadCount } from "@/lib/chat/unread";

const baseNavigation = [
  { name: "Dashboard", href: "/lawyer/dashboard", icon: "LayoutDashboard" },
  { name: "My Cases", href: "/lawyer/cases", icon: "FolderOpen" },
  { name: "Clients", href: "/lawyer/clients", icon: "Users" },
  { name: "Messages", href: "/lawyer/messages", icon: "MessageSquare" },
  { name: "Earnings", href: "/lawyer/earnings", icon: "DollarSign" },
  { name: "Settings", href: "/lawyer/settings", icon: "Settings" },
];

// Demo data for mock mode
const DEMO_USER = {
  id: 'demo-lawyer-123',
  email: 'lawyer@legalsimple.ai',
};

const DEMO_PROFILE = {
  id: 'demo-lawyer-123',
  email: 'lawyer@legalsimple.ai',
  full_name: 'Demo Lawyer',
  role: 'lawyer',
  state: 'AZ',
};

const DEMO_LAWYER_PROFILE = {
  id: 'lawyer-001',
  user_id: 'demo-lawyer-123',
  bar_number: 'AZ-12345',
  bar_state: 'AZ',
  verified: true,
  practice_areas: ['family_law', 'estate_planning'],
  states_licensed: ['AZ', 'NV'],
  hourly_rate: 250,
  years_experience: 15,
  rating: 4.8,
  total_cases: 234,
};

export default async function LawyerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let user = DEMO_USER;
  let profile = DEMO_PROFILE;
  let lawyerProfile = DEMO_LAWYER_PROFILE;

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

    if (profileData?.role !== "lawyer" && profileData?.role !== "admin") {
      redirect("/dashboard");
    }

    profile = profileData || DEMO_PROFILE;

    const { data: lawyerData } = await supabase
      .from("lawyer_profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    lawyerProfile = lawyerData || DEMO_LAWYER_PROFILE;
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
      userRole="lawyer"
      userName={profile?.full_name || "Lawyer"}
      userEmail={user.email || ""}
      userInitial={profile?.full_name?.charAt(0) || user.email?.charAt(0)?.toUpperCase()}
      verified={lawyerProfile?.verified}
    >
      {children}
    </Sidebar>
  );
}
