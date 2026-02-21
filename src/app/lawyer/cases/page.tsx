import { createClient, isMockMode } from "@/lib/supabase/server";
import { CasesClient } from "./cases-client";

// Demo data for mock mode
const DEMO_CASES = [
  {
    id: "1",
    case_number: "LS-20240115-0001",
    case_type: "family_law",
    sub_type: "divorce",
    status: "in_progress",
    urgency: "high",
    state: "AZ",
    county: "Maricopa",
    plaintiff_name: "Sarah Johnson",
    created_at: "2024-01-15T00:00:00Z",
    updated_at: "2024-01-28T00:00:00Z",
    client: { full_name: "Sarah Johnson", email: "sarah@email.com" },
    documents: [{ id: "d1" }, { id: "d2" }, { id: "d3" }],
  },
  {
    id: "2",
    case_number: "LS-20240118-0002",
    case_type: "estate_planning",
    sub_type: "living_trust",
    status: "in_progress",
    urgency: "normal",
    state: "AZ",
    county: "Maricopa",
    plaintiff_name: "Michael Chen",
    created_at: "2024-01-18T00:00:00Z",
    updated_at: "2024-01-27T00:00:00Z",
    client: { full_name: "Michael Chen", email: "m.chen@email.com" },
    documents: [{ id: "d4" }, { id: "d5" }],
  },
  {
    id: "3",
    case_number: "LS-20240120-0003",
    case_type: "personal_injury",
    sub_type: "car_accident",
    status: "pending_review",
    urgency: "high",
    state: "NV",
    county: "Clark",
    plaintiff_name: "Emma Williams",
    created_at: "2024-01-20T00:00:00Z",
    updated_at: "2024-01-26T00:00:00Z",
    client: { full_name: "Emma Williams", email: "emma@email.com" },
    documents: [{ id: "d6" }],
  },
  {
    id: "4",
    case_number: "LS-20231201-0004",
    case_type: "family_law",
    sub_type: "child_custody",
    status: "closed",
    urgency: "normal",
    state: "AZ",
    county: "Pima",
    plaintiff_name: "David Martinez",
    created_at: "2023-12-01T00:00:00Z",
    updated_at: "2024-01-25T00:00:00Z",
    client: { full_name: "David Martinez", email: "david@email.com" },
    documents: [{ id: "d7" }, { id: "d8" }, { id: "d9" }, { id: "d10" }],
  },
  {
    id: "5",
    case_number: "LS-20231115-0005",
    case_type: "estate_planning",
    sub_type: "will",
    status: "filed",
    urgency: "low",
    state: "AZ",
    county: "Maricopa",
    plaintiff_name: "Linda Thompson",
    created_at: "2023-11-15T00:00:00Z",
    updated_at: "2024-01-20T00:00:00Z",
    client: { full_name: "Linda Thompson", email: "linda@email.com" },
    documents: [{ id: "d11" }, { id: "d12" }],
  },
];

export default async function CasesPage() {
  if (isMockMode()) {
    return <CasesClient cases={DEMO_CASES} />;
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch all cases assigned to this lawyer, with client profile and document count
  const { data: cases } = await supabase
    .from("cases")
    .select("*, client:profiles!client_id(full_name, email), documents(id)")
    .eq("lawyer_id", user?.id)
    .order("created_at", { ascending: false });

  return <CasesClient cases={cases || []} />;
}
