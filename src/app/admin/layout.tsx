import { redirect } from "next/navigation";
import { createClient, isMockMode } from "@/lib/supabase/server";
import { Sidebar } from "@/components/layout/Sidebar";

const navigation = [
  { name: "Dashboard", href: "/admin/dashboard", icon: "LayoutDashboard" },
  { name: "Users", href: "/admin/users", icon: "Users" },
  { name: "Lawyers", href: "/admin/lawyers", icon: "Briefcase" },
  { name: "Cases", href: "/admin/cases", icon: "FolderOpen" },
  { name: "Documents", href: "/admin/documents", icon: "FileText" },
  { name: "DocSpring", href: "/admin/docspring", icon: "FileCode" },
  { name: "Analytics", href: "/admin/analytics", icon: "BarChart3" },
  { name: "Settings", href: "/admin/settings", icon: "Settings" },
];

// Demo data for mock mode
const DEMO_USER = {
  id: 'demo-admin-123',
  email: 'admin@legalsimple.ai',
};

const DEMO_PROFILE = {
  id: 'demo-admin-123',
  email: 'admin@legalsimple.ai',
  full_name: 'Demo Admin',
  role: 'admin',
  state: 'AZ',
};

export default async function AdminLayout({
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

    if (profileData?.role !== "admin") {
      redirect("/dashboard");
    }

    profile = profileData || DEMO_PROFILE;
  }

  return (
    <Sidebar
      navigation={navigation}
      userRole="admin"
      userName={profile?.full_name || "Admin"}
      userEmail={user.email || ""}
      userInitial={profile?.full_name?.charAt(0) || "A"}
    >
      {children}
    </Sidebar>
  );
}
