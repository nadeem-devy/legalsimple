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
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  FileText,
  Search,
  Download,
  Eye,
  RefreshCw,
  Loader2,
  CheckCircle,
  Clock,
  FileCheck,
  MoreHorizontal,
  User,
  MapPin,
  AlertTriangle,
  Sparkles,
  Scale,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

interface Document {
  id: string;
  case_id: string;
  document_type: string;
  title: string;
  has_content: boolean;
  file_url?: string | null;
  status: "draft" | "final" | "filed";
  version: number;
  generated_by: string;
  created_at: string;
  updated_at: string;
  case_number: string;
  case_type: string;
  sub_type?: string | null;
  state: string;
  county?: string;
  client_name: string;
  client_email: string;
}

const statusConfig: Record<
  string,
  { label: string; color: string; icon: React.ReactNode }
> = {
  draft: {
    label: "Draft",
    color: "bg-amber-500/15 text-amber-400 border border-amber-500/30",
    icon: <Clock className="h-3 w-3" />,
  },
  final: {
    label: "Final",
    color: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
    icon: <CheckCircle className="h-3 w-3" />,
  },
  filed: {
    label: "Filed",
    color: "bg-blue-500/15 text-blue-400 border border-blue-500/30",
    icon: <FileCheck className="h-3 w-3" />,
  },
};

const docTypeLabels: Record<string, string> = {
  petition_for_divorce: "Petition for Divorce",
  summons: "Summons",
  sensitive_data_coversheet: "Sensitive Data Coversheet",
  preliminary_injunction: "Preliminary Injunction",
  notice_regarding_creditors: "Notice Regarding Creditors",
  health_insurance_notice: "Health Insurance Notice",
  parent_info_program: "Parent Info Program",
  demand_letter: "Demand Letter",
  last_will_testament: "Last Will & Testament",
  property_settlement: "Property Settlement",
  custody_petition: "Custody Petition",
  parenting_plan: "Parenting Plan",
};

// Map document_type to the PDF format parameter for regeneration
const docTypeToFormat: Record<string, string> = {
  petition_for_divorce: "petition",
  summons: "summons",
  sensitive_data_coversheet: "sensitive_data",
  preliminary_injunction: "preliminary_injunction",
  notice_regarding_creditors: "notice_creditors",
  health_insurance_notice: "health_insurance",
  parent_info_program: "parent_info_program",
  demand_letter: "summary",
  last_will_testament: "summary",
  property_settlement: "summary",
};

const caseTypeLabels: Record<string, string> = {
  family_law: "Family Law",
  personal_injury: "Personal Injury",
  estate_planning: "Estate Planning",
  business_formation: "Business Formation",
};

export default function AdminDocumentsPage() {
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [previewDocument, setPreviewDocument] = useState<Document | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState<string | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const loadDocuments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/documents");
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to fetch documents");
      }
      const data = await res.json();
      setDocuments(data.documents);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load documents";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    loadDocuments();
  }, [loadDocuments]);

  // Derive unique document types from real data
  const uniqueTypes = useMemo(() => {
    const types = new Set<string>();
    documents.forEach((d) => types.add(d.document_type));
    return Array.from(types).sort();
  }, [documents]);

  const handleViewDocument = (doc: Document) => {
    setPreviewDocument(doc);
    setIsPreviewOpen(true);
  };

  const handleDownloadDocument = async (doc: Document) => {
    // If there's a direct file_url, use it
    if (doc.file_url) {
      window.open(doc.file_url, "_blank");
      toast.success(`Opening ${doc.title}`);
      return;
    }

    // Otherwise, generate PDF on-the-fly via admin endpoint
    setIsDownloading(doc.id);
    try {
      const pdfFormat = docTypeToFormat[doc.document_type] || "summary";

      const res = await fetch("/api/admin/documents/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caseId: doc.case_id,
          format: pdfFormat,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(
          errorData.error || `Failed to generate PDF (${res.status})`
        );
      }

      // Download the PDF blob
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${doc.document_type}-${doc.case_number}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success(`Downloaded ${doc.title}`);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to download document"
      );
    } finally {
      setIsDownloading(null);
    }
  };

  const handleStatusChange = async (docId: string, newStatus: string) => {
    setIsActionLoading(true);
    try {
      const res = await fetch("/api/admin/documents", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId: docId,
          action: "change_status",
          value: newStatus,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update status");
      }

      setDocuments((prev) =>
        prev.map((d) =>
          d.id === docId
            ? {
                ...d,
                status: newStatus as Document["status"],
                updated_at: new Date().toISOString(),
              }
            : d
        )
      );
      toast.success(
        `Document status updated to ${statusConfig[newStatus]?.label || newStatus}`
      );
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update status"
      );
    } finally {
      setIsActionLoading(false);
    }
  };

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.case_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.client_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || doc.status === statusFilter;
    const matchesType =
      typeFilter === "all" || doc.document_type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const stats = {
    total: documents.length,
    draft: documents.filter((d) => d.status === "draft").length,
    final: documents.filter((d) => d.status === "final").length,
    filed: documents.filter((d) => d.status === "filed").length,
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
          <h1 className="text-2xl font-bold text-white">Documents</h1>
          <p className="text-slate-400">
            Manage generated legal documents
          </p>
        </div>
        <Button variant="outline" onClick={loadDocuments} disabled={isLoading}>
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
                  Total Documents
                </p>
                <p className="text-3xl font-bold text-white mt-1">
                  {stats.total}
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-slate-700/50 flex items-center justify-center">
                <FileText className="h-6 w-6 text-slate-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/80 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-400">Drafts</p>
                <p className="text-3xl font-bold text-amber-400 mt-1">
                  {stats.draft}
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
                <p className="text-sm font-medium text-slate-400">Finalized</p>
                <p className="text-3xl font-bold text-emerald-400 mt-1">
                  {stats.final}
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
                <p className="text-sm font-medium text-slate-400">Filed</p>
                <p className="text-3xl font-bold text-blue-400 mt-1">
                  {stats.filed}
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <FileCheck className="h-6 w-6 text-blue-500" />
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
                  placeholder="Search by title, case number, or client..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px] bg-slate-900/50 border-slate-600 text-white">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="final">Final</SelectItem>
                <SelectItem value="filed">Filed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[220px] bg-slate-900/50 border-slate-600 text-white">
                <SelectValue placeholder="Document Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {uniqueTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {docTypeLabels[type] ||
                      type
                        .replace(/_/g, " ")
                        .replace(/\b\w/g, (l) => l.toUpperCase())}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Documents Table */}
      <Card className="bg-slate-800/80 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-lg">All Documents</CardTitle>
          <CardDescription className="text-slate-400">
            {filteredDocuments.length} document
            {filteredDocuments.length !== 1 ? "s" : ""} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-500 mx-auto mb-3" />
                <p className="text-sm text-slate-400">Loading documents...</p>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">
                Failed to Load Documents
              </h3>
              <p className="text-slate-400 mb-4">{error}</p>
              <Button variant="outline" onClick={loadDocuments}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          ) : filteredDocuments.length === 0 ? (
            <div className="text-center py-16">
              <FileText className="h-12 w-12 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">
                No Documents Found
              </h3>
              <p className="text-slate-400">
                {searchQuery || statusFilter !== "all" || typeFilter !== "all"
                  ? "Try adjusting your filters"
                  : "Documents will appear here when generated"}
              </p>
            </div>
          ) : (
            <div className="rounded-lg border border-slate-700 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-700 bg-slate-900/50 hover:bg-slate-900/50">
                    <TableHead className="text-slate-300 font-semibold py-3">
                      Document
                    </TableHead>
                    <TableHead className="text-slate-300 font-semibold py-3">
                      Case / Client
                    </TableHead>
                    <TableHead className="text-slate-300 font-semibold py-3">
                      Status
                    </TableHead>
                    <TableHead className="text-slate-300 font-semibold py-3 text-center">
                      Ver.
                    </TableHead>
                    <TableHead className="text-slate-300 font-semibold py-3">
                      Generated
                    </TableHead>
                    <TableHead className="text-slate-300 font-semibold py-3 text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDocuments.map((doc) => (
                    <TableRow
                      key={doc.id}
                      className="border-slate-700/50 hover:bg-slate-700/30 transition-colors"
                    >
                      {/* Document */}
                      <TableCell className="py-4">
                        <div className="flex items-start gap-3">
                          <div className="h-10 w-10 rounded-lg bg-slate-700/50 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <FileText className="h-5 w-5 text-slate-400" />
                          </div>
                          <div className="min-w-0">
                            <p
                              className="font-medium text-white truncate max-w-[300px]"
                              title={doc.title}
                            >
                              {doc.title}
                            </p>
                            <p className="text-sm text-slate-400">
                              {docTypeLabels[doc.document_type] ||
                                doc.document_type
                                  .replace(/_/g, " ")
                                  .replace(/\b\w/g, (l) => l.toUpperCase())}
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      {/* Case / Client */}
                      <TableCell>
                        <div className="min-w-0">
                          <code className="text-sm bg-slate-700/50 text-slate-200 px-2 py-0.5 rounded font-mono">
                            {doc.case_number}
                          </code>
                          <div className="flex items-center gap-1.5 mt-1.5">
                            <User className="h-3 w-3 text-slate-500" />
                            <span className="text-sm text-slate-400 truncate">
                              {doc.client_name}
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        <Badge
                          className={
                            statusConfig[doc.status]?.color ||
                            "bg-slate-500/15 text-slate-400"
                          }
                        >
                          {statusConfig[doc.status]?.icon}
                          <span className="ml-1">
                            {statusConfig[doc.status]?.label || doc.status}
                          </span>
                        </Badge>
                      </TableCell>

                      {/* Version */}
                      <TableCell className="text-center">
                        <span className="text-white font-medium">
                          v{doc.version}
                        </span>
                      </TableCell>

                      {/* Generated */}
                      <TableCell>
                        <div>
                          <p className="text-slate-300 text-sm">
                            {format(
                              new Date(doc.created_at),
                              "MMM d, yyyy"
                            )}
                          </p>
                          <div className="flex items-center gap-1 mt-0.5">
                            {doc.generated_by === "ai" ? (
                              <Sparkles className="h-3 w-3 text-purple-400" />
                            ) : (
                              <Scale className="h-3 w-3 text-blue-400" />
                            )}
                            <span className="text-xs text-slate-500 capitalize">
                              {doc.generated_by}
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-slate-400 hover:text-white hover:bg-slate-700"
                            onClick={() => handleViewDocument(doc)}
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10"
                            onClick={() => handleDownloadDocument(doc)}
                            disabled={isDownloading === doc.id}
                            title="Download PDF"
                          >
                            {isDownloading === doc.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Download className="h-4 w-4" />
                            )}
                          </Button>
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
                              {doc.status !== "draft" && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleStatusChange(doc.id, "draft")
                                  }
                                  disabled={isActionLoading}
                                  className="text-slate-300 focus:text-white focus:bg-slate-700"
                                >
                                  <Clock className="h-4 w-4 mr-2" />
                                  Mark as Draft
                                </DropdownMenuItem>
                              )}
                              {doc.status !== "final" && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleStatusChange(doc.id, "final")
                                  }
                                  disabled={isActionLoading}
                                  className="text-slate-300 focus:text-white focus:bg-slate-700"
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Mark as Final
                                </DropdownMenuItem>
                              )}
                              {doc.status !== "filed" && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleStatusChange(doc.id, "filed")
                                  }
                                  disabled={isActionLoading}
                                  className="text-slate-300 focus:text-white focus:bg-slate-700"
                                >
                                  <FileCheck className="h-4 w-4 mr-2" />
                                  Mark as Filed
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Document Detail / Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-2xl bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Document Details
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              {previewDocument?.title}
            </DialogDescription>
          </DialogHeader>

          {previewDocument && (
            <div className="space-y-6">
              {/* Status row */}
              <div className="flex items-center gap-3 flex-wrap">
                <Badge
                  className={
                    statusConfig[previewDocument.status]?.color ||
                    "bg-slate-500/15 text-slate-400"
                  }
                >
                  {statusConfig[previewDocument.status]?.icon}
                  <span className="ml-1">
                    {statusConfig[previewDocument.status]?.label}
                  </span>
                </Badge>
                <Badge
                  variant="outline"
                  className="border-slate-600 text-slate-300"
                >
                  v{previewDocument.version}
                </Badge>
                <Badge className="bg-purple-500/15 text-purple-400 border border-purple-500/30">
                  {previewDocument.generated_by === "ai" ? (
                    <Sparkles className="h-3 w-3 mr-1" />
                  ) : (
                    <Scale className="h-3 w-3 mr-1" />
                  )}
                  {previewDocument.generated_by === "ai"
                    ? "AI Generated"
                    : "Lawyer Generated"}
                </Badge>
              </div>

              {/* Document Info */}
              <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-slate-900/50 border border-slate-700">
                <div>
                  <p className="text-sm text-slate-500 mb-1">Document Type</p>
                  <p className="font-medium text-white text-sm">
                    {docTypeLabels[previewDocument.document_type] ||
                      previewDocument.document_type
                        .replace(/_/g, " ")
                        .replace(/\b\w/g, (l) => l.toUpperCase())}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">Case Number</p>
                  <code className="text-sm bg-slate-700/50 text-slate-200 px-2 py-0.5 rounded font-mono">
                    {previewDocument.case_number}
                  </code>
                </div>
                <div>
                  <p className="text-sm text-slate-500 flex items-center gap-1.5 mb-1">
                    <User className="h-3 w-3" /> Client
                  </p>
                  <p className="font-medium text-white text-sm">
                    {previewDocument.client_name}
                  </p>
                  {previewDocument.client_email && (
                    <p className="text-sm text-slate-400">
                      {previewDocument.client_email}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">Case Type</p>
                  <p className="font-medium text-white text-sm">
                    {caseTypeLabels[previewDocument.case_type] ||
                      previewDocument.case_type}
                  </p>
                </div>
                {previewDocument.state && (
                  <div>
                    <p className="text-sm text-slate-500 flex items-center gap-1.5 mb-1">
                      <MapPin className="h-3 w-3" /> Location
                    </p>
                    <p className="font-medium text-white text-sm">
                      {previewDocument.county
                        ? `${previewDocument.county}, ${previewDocument.state}`
                        : previewDocument.state}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-slate-500 mb-1">Created</p>
                  <p className="font-medium text-white text-sm">
                    {format(
                      new Date(previewDocument.created_at),
                      "MMM d, yyyy 'at' h:mm a"
                    )}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-slate-500 mb-1">Last Updated</p>
                  <p className="font-medium text-white text-sm">
                    {format(
                      new Date(previewDocument.updated_at),
                      "MMM d, yyyy 'at' h:mm a"
                    )}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setIsPreviewOpen(false)}
                  className="border-slate-600 text-slate-300"
                >
                  Close
                </Button>
                <Button
                  onClick={() => handleDownloadDocument(previewDocument)}
                  disabled={isDownloading === previewDocument.id}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  {isDownloading === previewDocument.id ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4 mr-2" />
                  )}
                  Download PDF
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
