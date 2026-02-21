import { createClient, isMockMode } from "@/lib/supabase/server";
import { SettingsClient } from "./settings-client";

const DEMO_PROFILE = {
  id: "demo-lawyer-123",
  full_name: "Demo Lawyer",
  email: "lawyer@legalsimple.ai",
  phone: "(602) 555-0123",
  state: "AZ",
};

const DEMO_LAWYER_PROFILE = {
  id: "lawyer-001",
  user_id: "demo-lawyer-123",
  bar_number: "AZ-12345",
  bar_state: "AZ",
  verified: true,
  practice_areas: ["family_law", "estate_planning"],
  states_licensed: ["AZ", "NV"],
  hourly_rate: 250,
  years_experience: 15,
  bio: "Experienced family law and estate planning attorney with over 15 years of practice in Arizona. Dedicated to providing compassionate and effective legal representation.",
  availability_status: "available",
};

export default async function SettingsPage() {
  if (isMockMode()) {
    return <SettingsClient profile={DEMO_PROFILE} lawyerProfile={DEMO_LAWYER_PROFILE} />;
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, email, phone, state")
    .eq("id", user?.id)
    .single();

  const { data: lawyerProfile } = await supabase
    .from("lawyer_profiles")
    .select("*")
    .eq("user_id", user?.id)
    .single();

  return (
    <SettingsClient
      profile={profile || DEMO_PROFILE}
      lawyerProfile={lawyerProfile || DEMO_LAWYER_PROFILE}
    />
  );
}
