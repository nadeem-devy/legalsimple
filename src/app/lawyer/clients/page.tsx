import { createClient, createAdminClient, isMockMode } from "@/lib/supabase/server";
import { ClientsClient } from "./clients-client";

// Demo data for mock mode
const DEMO_CLIENTS = [
  {
    id: "c1",
    full_name: "Sarah Johnson",
    email: "sarah.johnson@email.com",
    phone: "(602) 555-0123",
    state: "AZ",
    total_cases: 2,
    active_cases: 1,
    status: "active" as const,
  },
  {
    id: "c2",
    full_name: "Michael Chen",
    email: "m.chen@email.com",
    phone: "(480) 555-0456",
    state: "AZ",
    total_cases: 1,
    active_cases: 1,
    status: "active" as const,
  },
  {
    id: "c3",
    full_name: "Emma Williams",
    email: "emma.w@email.com",
    phone: "(623) 555-0789",
    state: "NV",
    total_cases: 1,
    active_cases: 1,
    status: "active" as const,
  },
  {
    id: "c4",
    full_name: "David Martinez",
    email: "david.m@email.com",
    phone: "(520) 555-0147",
    state: "AZ",
    total_cases: 3,
    active_cases: 0,
    status: "inactive" as const,
  },
  {
    id: "c5",
    full_name: "Linda Thompson",
    email: "linda.t@email.com",
    phone: "(928) 555-0258",
    state: "AZ",
    total_cases: 2,
    active_cases: 0,
    status: "inactive" as const,
  },
];

export interface ClientData {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  state: string | null;
  total_cases: number;
  active_cases: number;
  status: "active" | "inactive";
}

const ACTIVE_STATUSES = ["intake", "pending_review", "lawyer_requested", "lawyer_assigned", "in_progress", "document_ready", "document_reviewed", "escalated"];

export default async function ClientsPage() {
  if (isMockMode()) {
    return <ClientsClient clients={DEMO_CLIENTS} />;
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Get all cases for this lawyer
  const { data: cases } = await supabase
    .from("cases")
    .select("client_id, status")
    .eq("lawyer_id", user?.id);

  // Collect unique client IDs and aggregate case stats
  const caseStats = new Map<string, { total: number; active: number }>();
  (cases || []).forEach((c: { client_id: string | null; status: string }) => {
    if (!c.client_id) return;
    const existing = caseStats.get(c.client_id) || { total: 0, active: 0 };
    existing.total += 1;
    if (ACTIVE_STATUSES.includes(c.status)) existing.active += 1;
    caseStats.set(c.client_id, existing);
  });

  const clientIds = Array.from(caseStats.keys());

  // Fetch client profiles using admin client (bypasses RLS)
  let clients: ClientData[] = [];
  if (clientIds.length > 0) {
    const adminClient = await createAdminClient();
    const { data: profiles } = await adminClient
      .from("profiles")
      .select("id, full_name, email, phone, state")
      .in("id", clientIds);

    clients = (profiles || []).map((p: { id: string; full_name: string | null; email: string | null; phone: string | null; state: string | null }) => {
      const stats = caseStats.get(p.id) || { total: 0, active: 0 };
      return {
        id: p.id,
        full_name: p.full_name,
        email: p.email,
        phone: p.phone,
        state: p.state,
        total_cases: stats.total,
        active_cases: stats.active,
        status: stats.active > 0 ? "active" as const : "inactive" as const,
      };
    });
  }

  return <ClientsClient clients={clients} />;
}
