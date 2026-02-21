import { createClient, isMockMode } from "@/lib/supabase/server";
import { EarningsClient } from "./earnings-client";

export interface TransactionData {
  id: string;
  description: string;
  client_name: string;
  amount: number;
  type: "earning" | "fee" | "withdrawal";
  status: string;
  date: string;
}

// Demo data for mock mode
const DEMO_TRANSACTIONS: TransactionData[] = [
  {
    id: "1",
    description: "Case LS-2024-001 - Divorce Settlement",
    client_name: "Sarah Johnson",
    amount: 2500,
    type: "earning",
    status: "completed",
    date: "2024-01-28",
  },
  {
    id: "2",
    description: "Case LS-2024-002 - Living Trust Setup",
    client_name: "Michael Chen",
    amount: 1800,
    type: "earning",
    status: "pending",
    date: "2024-01-27",
  },
  {
    id: "3",
    description: "Platform Fee - January",
    client_name: "LegalSimple",
    amount: 150,
    type: "fee",
    status: "completed",
    date: "2024-01-25",
  },
  {
    id: "4",
    description: "Case LS-2024-003 - Initial Consultation",
    client_name: "Emma Williams",
    amount: 350,
    type: "earning",
    status: "completed",
    date: "2024-01-24",
  },
  {
    id: "5",
    description: "Case LS-2024-004 - Child Custody",
    client_name: "David Martinez",
    amount: 3200,
    type: "earning",
    status: "completed",
    date: "2024-01-18",
  },
  {
    id: "6",
    description: "Case LS-2024-005 - Will Preparation",
    client_name: "Linda Thompson",
    amount: 800,
    type: "earning",
    status: "completed",
    date: "2024-01-15",
  },
];

export default async function EarningsPage() {
  if (isMockMode()) {
    return <EarningsClient transactions={DEMO_TRANSACTIONS} />;
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch payments for this lawyer
  const { data: payments } = await supabase
    .from("payments")
    .select("*, case:cases(case_number, case_type), client:profiles!client_id(full_name)")
    .eq("lawyer_id", user?.id)
    .order("created_at", { ascending: false });

  // Transform payments into transaction data
  const transactions: TransactionData[] = (payments || []).map((p: {
    id: string;
    amount: number;
    status: string;
    payment_type: string | null;
    created_at: string;
    case?: { case_number: string; case_type: string } | null;
    client?: { full_name: string | null } | null;
  }) => ({
    id: p.id,
    description: p.case ? `Case ${p.case.case_number}` : "Payment",
    client_name: p.client?.full_name || "Unknown",
    amount: p.amount,
    type: p.payment_type === "document_fee" || p.payment_type === "filing_fee" ? "fee" as const : "earning" as const,
    status: p.status,
    date: p.created_at,
  }));

  return <EarningsClient transactions={transactions} />;
}
