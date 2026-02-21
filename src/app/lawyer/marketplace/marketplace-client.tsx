"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Search,
  Sparkles,
  Filter,
  MapPin,
  Clock,
  AlertTriangle,
  Scale,
  FileText,
  ChevronRight,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { PRACTICE_AREAS } from "@/config/practice-areas";

interface AvailableCase {
  id: string;
  case_number: string;
  case_type: string;
  sub_type?: string | null;
  status: string;
  state: string;
  county?: string | null;
  complexity_score?: number | null;
  urgency: string;
  plaintiff_name?: string | null;
  incident_description?: string | null;
  created_at: string;
}

interface LawyerProfile {
  practice_areas: string[];
  states_licensed: string[];
}

const urgencyColors: Record<string, string> = {
  urgent: "bg-red-100 text-red-700",
  high: "bg-orange-100 text-orange-700",
  normal: "bg-blue-100 text-blue-700",
  low: "bg-slate-100 text-slate-600",
};

const practiceAreaColors: Record<string, { bg: string; text: string; light: string }> = {
  family_law: { bg: "bg-rose-500", text: "text-rose-600", light: "bg-rose-50" },
  personal_injury: { bg: "bg-amber-500", text: "text-amber-600", light: "bg-amber-50" },
  estate_planning: { bg: "bg-emerald-500", text: "text-emerald-600", light: "bg-emerald-50" },
};

export function MarketplaceClient({
  availableCases,
  lawyerProfile,
  lawyerId,
}: {
  availableCases: AvailableCase[];
  lawyerProfile: LawyerProfile;
  lawyerId: string;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedArea, setSelectedArea] = useState<string>("all");
  const [showMyMatch, setShowMyMatch] = useState(false);
  const [requestingId, setRequestingId] = useState<string | null>(null);
  const [requestedIds, setRequestedIds] = useState<Set<string>>(new Set());

  let filtered = availableCases;

  // Filter by practice area
  if (selectedArea !== "all") {
    filtered = filtered.filter((c) => c.case_type === selectedArea);
  }

  // Filter by lawyer's matching profile
  if (showMyMatch) {
    filtered = filtered.filter(
      (c) =>
        lawyerProfile.practice_areas.includes(c.case_type) &&
        lawyerProfile.states_licensed.includes(c.state)
    );
  }

  // Filter by search
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(
      (c) =>
        c.case_number.toLowerCase().includes(q) ||
        c.case_type.toLowerCase().includes(q) ||
        (c.incident_description || "").toLowerCase().includes(q) ||
        (c.state || "").toLowerCase().includes(q)
    );
  }

  const matchingCases = availableCases.filter(
    (c) =>
      lawyerProfile.practice_areas.includes(c.case_type) &&
      lawyerProfile.states_licensed.includes(c.state)
  );

  async function handleRequestCase(caseId: string) {
    setRequestingId(caseId);
    try {
      const res = await fetch("/api/marketplace/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ case_id: caseId, lawyer_id: lawyerId }),
      });
      if (res.ok) {
        setRequestedIds((prev) => new Set(prev).add(caseId));
      }
    } catch {
      // Handle error silently
    } finally {
      setRequestingId(null);
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-violet-500" />
            Case Marketplace
          </h1>
          <p className="text-slate-600 mt-1">Browse and request available cases that need a lawyer</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-violet-500 to-purple-600 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-violet-100 text-sm">Available Cases</p>
                <p className="text-2xl font-bold">{availableCases.length}</p>
              </div>
              <FileText className="h-8 w-8 text-violet-200" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-sm">Matching Your Profile</p>
                <p className="text-2xl font-bold">{matchingCases.length}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-emerald-200" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-500 to-orange-600 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-100 text-sm">Urgent Cases</p>
                <p className="text-2xl font-bold">
                  {availableCases.filter((c) => c.urgency === "urgent" || c.urgency === "high").length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-amber-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search cases..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={showMyMatch ? "default" : "outline"}
            size="sm"
            onClick={() => setShowMyMatch(!showMyMatch)}
            className="gap-2"
          >
            <CheckCircle2 className="h-4 w-4" />
            My Match
          </Button>
          <Button
            variant={selectedArea === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedArea("all")}
          >
            All Areas
          </Button>
          {Object.entries(PRACTICE_AREAS).map(([code, area]) => (
            <Button
              key={code}
              variant={selectedArea === code ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedArea(code)}
            >
              {area.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Cases List */}
      {filtered.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <Search className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No cases available</h3>
            <p className="text-slate-500">Check back later for new cases or adjust your filters</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filtered.map((caseItem) => {
            const colors = practiceAreaColors[caseItem.case_type] || practiceAreaColors.family_law;
            const practiceArea = PRACTICE_AREAS[caseItem.case_type as keyof typeof PRACTICE_AREAS]?.name || caseItem.case_type;
            const isMatch =
              lawyerProfile.practice_areas.includes(caseItem.case_type) &&
              lawyerProfile.states_licensed.includes(caseItem.state);
            const isRequested = requestedIds.has(caseItem.id);
            const isRequesting = requestingId === caseItem.id;

            return (
              <Card key={caseItem.id} className={`hover:shadow-md transition-shadow ${isMatch ? "border-emerald-200" : ""}`}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      {/* Header */}
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="font-semibold text-slate-900">{caseItem.case_number}</span>
                        <Badge variant="outline" className={`${colors.text} ${colors.light}`}>
                          {practiceArea}
                        </Badge>
                        <Badge className={urgencyColors[caseItem.urgency]} variant="secondary">
                          {caseItem.urgency.charAt(0).toUpperCase() + caseItem.urgency.slice(1)}
                        </Badge>
                        {isMatch && (
                          <Badge className="bg-emerald-100 text-emerald-700" variant="secondary">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Match
                          </Badge>
                        )}
                      </div>

                      {/* Sub type */}
                      {caseItem.sub_type && (
                        <p className="text-sm font-medium text-slate-700">
                          {caseItem.sub_type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                        </p>
                      )}

                      {/* Description */}
                      {caseItem.incident_description && (
                        <p className="text-sm text-slate-600 line-clamp-2">{caseItem.incident_description}</p>
                      )}

                      {/* Meta */}
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {caseItem.state}{caseItem.county ? `, ${caseItem.county}` : ""}
                        </span>
                        {caseItem.complexity_score && (
                          <span className="flex items-center gap-1">
                            <Scale className="h-3.5 w-3.5" />
                            Complexity: {caseItem.complexity_score}/10
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {new Date(caseItem.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Action */}
                    <div className="flex flex-col items-end gap-2">
                      {isRequested ? (
                        <Button disabled variant="outline" className="gap-2">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          Requested
                        </Button>
                      ) : (
                        <Button
                          onClick={() => handleRequestCase(caseItem.id)}
                          disabled={isRequesting}
                          className="gap-2"
                        >
                          {isRequesting ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                          Request Case
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
