"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  FileText, Download, Loader2, CheckCircle, AlertCircle,
  Eye, Edit, RefreshCw
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { PRACTICE_AREAS, getDocumentTypeName } from "@/config/practice-areas";
import { Case, Document } from "@/types/database";

interface DocumentGeneratorProps {
  caseId: string;
  caseData: Case;
  existingDocuments: Document[];
  autoGenerate?: boolean;
}

export function DocumentGenerator({
  caseId,
  caseData,
  existingDocuments,
  autoGenerate = false,
}: DocumentGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState<string>("");
  const [generatedContent, setGeneratedContent] = useState<string>("");
  const [documents, setDocuments] = useState<Document[]>(existingDocuments);

  const practiceArea = PRACTICE_AREAS[caseData.case_type as keyof typeof PRACTICE_AREAS];
  const availableDocTypes = practiceArea?.commonDocuments || [];

  useEffect(() => {
    if (autoGenerate && availableDocTypes.length > 0 && !selectedDocType) {
      setSelectedDocType(availableDocTypes[0]);
    }
  }, [autoGenerate, availableDocTypes, selectedDocType]);

  const generateDocument = async () => {
    if (!selectedDocType) {
      toast.error("Please select a document type");
      return;
    }

    setIsGenerating(true);
    setGeneratedContent("");

    try {
      const response = await fetch("/api/documents/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caseId,
          documentType: selectedDocType,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate document");
      }

      const data = await response.json();
      setGeneratedContent(data.content);

      // Add the new document to the list
      if (data.document) {
        setDocuments((prev) => [data.document, ...prev]);
      }

      toast.success("Document generated successfully!");
    } catch (error) {
      console.error("Error generating document:", error);
      toast.error("Failed to generate document");
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadDocument = async (documentId: string, title: string) => {
    // For now, just download the content as a text file
    // In production, this would generate a PDF
    const doc = documents.find((d) => d.id === documentId);
    if (!doc?.content) {
      toast.error("Document content not available");
      return;
    }

    const blob = new Blob([doc.content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.replace(/\s+/g, "_")}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Document Generator */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Generate New Document</CardTitle>
          <CardDescription>
            Select a document type to generate based on your case information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Document Type</label>
            <Select value={selectedDocType} onValueChange={setSelectedDocType}>
              <SelectTrigger>
                <SelectValue placeholder="Select document type" />
              </SelectTrigger>
              <SelectContent>
                {availableDocTypes.map((docType) => (
                  <SelectItem key={docType} value={docType}>
                    {getDocumentTypeName(docType)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Case Data Summary */}
          <div className="p-3 bg-slate-50 rounded-lg text-sm space-y-1">
            <p><strong>Case:</strong> {caseData.case_number}</p>
            <p><strong>Type:</strong> {practiceArea?.name}</p>
            <p><strong>State:</strong> {caseData.state}</p>
            {caseData.plaintiff_name && (
              <p><strong>Plaintiff:</strong> {caseData.plaintiff_name}</p>
            )}
            {caseData.defendant_name && (
              <p><strong>Defendant:</strong> {caseData.defendant_name}</p>
            )}
          </div>

          <Button
            onClick={generateDocument}
            disabled={!selectedDocType || isGenerating}
            className="w-full gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4" />
                Generate Document
              </>
            )}
          </Button>

          {!caseData.plaintiff_name || !caseData.defendant_name ? (
            <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg text-amber-800 text-sm">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <p>
                Some case information is missing. Continue the chat to provide more details
                for a more complete document.
              </p>
            </div>
          ) : (
            <div className="flex items-start gap-2 p-3 bg-green-50 rounded-lg text-green-800 text-sm">
              <CheckCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <p>
                All required information collected. Your document will include all case details.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Generated Documents List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Your Documents</CardTitle>
          <CardDescription>
            {documents.length} document{documents.length !== 1 ? "s" : ""} generated
          </CardDescription>
        </CardHeader>
        <CardContent>
          {documents.length > 0 ? (
            <div className="space-y-3">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-emerald-500" />
                    <div>
                      <p className="font-medium">{doc.title}</p>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span>v{doc.version}</span>
                        <span>•</span>
                        <span>{format(new Date(doc.created_at), "MMM d, yyyy")}</span>
                        <Badge
                          variant="secondary"
                          className={
                            doc.status === "final"
                              ? "bg-green-100 text-green-800"
                              : doc.status === "filed"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-yellow-100 text-yellow-800"
                          }
                        >
                          {doc.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setGeneratedContent(doc.content || "")}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => downloadDocument(doc.id, doc.title)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-600">No documents generated yet</p>
              <p className="text-sm text-slate-500">
                Select a document type and click generate
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Document Preview */}
      {generatedContent && (
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Document Preview</CardTitle>
              <CardDescription>
                Review your generated document
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <Edit className="h-4 w-4" />
                Edit
              </Button>
              <Button variant="outline" size="sm" className="gap-2" onClick={generateDocument}>
                <RefreshCw className="h-4 w-4" />
                Regenerate
              </Button>
              <Button size="sm" className="gap-2">
                <Download className="h-4 w-4" />
                Download PDF
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px] border rounded-lg p-6 bg-white">
              <div className="prose prose-sm max-w-none whitespace-pre-wrap font-mono text-sm">
                {generatedContent}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
