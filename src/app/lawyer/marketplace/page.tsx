import { createClient, isMockMode } from "@/lib/supabase/server";
import { MarketplaceClient } from "./marketplace-client";

// Demo available cases for mock mode
const DEMO_AVAILABLE_CASES = [
  {
    id: "m1",
    case_number: "LS-20240125-0010",
    case_type: "family_law",
    sub_type: "divorce",
    status: "pending_review",
    state: "AZ",
    county: "Maricopa",
    complexity_score: 4,
    urgency: "normal",
    plaintiff_name: "Anonymous Client",
    incident_description: "Uncontested divorce, no children, limited assets to divide.",
    created_at: "2024-01-25T00:00:00Z",
  },
  {
    id: "m2",
    case_number: "LS-20240126-0011",
    case_type: "personal_injury",
    sub_type: "car_accident",
    status: "lawyer_requested",
    state: "NV",
    county: "Clark",
    complexity_score: 6,
    urgency: "high",
    plaintiff_name: "Anonymous Client",
    incident_description: "Rear-end collision on highway. Multiple injuries, medical bills exceeding $25,000.",
    created_at: "2024-01-26T00:00:00Z",
  },
  {
    id: "m3",
    case_number: "LS-20240127-0012",
    case_type: "estate_planning",
    sub_type: "living_trust",
    status: "pending_review",
    state: "AZ",
    county: "Pima",
    complexity_score: 7,
    urgency: "low",
    plaintiff_name: "Anonymous Client",
    incident_description: "Complex estate with multiple properties across states. Needs trust and succession planning.",
    created_at: "2024-01-27T00:00:00Z",
  },
  {
    id: "m4",
    case_number: "LS-20240128-0013",
    case_type: "family_law",
    sub_type: "child_custody",
    status: "lawyer_requested",
    state: "AZ",
    county: "Maricopa",
    complexity_score: 8,
    urgency: "urgent",
    plaintiff_name: "Anonymous Client",
    incident_description: "Contested custody dispute. Concerns about child welfare. Needs immediate legal representation.",
    created_at: "2024-01-28T00:00:00Z",
  },
  {
    id: "m5",
    case_number: "LS-20240129-0014",
    case_type: "personal_injury",
    sub_type: "workplace_injury",
    status: "pending_review",
    state: "TX",
    county: "Harris",
    complexity_score: 5,
    urgency: "normal",
    plaintiff_name: "Anonymous Client",
    incident_description: "Construction site injury. Employer may have violated safety regulations.",
    created_at: "2024-01-29T00:00:00Z",
  },
];

const DEMO_LAWYER_PROFILE = {
  practice_areas: ["family_law", "estate_planning"],
  states_licensed: ["AZ", "NV"],
};

export default async function MarketplacePage() {
  if (isMockMode()) {
    return (
      <MarketplaceClient
        availableCases={DEMO_AVAILABLE_CASES}
        lawyerProfile={DEMO_LAWYER_PROFILE}
        lawyerId="demo-lawyer-123"
      />
    );
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Get the lawyer's profile to know their practice areas and states
  const { data: lawyerProfile } = await supabase
    .from("lawyer_profiles")
    .select("practice_areas, states_licensed")
    .eq("user_id", user?.id)
    .single();

  // Fetch available cases (not yet assigned to a lawyer)
  const { data: availableCases } = await supabase
    .from("cases")
    .select("id, case_number, case_type, sub_type, status, state, county, complexity_score, urgency, plaintiff_name, incident_description, created_at")
    .in("status", ["pending_review", "lawyer_requested"])
    .order("created_at", { ascending: false });

  // Filter: only null lawyer_id cases (Supabase IS NULL not well supported in mock, filter in code)
  const unassigned = (availableCases || []).filter((c: { lawyer_id?: string | null }) => !c.lawyer_id);

  return (
    <MarketplaceClient
      availableCases={unassigned}
      lawyerProfile={lawyerProfile || { practice_areas: [], states_licensed: [] }}
      lawyerId={user?.id || ""}
    />
  );
}
