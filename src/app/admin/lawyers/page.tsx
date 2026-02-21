"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Scale,
  Search,
  RefreshCw,
  Loader2,
  Eye,
  MoreHorizontal,
  CheckCircle,
  Clock,
  Star,
  Briefcase,
  Mail,
  Phone,
  Award,
  Shield,
  UserCheck,
  UserX,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

interface Lawyer {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone?: string | null;
  bar_number: string;
  bar_state: string;
  verified: boolean;
  practice_areas: string[];
  states_licensed: string[];
  hourly_rate?: number | null;
  bio?: string | null;
  years_experience?: number | null;
  availability_status: "available" | "busy" | "unavailable";
  rating: number;
  total_cases: number;
  created_at: string;
}

const practiceAreaLabels: Record<string, string> = {
  family_law: "Family Law",
  personal_injury: "Personal Injury",
  estate_planning: "Estate Planning",
  business_formation: "Business Formation",
  criminal_defense: "Criminal Defense",
  immigration: "Immigration",
  real_estate: "Real Estate",
  employment_law: "Employment Law",
};

const availabilityConfig: Record<
  string,
  { label: string; color: string }
> = {
  available: {
    label: "Available",
    color: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
  },
  busy: {
    label: "Busy",
    color: "bg-amber-500/15 text-amber-400 border border-amber-500/30",
  },
  unavailable: {
    label: "Unavailable",
    color: "bg-slate-500/15 text-slate-400 border border-slate-500/30",
  },
};

export default function AdminLawyersPage() {
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lawyers, setLawyers] = useState<Lawyer[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [verifiedFilter, setVerifiedFilter] = useState<string>("all");
  const [stateFilter, setStateFilter] = useState<string>("all");
  const [selectedLawyer, setSelectedLawyer] = useState<Lawyer | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isVerifyDialogOpen, setIsVerifyDialogOpen] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const loadLawyers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/lawyers");
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to fetch lawyers");
      }
      const data = await res.json();
      setLawyers(data.lawyers);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load lawyers";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    loadLawyers();
  }, [loadLawyers]);

  // Derive unique states from real data for the filter dropdown
  const uniqueStates = useMemo(() => {
    const states = new Set<string>();
    lawyers.forEach((l) => {
      l.states_licensed.forEach((s) => states.add(s));
    });
    return Array.from(states).sort();
  }, [lawyers]);

  const handleViewLawyer = (lawyer: Lawyer) => {
    setSelectedLawyer(lawyer);
    setIsDetailOpen(true);
  };

  const handleVerifyLawyer = (lawyer: Lawyer) => {
    setSelectedLawyer(lawyer);
    setIsVerifyDialogOpen(true);
  };

  const confirmVerification = async (approve: boolean) => {
    if (!selectedLawyer) return;

    setIsActionLoading(true);
    try {
      const res = await fetch("/api/admin/lawyers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lawyerId: selectedLawyer.id,
          action: "verify",
          value: approve,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update verification");
      }

      setLawyers((prev) =>
        prev.map((l) =>
          l.id === selectedLawyer.id ? { ...l, verified: approve } : l
        )
      );

      toast.success(
        approve
          ? `${selectedLawyer.full_name} has been verified`
          : `${selectedLawyer.full_name}'s verification has been rejected`
      );

      setIsVerifyDialogOpen(false);
      setSelectedLawyer(null);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update verification"
      );
    } finally {
      setIsActionLoading(false);
    }
  };

  const filteredLawyers = lawyers.filter((l) => {
    const matchesSearch =
      l.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.bar_number.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesVerified =
      verifiedFilter === "all" ||
      (verifiedFilter === "verified" && l.verified) ||
      (verifiedFilter === "pending" && !l.verified);
    const matchesState =
      stateFilter === "all" || l.states_licensed.includes(stateFilter);
    return matchesSearch && matchesVerified && matchesState;
  });

  const stats = {
    total: lawyers.length,
    verified: lawyers.filter((l) => l.verified).length,
    pending: lawyers.filter((l) => !l.verified).length,
    available: lawyers.filter(
      (l) => l.availability_status === "available" && l.verified
    ).length,
  };

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Lawyers</h1>
          <p className="text-slate-400">
            Manage lawyer profiles and verifications
          </p>
        </div>
        <Button variant="outline" onClick={loadLawyers} disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800/80 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-400">
                  Total Lawyers
                </p>
                <p className="text-3xl font-bold text-white mt-1">
                  {stats.total}
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-slate-700/50 flex items-center justify-center">
                <Scale className="h-6 w-6 text-slate-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/80 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-400">Verified</p>
                <p className="text-3xl font-bold text-emerald-400 mt-1">
                  {stats.verified}
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-emerald-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/80 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-400">
                  Pending Verification
                </p>
                <p className="text-3xl font-bold text-amber-400 mt-1">
                  {stats.pending}
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Clock className="h-6 w-6 text-amber-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/80 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-400">
                  Available Now
                </p>
                <p className="text-3xl font-bold text-purple-400 mt-1">
                  {stats.available}
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <UserCheck className="h-6 w-6 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-slate-800/80 border-slate-700">
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[250px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input
                  placeholder="Search by name, email, or bar number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500"
                />
              </div>
            </div>
            <Select value={verifiedFilter} onValueChange={setVerifiedFilter}>
              <SelectTrigger className="w-[160px] bg-slate-900/50 border-slate-600 text-white">
                <SelectValue placeholder="Verification" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
            <Select value={stateFilter} onValueChange={setStateFilter}>
              <SelectTrigger className="w-[150px] bg-slate-900/50 border-slate-600 text-white">
                <SelectValue placeholder="State" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All States</SelectItem>
                {uniqueStates.map((state) => (
                  <SelectItem key={state} value={state}>
                    {state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lawyers Table */}
      <Card className="bg-slate-800/80 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-lg">All Lawyers</CardTitle>
          <CardDescription className="text-slate-400">
            {filteredLawyers.length} lawyer
            {filteredLawyers.length !== 1 ? "s" : ""} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-500 mx-auto mb-3" />
                <p className="text-sm text-slate-400">Loading lawyers...</p>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">
                Failed to Load Lawyers
              </h3>
              <p className="text-slate-400 mb-4">{error}</p>
              <Button variant="outline" onClick={loadLawyers}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          ) : filteredLawyers.length === 0 ? (
            <div className="text-center py-16">
              <Scale className="h-12 w-12 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">
                No Lawyers Found
              </h3>
              <p className="text-slate-400">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="rounded-lg border border-slate-700 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-700 bg-slate-900/50 hover:bg-slate-900/50">
                    <TableHead className="text-slate-300 font-semibold py-3">
                      Lawyer
                    </TableHead>
                    <TableHead className="text-slate-300 font-semibold py-3">
                      Bar Info
                    </TableHead>
                    <TableHead className="text-slate-300 font-semibold py-3">
                      Practice Areas
                    </TableHead>
                    <TableHead className="text-slate-300 font-semibold py-3">
                      Licensed States
                    </TableHead>
                    <TableHead className="text-slate-300 font-semibold py-3">
                      Status
                    </TableHead>
                    <TableHead className="text-slate-300 font-semibold py-3">
                      Rating
                    </TableHead>
                    <TableHead className="text-slate-300 font-semibold py-3 text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLawyers.map((lawyer) => (
                    <TableRow
                      key={lawyer.id}
                      className="border-slate-700/50 hover:bg-slate-700/30 transition-colors"
                    >
                      {/* Lawyer */}
                      <TableCell className="py-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 ring-2 ring-slate-700">
                            <AvatarFallback className="bg-purple-500/20 text-purple-400 text-sm font-medium">
                              {lawyer.full_name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="font-medium text-white truncate">
                              {lawyer.full_name}
                            </p>
                            <p className="text-sm text-slate-400 truncate">
                              {lawyer.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      {/* Bar Info */}
                      <TableCell>
                        <div>
                          <code className="text-sm bg-slate-700/50 text-slate-200 px-2 py-0.5 rounded font-mono">
                            {lawyer.bar_number}
                          </code>
                          <p className="text-sm text-slate-400 mt-1">
                            {lawyer.bar_state} Bar
                          </p>
                        </div>
                      </TableCell>

                      {/* Practice Areas */}
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {lawyer.practice_areas.map((area) => (
                            <Badge
                              key={area}
                              variant="outline"
                              className="text-xs border-slate-600 text-slate-300"
                            >
                              {practiceAreaLabels[area] || area}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>

                      {/* States */}
                      <TableCell>
                        <div className="flex gap-1">
                          {lawyer.states_licensed.map((state) => (
                            <Badge
                              key={state}
                              variant="outline"
                              className="text-xs border-slate-600 text-slate-300 font-medium"
                            >
                              {state}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        {lawyer.verified ? (
                          <Badge className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        ) : (
                          <Badge className="bg-amber-500/15 text-amber-400 border border-amber-500/30">
                            <Clock className="h-3 w-3 mr-1" />
                            Pending
                          </Badge>
                        )}
                      </TableCell>

                      {/* Rating */}
                      <TableCell>
                        {lawyer.verified && lawyer.rating > 0 ? (
                          <div className="flex items-center gap-1.5">
                            <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                            <span className="text-white font-medium">
                              {lawyer.rating}
                            </span>
                            <span className="text-sm text-slate-400">
                              ({lawyer.total_cases})
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-500">—</span>
                        )}
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-slate-400 hover:text-white hover:bg-slate-700"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="bg-slate-800 border-slate-700"
                          >
                            <DropdownMenuItem
                              onClick={() => handleViewLawyer(lawyer)}
                              className="text-slate-300 focus:text-white focus:bg-slate-700"
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Profile
                            </DropdownMenuItem>
                            {!lawyer.verified && (
                              <>
                                <DropdownMenuSeparator className="bg-slate-700" />
                                <DropdownMenuItem
                                  onClick={() => handleVerifyLawyer(lawyer)}
                                  className="text-slate-300 focus:text-white focus:bg-slate-700"
                                >
                                  <Shield className="h-4 w-4 mr-2" />
                                  Review Verification
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lawyer Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Scale className="h-5 w-5" />
              Lawyer Profile
            </DialogTitle>
          </DialogHeader>

          {selectedLawyer && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 ring-2 ring-slate-600">
                  <AvatarFallback className="bg-purple-500/20 text-purple-400 text-xl font-medium">
                    {selectedLawyer.full_name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold text-white">
                    {selectedLawyer.full_name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    {selectedLawyer.verified ? (
                      <Badge className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    ) : (
                      <Badge className="bg-amber-500/15 text-amber-400 border border-amber-500/30">
                        <Clock className="h-3 w-3 mr-1" />
                        Pending Verification
                      </Badge>
                    )}
                    {selectedLawyer.years_experience && (
                      <Badge
                        variant="outline"
                        className="border-slate-600 text-slate-300"
                      >
                        {selectedLawyer.years_experience} years exp.
                      </Badge>
                    )}
                    <Badge
                      className={
                        availabilityConfig[selectedLawyer.availability_status]
                          ?.color
                      }
                    >
                      {
                        availabilityConfig[selectedLawyer.availability_status]
                          ?.label
                      }
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-slate-900/50 border border-slate-700">
                <div>
                  <p className="text-sm text-slate-500 flex items-center gap-1.5 mb-1">
                    <Mail className="h-3 w-3" /> Email
                  </p>
                  <p className="font-medium text-white text-sm">
                    {selectedLawyer.email}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 flex items-center gap-1.5 mb-1">
                    <Phone className="h-3 w-3" /> Phone
                  </p>
                  <p className="font-medium text-white text-sm">
                    {selectedLawyer.phone || "Not provided"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 flex items-center gap-1.5 mb-1">
                    <Award className="h-3 w-3" /> Bar Number
                  </p>
                  <p className="font-medium text-white text-sm">
                    {selectedLawyer.bar_number} ({selectedLawyer.bar_state})
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">Hourly Rate</p>
                  <p className="font-medium text-white text-sm">
                    {selectedLawyer.hourly_rate
                      ? `$${selectedLawyer.hourly_rate}/hr`
                      : "Not set"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">Practice Areas</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedLawyer.practice_areas.map((area) => (
                      <Badge
                        key={area}
                        variant="outline"
                        className="text-xs border-slate-600 text-slate-300"
                      >
                        {practiceAreaLabels[area] || area}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">Licensed States</p>
                  <div className="flex gap-1 mt-1">
                    {selectedLawyer.states_licensed.map((state) => (
                      <Badge
                        key={state}
                        variant="outline"
                        className="text-xs border-slate-600 text-slate-300 font-medium"
                      >
                        {state}
                      </Badge>
                    ))}
                  </div>
                </div>
                {selectedLawyer.verified && selectedLawyer.rating > 0 && (
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Rating</p>
                    <div className="flex items-center gap-1.5">
                      <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                      <span className="text-white font-medium">
                        {selectedLawyer.rating}
                      </span>
                      <span className="text-sm text-slate-400">
                        ({selectedLawyer.total_cases} cases)
                      </span>
                    </div>
                  </div>
                )}
                {selectedLawyer.total_cases > 0 && (
                  <div>
                    <p className="text-sm text-slate-500 flex items-center gap-1.5 mb-1">
                      <Briefcase className="h-3 w-3" /> Total Cases
                    </p>
                    <p className="font-medium text-white text-sm">
                      {selectedLawyer.total_cases}
                    </p>
                  </div>
                )}
                <div className="col-span-2">
                  <p className="text-sm text-slate-500 mb-1">Bio</p>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    {selectedLawyer.bio || "No bio provided"}
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                {!selectedLawyer.verified && (
                  <Button
                    onClick={() => {
                      setIsDetailOpen(false);
                      handleVerifyLawyer(selectedLawyer);
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Review Verification
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => setIsDetailOpen(false)}
                  className="border-slate-600 text-slate-300"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Verification Dialog */}
      <Dialog open={isVerifyDialogOpen} onOpenChange={setIsVerifyDialogOpen}>
        <DialogContent className="bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">Verify Lawyer</DialogTitle>
            <DialogDescription className="text-slate-400">
              Review and verify {selectedLawyer?.full_name}&apos;s credentials
            </DialogDescription>
          </DialogHeader>

          {selectedLawyer && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-slate-900/50 border border-slate-700 space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-400 text-sm">Bar Number</span>
                  <code className="text-sm bg-slate-700/50 text-slate-200 px-2 py-0.5 rounded font-mono">
                    {selectedLawyer.bar_number}
                  </code>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 text-sm">Bar State</span>
                  <span className="text-white text-sm font-medium">
                    {selectedLawyer.bar_state}
                  </span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-slate-400 text-sm">Practice Areas</span>
                  <div className="flex flex-wrap gap-1 justify-end">
                    {selectedLawyer.practice_areas.map((a) => (
                      <Badge
                        key={a}
                        variant="outline"
                        className="text-xs border-slate-600 text-slate-300"
                      >
                        {practiceAreaLabels[a] || a}
                      </Badge>
                    ))}
                  </div>
                </div>
                {selectedLawyer.years_experience && (
                  <div className="flex justify-between">
                    <span className="text-slate-400 text-sm">Experience</span>
                    <span className="text-white text-sm">
                      {selectedLawyer.years_experience} years
                    </span>
                  </div>
                )}
              </div>

              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <p className="text-sm text-amber-400">
                  Please verify the bar number and credentials before approving
                  this lawyer.
                </p>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setIsVerifyDialogOpen(false)}
              disabled={isActionLoading}
              className="border-slate-600 text-slate-300"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => confirmVerification(false)}
              disabled={isActionLoading}
            >
              {isActionLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <UserX className="h-4 w-4 mr-2" />
              )}
              Reject
            </Button>
            <Button
              onClick={() => confirmVerification(true)}
              disabled={isActionLoading}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {isActionLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <UserCheck className="h-4 w-4 mr-2" />
              )}
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
