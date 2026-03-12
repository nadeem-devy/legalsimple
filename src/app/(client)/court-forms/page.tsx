import { createClient, isMockMode } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Clock, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { DownloadButton } from "@/components/court-forms/DownloadButton";
import { FilingInstructionsButton } from "@/components/court-forms/FilingInstructionsButton";

// Demo cases for mock mode
const DEMO_CASES = [
  {
    id: "demo-case-1",
    case_number: "DEMO-2024-001",
    case_type: "family_law",
    sub_type: "divorce_no_children",
    status: "pending_review",
    state: "AZ",
    county: "Maricopa",
    plaintiff_name: "John Demo Smith",
    defendant_name: "Jane Demo Smith",
    created_at: new Date().toISOString(),
    intake_sessions: [{ completed: true, collected_data: {} }],
  },
  {
    id: "demo-case-2",
    case_number: "DEMO-2024-002",
    case_type: "family_law",
    sub_type: "divorce_with_children",
    status: "document_ready",
    state: "AZ",
    county: "Pima",
    plaintiff_name: "Alice Demo",
    defendant_name: "Bob Demo",
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    intake_sessions: [{ completed: true, collected_data: {} }],
  },
];

const subTypeLabels: Record<string, string> = {
  divorce_no_children: "Dissolution of Marriage (No Children)",
  divorce_with_children: "Dissolution of Marriage (With Children)",
  establish_paternity: "Petition to Establish Paternity",
  modification: "Petition to Modify Existing Court Orders",
};

interface IntakeSession {
  completed: boolean;
  collected_data: unknown;
}

interface CaseWithIntake {
  id: string;
  case_number: string;
  case_type: string;
  sub_type: string;
  status: string;
  state: string;
  county: string;
  plaintiff_name: string;
  defendant_name: string;
  created_at: string;
  intake_sessions: IntakeSession | IntakeSession[] | null;
}

// Helper to extract wantsInjunction from intake data
function getWantsInjunction(intakeSessions: IntakeSession | IntakeSession[] | null): boolean {
  if (!intakeSessions) return true; // Default to showing the button
  const session = Array.isArray(intakeSessions)
    ? intakeSessions.find((s) => s.completed && s.collected_data)
    : intakeSessions;
  if (!session?.collected_data) return true;
  const data = session.collected_data as Record<string, unknown>;
  // Check both field names: divorce uses wantsInjunction, paternity uses wantsPreliminaryInjunction
  if (data.wantsInjunction === false || data.wantsPreliminaryInjunction === false) return false;
  return true;
}

// Helper to check if intake is completed
function hasCompletedIntake(intakeSessions: IntakeSession | IntakeSession[] | null): boolean {
  if (!intakeSessions) return false;

  // Handle array case
  if (Array.isArray(intakeSessions)) {
    return intakeSessions.some((s) => s.completed && s.collected_data);
  }

  // Handle single object case
  return intakeSessions.completed && !!intakeSessions.collected_data;
}

export default async function CourtFormsPage() {
  let cases: CaseWithIntake[] = [];

  if (isMockMode()) {
    cases = DEMO_CASES;
  } else {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      // Get cases with completed intake sessions
      const { data: casesData } = await supabase
        .from("cases")
        .select("*, intake_sessions(*)")
        .eq("client_id", user.id)
        .in("sub_type", ["divorce_no_children", "divorce_with_children", "establish_paternity", "modification"])
        .order("created_at", { ascending: false });

      // Filter to only cases with completed intake
      cases = (casesData || []).filter(
        (c: CaseWithIntake) => hasCompletedIntake(c.intake_sessions)
      );
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Court Forms</h1>
          <p className="text-slate-600">
            Download court-ready PDF petitions for your completed cases
          </p>
        </div>
        <FilingInstructionsButton />
      </div>

      {/* Info Banner */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="py-4">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Arizona Superior Court Format</p>
              <p>
                These documents are formatted for Arizona Superior Court. They include
                all information collected during your intake process. Review carefully
                before filing.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cases List */}
      {cases.length > 0 ? (
        <div className="space-y-4">
          {cases.map((caseItem) => (
            <Card key={caseItem.id} className="hover:shadow-md transition-shadow">
              <CardContent className="py-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-slate-400" />
                      <span className="font-semibold text-slate-900">
                        {caseItem.case_number || `Case ${caseItem.id.slice(0, 8)}`}
                      </span>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        Ready to Download
                      </Badge>
                    </div>

                    <div className="ml-8 space-y-1">
                      <p className="text-sm font-medium text-slate-700">
                        {subTypeLabels[caseItem.sub_type] || "Petition for Dissolution of Marriage"}
                      </p>
                      <p className="text-sm text-slate-600">
                        {caseItem.plaintiff_name} vs. {caseItem.defendant_name}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-slate-400">
                        <span>{caseItem.county} County, {caseItem.state}</span>
                        <span className="text-slate-300">•</span>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Created {format(new Date(caseItem.created_at), "MMM d, yyyy 'at' h:mm a")}
                        </div>
                      </div>
                    </div>
                  </div>

                  <DownloadButton
                    caseId={caseItem.id}
                    caseName={caseItem.case_number || caseItem.id}
                    petitionerName={caseItem.plaintiff_name}
                    caseSubType={caseItem.sub_type}
                    caseState={caseItem.state}
                    wantsInjunction={getWantsInjunction(caseItem.intake_sessions)}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <FileText className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-slate-900 mb-1">
                No court forms available
              </h3>
              <p className="text-slate-600 max-w-md mx-auto">
                Complete a divorce intake to generate court-ready petition forms.
                Start a new case from the dashboard to begin.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
