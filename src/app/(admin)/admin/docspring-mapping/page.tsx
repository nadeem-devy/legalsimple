"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { RefreshCw, Save, CheckCircle2, AlertCircle, FileText, Copy, ExternalLink, ArrowRight, ChevronDown, ChevronUp } from "lucide-react";

// All available intake fields organized by category
const INTAKE_FIELDS_BY_CATEGORY: Record<string, Array<{ key: string; label: string; example: string }>> = {
  "Petitioner Info": [
    { key: "fullName", label: "Full Legal Name", example: "John Michael Smith" },
    { key: "email", label: "Email Address", example: "john@example.com" },
    { key: "ssn4", label: "SSN (last 4)", example: "1234" },
    { key: "gender", label: "Gender", example: "male / female" },
    { key: "mailingAddress", label: "Mailing Address", example: "123 Main St, Phoenix, AZ 85001" },
    { key: "phone", label: "Phone Number", example: "(602) 555-0123" },
    { key: "dateOfBirth", label: "Date of Birth", example: "01/15/1985" },
  ],
  "Respondent Info": [
    { key: "spouseFullName", label: "Full Legal Name", example: "Jane Marie Smith" },
    { key: "spouseDateOfBirth", label: "Date of Birth", example: "03/22/1987" },
    { key: "spouseMailingAddress", label: "Mailing Address", example: "456 Oak Ave, Phoenix, AZ 85002" },
    { key: "spouseSsn4", label: "SSN (last 4)", example: "5678" },
    { key: "spousePhone", label: "Phone Number", example: "(602) 555-0456" },
    { key: "spouseEmail", label: "Email Address", example: "jane@example.com" },
  ],
  "Marriage & Location": [
    { key: "dateOfMarriage", label: "Date of Marriage", example: "06/20/2015" },
    { key: "county", label: "County", example: "Maricopa" },
    { key: "meetsResidencyRequirement", label: "Meets Residency (90 days)", example: "true / false" },
  ],
  "Status": [
    { key: "hasChildren", label: "Has Minor Children", example: "true / false" },
    { key: "isPregnant", label: "Is Pregnant", example: "true / false" },
    { key: "wantsMaidenName", label: "Wants Name Restored", example: "true / false" },
    { key: "maidenName", label: "Name to Restore", example: "Jane Marie Johnson" },
  ],
  "Property Agreement": [
    { key: "hasPropertyAgreement", label: "Has Property Agreement", example: "true / false" },
    { key: "propertyAgreementDetails", label: "Agreement Details", example: "We agreed to split..." },
    { key: "allPropertyCovered", label: "All Property Covered", example: "true / false" },
  ],
  "Real Estate": [
    { key: "hasHome", label: "Has Home", example: "true / false" },
    { key: "home1Address", label: "Home 1 Address", example: "789 Desert Lane, Scottsdale, AZ" },
    { key: "home1HasDisclaimerDeed", label: "Home 1 Has Disclaimer Deed", example: "true / false" },
    { key: "home1UsedCommunityFunds", label: "Home 1 Used Community Funds", example: "true / false" },
    { key: "home1RequestEquitableLien", label: "Home 1 Request Equitable Lien", example: "true / false" },
    { key: "home1Division", label: "Home 1 Division", example: "i_keep / spouse_keeps / sell_split" },
    { key: "home2Address", label: "Home 2 Address", example: "..." },
    { key: "home2Division", label: "Home 2 Division", example: "..." },
  ],
  "Furniture & Appliances": [
    { key: "hasFurnitureOver200", label: "Has Furniture Over $200", example: "true / false" },
    { key: "furnitureDivision", label: "Furniture Division Details", example: "I keep living room..." },
    { key: "hasAppliancesOver200", label: "Has Appliances Over $200", example: "true / false" },
    { key: "applianceDivision", label: "Appliance Division Details", example: "I keep refrigerator..." },
  ],
  "Bank Accounts": [
    { key: "bank1Name", label: "Bank 1 Name", example: "Chase Bank" },
    { key: "bank1Last4", label: "Bank 1 Last 4 Digits", example: "1234" },
    { key: "bank1Division", label: "Bank 1 Division", example: "Split 50/50" },
    { key: "bank2Name", label: "Bank 2 Name", example: "..." },
    { key: "bank2Last4", label: "Bank 2 Last 4 Digits", example: "..." },
    { key: "bank2Division", label: "Bank 2 Division", example: "..." },
  ],
  "Retirement Accounts": [
    { key: "hasRetirement", label: "Has Retirement Accounts", example: "true / false" },
    { key: "retirement1Type", label: "Retirement 1 Type", example: "401k / ira / pension" },
    { key: "retirement1Owner", label: "Retirement 1 Owner", example: "me / spouse" },
    { key: "retirement1Admin", label: "Retirement 1 Administrator", example: "Fidelity" },
    { key: "retirement1Division", label: "Retirement 1 Division", example: "Split community portion 50/50" },
  ],
  "Vehicles": [
    { key: "hasVehicles", label: "Has Vehicles", example: "true / false" },
    { key: "vehicle1Year", label: "Vehicle 1 Year", example: "2020" },
    { key: "vehicle1Make", label: "Vehicle 1 Make", example: "Toyota" },
    { key: "vehicle1Model", label: "Vehicle 1 Model", example: "Camry" },
    { key: "vehicle1Description", label: "Vehicle 1 Full Description", example: "2020 Toyota Camry" },
    { key: "vehicle1TitledTo", label: "Vehicle 1 Titled To", example: "me / spouse / both" },
    { key: "vehicle1HasLoan", label: "Vehicle 1 Has Loan", example: "true / false" },
    { key: "vehicle1LoanBalance", label: "Vehicle 1 Loan Balance", example: "15000" },
    { key: "vehicle1Division", label: "Vehicle 1 Division", example: "i_keep / spouse_keeps / sell_split" },
  ],
  "Separate Property": [
    { key: "hasSeparateProperty", label: "Has Separate Property", example: "true / false" },
    { key: "sepProp1Desc", label: "Sep Property 1 Description", example: "Antique jewelry" },
    { key: "sepProp1Value", label: "Sep Property 1 Value", example: "5000" },
    { key: "sepProp1AwardedTo", label: "Sep Property 1 Awarded To", example: "me / spouse" },
  ],
  "Community Debts": [
    { key: "hasCommunityDebt", label: "Has Community Debt", example: "true / false" },
    { key: "commDebt1Desc", label: "Debt 1 Description", example: "Chase credit card" },
    { key: "commDebt1Amount", label: "Debt 1 Amount", example: "5000" },
    { key: "commDebt1Responsible", label: "Debt 1 Responsible Party", example: "me / spouse" },
  ],
  "Separate Debts": [
    { key: "hasSeparateDebt", label: "Has Separate Debt", example: "true / false" },
    { key: "sepDebt1Desc", label: "Sep Debt 1 Description", example: "Student loan" },
    { key: "sepDebt1Amount", label: "Sep Debt 1 Amount", example: "15000" },
    { key: "sepDebt1Responsible", label: "Sep Debt 1 Responsible Party", example: "me / spouse" },
  ],
  "Tax Filing": [
    { key: "currentYearTaxFiling", label: "This Year Tax Filing", example: "jointly / separately" },
    { key: "hasPreviousUnfiledTaxes", label: "Has Previous Unfiled Taxes", example: "true / false" },
    { key: "previousTaxOption", label: "Previous Tax Filing Option", example: "file_separately / file_jointly" },
  ],
  "Spousal Maintenance": [
    { key: "maintenanceEntitlement", label: "Who Is Entitled", example: "neither / me / spouse" },
    { key: "maintenanceReasons", label: "Reasons (comma-separated)", example: "lack_property, lack_earning" },
  ],
  "Other": [
    { key: "otherOrders", label: "Other Orders Requested", example: "Request for restraining order..." },
  ],
  "Computed Fields (Auto)": [
    { key: "petitionerRole", label: "Petitioner Role", example: "Husband / Wife" },
    { key: "respondentRole", label: "Respondent Role", example: "Wife / Husband" },
    { key: "currentDate", label: "Today's Date", example: "01/30/2026" },
    { key: "caseNumber", label: "Case Number", example: "LS-20260130-0001" },
    { key: "isPregnantText", label: "Is Pregnant (Yes/No)", example: "Yes / No" },
    { key: "wantsMaidenNameText", label: "Wants Maiden Name (Yes/No)", example: "Yes / No" },
  ],
};

// Flatten for dropdown
const INTAKE_FIELDS = Object.entries(INTAKE_FIELDS_BY_CATEGORY).flatMap(([category, fields]) =>
  fields.map(f => ({ ...f, category }))
);

interface DocSpringTemplate {
  id: string;
  name: string;
  description?: string;
}

interface TemplateField {
  name: string;
  type: string;
  required: boolean;
  description?: string;
}

interface FieldMapping {
  docspringField: string;
  intakeField: string;
  fieldType: string;
}

export default function DocSpringMappingPage() {
  const [templates, setTemplates] = useState<DocSpringTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [selectedTemplateName, setSelectedTemplateName] = useState<string>("");
  const [templateFields, setTemplateFields] = useState<TemplateField[]>([]);
  const [fieldMappings, setFieldMappings] = useState<FieldMapping[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingFields, setIsLoadingFields] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [documentType, setDocumentType] = useState("petition_for_divorce");
  const [state, setState] = useState("AZ");
  const [practiceArea, setPracticeArea] = useState("family_law");
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(["Petitioner Info", "Respondent Info"]));

  // Test connection on mount
  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    try {
      const res = await fetch("/api/admin/docspring?action=test");
      const data = await res.json();
      setIsConnected(data.success);
      if (data.success) {
        loadTemplates();
      }
    } catch {
      setIsConnected(false);
    }
  };

  const loadTemplates = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/docspring?action=templates");
      const data = await res.json();
      if (data.templates) {
        setTemplates(data.templates);
        toast.success(`Loaded ${data.templates.length} templates from DocSpring`);
      }
    } catch (err) {
      toast.error("Failed to load templates");
    } finally {
      setIsLoading(false);
    }
  };

  const loadTemplateFields = async (templateId: string) => {
    if (!templateId) return;
    setIsLoadingFields(true);
    setTemplateFields([]);
    setFieldMappings([]);

    try {
      const res = await fetch(`/api/admin/docspring?action=template-fields&templateId=${templateId}`);
      const data = await res.json();

      if (data.template) {
        // DocSpring returns fields in different formats depending on template type
        let fields: TemplateField[] = [];

        // Check for editable_fields (common format)
        if (data.template.editable_fields) {
          fields = Object.entries(data.template.editable_fields).map(([name, config]: [string, any]) => ({
            name,
            type: config?.type || "string",
            required: config?.required || false,
            description: config?.description || "",
          }));
        }
        // Check for fields array
        else if (data.template.fields) {
          fields = data.template.fields.map((f: any) => ({
            name: f.name || f.id,
            type: f.type || "string",
            required: f.required || false,
            description: f.description || "",
          }));
        }
        // Check for field_order (list of field names)
        else if (data.template.field_order) {
          fields = data.template.field_order.map((name: string) => ({
            name,
            type: "string",
            required: false,
            description: "",
          }));
        }

        if (fields.length > 0) {
          setTemplateFields(fields);
          // Initialize mappings with empty values
          setFieldMappings(fields.map(f => ({
            docspringField: f.name,
            intakeField: "",
            fieldType: f.type,
          })));
          toast.success(`Found ${fields.length} fields in template`);
        } else {
          toast.error("No fields found in template. Make sure you've added fields in DocSpring.");
        }
      } else {
        toast.error("Could not load template details");
      }
    } catch (err) {
      toast.error("Failed to load template fields");
    } finally {
      setIsLoadingFields(false);
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = templates.find(t => t.id === templateId);
    setSelectedTemplateName(template?.name || "");
    loadTemplateFields(templateId);
  };

  const updateMapping = (docspringField: string, intakeField: string) => {
    setFieldMappings(prev =>
      prev.map(m =>
        m.docspringField === docspringField ? { ...m, intakeField } : m
      )
    );
  };

  const getMappedCount = () => {
    return fieldMappings.filter(m => m.intakeField).length;
  };

  const saveMapping = async () => {
    if (!selectedTemplate) {
      toast.error("Please select a template first");
      return;
    }

    if (getMappedCount() === 0) {
      toast.error("Please map at least one field");
      return;
    }

    setIsSaving(true);

    const mappingData = {
      state,
      practiceArea,
      documentType,
      templateId: selectedTemplate,
      templateName: selectedTemplateName,
      fieldMappings: fieldMappings.reduce((acc, m) => {
        if (m.intakeField) {
          acc[m.docspringField] = m.intakeField;
        }
        return acc;
      }, {} as Record<string, string>),
    };

    try {
      const res = await fetch("/api/admin/docspring", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "save-mapping", mapping: mappingData }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Mapping saved successfully!");
      } else {
        toast.error(data.error || "Failed to save mapping");
      }
    } catch {
      toast.error("Failed to save mapping");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  const copyFieldName = (fieldName: string) => {
    navigator.clipboard.writeText(fieldName);
    toast.success(`Copied: ${fieldName}`);
  };

  return (
    <div className="container mx-auto py-6 px-4 max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">DocSpring Field Mapping</h1>
        <p className="text-slate-600 mt-1">
          Map your DocSpring template fields to intake questionnaire answers
        </p>
      </div>

      {/* Connection Status */}
      <Card className="mb-6">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isConnected === null ? (
                <RefreshCw className="h-5 w-5 animate-spin text-slate-400" />
              ) : isConnected ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-500" />
              )}
              <span className={isConnected ? "text-green-700" : "text-red-700"}>
                {isConnected === null ? "Connecting..." : isConnected ? "Connected to DocSpring" : "Not connected - check API credentials"}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={loadTemplates} disabled={!isConnected || isLoading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                Refresh Templates
              </Button>
              <a
                href="https://app.docspring.com/templates"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-emerald-600 hover:underline flex items-center gap-1"
              >
                Open DocSpring
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step 1: Select Template */}
      <Card className="mb-6">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-600 text-white text-sm">1</span>
            Select Your DocSpring Template
          </CardTitle>
          <CardDescription>
            Choose the PDF template you uploaded to DocSpring
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label className="text-xs text-slate-500">State</Label>
              <Select value={state} onValueChange={setState}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AZ">Arizona</SelectItem>
                  <SelectItem value="NV">Nevada</SelectItem>
                  <SelectItem value="TX">Texas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs text-slate-500">Practice Area</Label>
              <Select value={practiceArea} onValueChange={setPracticeArea}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="family_law">Family Law</SelectItem>
                  <SelectItem value="personal_injury">Personal Injury</SelectItem>
                  <SelectItem value="estate_planning">Estate Planning</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs text-slate-500">Document Type</Label>
              <Select value={documentType} onValueChange={setDocumentType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="petition_for_divorce">Petition for Divorce</SelectItem>
                  <SelectItem value="custody_motion">Custody Motion</SelectItem>
                  <SelectItem value="child_support_worksheet">Child Support Worksheet</SelectItem>
                  <SelectItem value="parenting_plan">Parenting Plan</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs text-slate-500">DocSpring Template</Label>
              <Select value={selectedTemplate} onValueChange={handleTemplateSelect} disabled={!isConnected}>
                <SelectTrigger>
                  <SelectValue placeholder="Select template..." />
                </SelectTrigger>
                <SelectContent>
                  {templates.length === 0 ? (
                    <SelectItem value="_none" disabled>No templates found</SelectItem>
                  ) : (
                    templates.map(template => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          {templates.length === 0 && isConnected && !isLoading && (
            <p className="text-sm text-amber-600 mt-4 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              No templates found. Upload a PDF template to DocSpring first.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Step 2: Map Fields */}
      {selectedTemplate && (
        <Card className="mb-6">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-600 text-white text-sm">2</span>
                  Map Template Fields
                </CardTitle>
                <CardDescription className="mt-1">
                  {isLoadingFields
                    ? "Loading fields from template..."
                    : templateFields.length > 0
                    ? `Map each of the ${templateFields.length} fields to your intake data`
                    : "No fields found in template"}
                </CardDescription>
              </div>
              {templateFields.length > 0 && (
                <Badge variant={getMappedCount() === templateFields.length ? "default" : "secondary"}>
                  {getMappedCount()} / {templateFields.length} mapped
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingFields ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="h-8 w-8 animate-spin text-slate-400" />
              </div>
            ) : templateFields.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <FileText className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                <p>No fields found in this template.</p>
                <p className="text-sm mt-1">Make sure you've added form fields in DocSpring's template editor.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {templateFields.map((field, index) => (
                  <div
                    key={field.name}
                    className={`flex items-center gap-4 p-4 rounded-lg border ${
                      fieldMappings.find(m => m.docspringField === field.name)?.intakeField
                        ? "bg-green-50 border-green-200"
                        : "bg-slate-50 border-slate-200"
                    }`}
                  >
                    {/* Field Number */}
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </span>

                    {/* DocSpring Field Name */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <code className="text-sm font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                          {field.name}
                        </code>
                        {field.required && (
                          <Badge variant="destructive" className="text-[10px]">Required</Badge>
                        )}
                        <span className="text-xs text-slate-400">({field.type})</span>
                      </div>
                    </div>

                    {/* Arrow */}
                    <ArrowRight className="h-4 w-4 text-slate-400 flex-shrink-0" />

                    {/* Intake Field Dropdown */}
                    <div className="w-80 flex-shrink-0">
                      <Select
                        value={fieldMappings.find(m => m.docspringField === field.name)?.intakeField || ""}
                        onValueChange={(value) => updateMapping(field.name, value)}
                      >
                        <SelectTrigger className={
                          fieldMappings.find(m => m.docspringField === field.name)?.intakeField
                            ? "border-green-300 bg-white"
                            : ""
                        }>
                          <SelectValue placeholder="Select intake field..." />
                        </SelectTrigger>
                        <SelectContent className="max-h-80">
                          <SelectItem value="">-- Not mapped --</SelectItem>
                          {Object.entries(INTAKE_FIELDS_BY_CATEGORY).map(([category, fields]) => (
                            <div key={category}>
                              <div className="px-2 py-1.5 text-xs font-semibold text-slate-500 bg-slate-100">
                                {category}
                              </div>
                              {fields.map(f => (
                                <SelectItem key={f.key} value={f.key}>
                                  <div className="flex items-center gap-2">
                                    <span>{f.label}</span>
                                    <span className="text-xs text-slate-400">({f.key})</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </div>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Status Icon */}
                    {fieldMappings.find(m => m.docspringField === field.name)?.intakeField && (
                      <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Save Button */}
            {templateFields.length > 0 && (
              <div className="mt-6 flex items-center justify-between pt-4 border-t">
                <p className="text-sm text-slate-500">
                  {getMappedCount() === 0
                    ? "Map at least one field to save"
                    : `${getMappedCount()} of ${templateFields.length} fields mapped`}
                </p>
                <Button onClick={saveMapping} disabled={isSaving || getMappedCount() === 0} size="lg">
                  {isSaving ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save Mapping
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Field Reference */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Available Intake Fields Reference</CardTitle>
          <CardDescription>
            Click any field name to copy it. These are the data fields collected from the questionnaire.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(INTAKE_FIELDS_BY_CATEGORY).map(([category, fields]) => (
              <div key={category} className="border rounded-lg overflow-hidden">
                <button
                  className="w-full flex items-center justify-between px-3 py-2 bg-slate-100 hover:bg-slate-200 transition-colors"
                  onClick={() => toggleCategory(category)}
                >
                  <span className="text-sm font-semibold text-slate-700">{category}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">{fields.length}</Badge>
                    {expandedCategories.has(category) ? (
                      <ChevronUp className="h-4 w-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-slate-400" />
                    )}
                  </div>
                </button>
                {expandedCategories.has(category) && (
                  <div className="p-2 space-y-1 max-h-60 overflow-y-auto">
                    {fields.map(field => (
                      <div
                        key={field.key}
                        className="flex items-center justify-between py-1 px-2 hover:bg-emerald-50 rounded cursor-pointer group"
                        onClick={() => copyFieldName(field.key)}
                      >
                        <div className="min-w-0">
                          <code className="text-xs font-mono text-emerald-600">{field.key}</code>
                          <p className="text-[10px] text-slate-400 truncate">{field.example}</p>
                        </div>
                        <Copy className="h-3 w-3 text-slate-300 opacity-0 group-hover:opacity-100" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
