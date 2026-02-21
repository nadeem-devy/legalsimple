"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  Settings,
  FileText,
  Link2,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  Eye,
  Download,
  ArrowRight,
  Loader2,
  AlertCircle,
  Zap,
  Database,
  Map,
  Play,
  FlaskConical,
  Maximize2,
  Minimize2,
} from "lucide-react";

interface Template {
  id: string;
  name: string;
  description?: string;
  document_state?: string;
  editable_fields?: Array<{
    name: string;
    type: string;
    required: boolean;
    default?: string;
    title?: string;
    description?: string;
  }>;
}

interface FieldMapping {
  id?: string;
  state: string;
  practiceArea: string;
  documentType: string;
  templateId: string;
  templateName: string;
  fieldMappings: Record<string, string>;
}

// Form types for filtering fields
type FormType = "common" | "noChildren" | "withChildren";

// Available data fields from divorce questionnaires
// formType: "common" = both forms, "noChildren" = no-children only, "withChildren" = with-children only
const QUESTIONNAIRE_FIELDS: Array<{ key: string; label: string; category: string; formType: FormType }> = [
  // ============================================
  // PETITIONER PERSONAL INFO (9 fields) - COMMON
  // ============================================
  { key: "fullName", label: "Petitioner Full Legal Name", category: "Petitioner", formType: "common" },
  { key: "gender", label: "Petitioner Gender", category: "Petitioner", formType: "common" },
  { key: "dateOfBirth", label: "Petitioner Date of Birth", category: "Petitioner", formType: "common" },
  { key: "mailingAddress", label: "Petitioner Mailing Address", category: "Petitioner", formType: "common" },
  { key: "county", label: "Petitioner County", category: "Petitioner", formType: "common" },
  { key: "ssn4", label: "Petitioner SSN (Last 4)", category: "Petitioner", formType: "common" },
  { key: "phone", label: "Petitioner Phone", category: "Petitioner", formType: "common" },
  { key: "email", label: "Petitioner Email", category: "Petitioner", formType: "common" },
  { key: "dateOfMarriage", label: "Date of Marriage", category: "Petitioner", formType: "common" },

  // ============================================
  // SPOUSE/RESPONDENT INFO (6 fields) - COMMON
  // ============================================
  { key: "spouseFullName", label: "Respondent Full Legal Name", category: "Respondent", formType: "common" },
  { key: "spouseDateOfBirth", label: "Respondent Date of Birth", category: "Respondent", formType: "common" },
  { key: "spouseMailingAddress", label: "Respondent Mailing Address", category: "Respondent", formType: "common" },
  { key: "spouseSsn4", label: "Respondent SSN (Last 4)", category: "Respondent", formType: "common" },
  { key: "spousePhone", label: "Respondent Phone", category: "Respondent", formType: "common" },
  { key: "spouseEmail", label: "Respondent Email", category: "Respondent", formType: "common" },

  // ============================================
  // RESIDENCY & STATUS - COMMON
  // ============================================
  { key: "meetsResidencyRequirement", label: "Meets Residency Requirement?", category: "Status", formType: "common" },
  { key: "isPregnant", label: "Is Pregnant?", category: "Status", formType: "common" },

  // ============================================
  // RESIDENCY & STATUS - NO CHILDREN ONLY
  // ============================================
  { key: "hasChildren", label: "Has Children?", category: "Status", formType: "noChildren" },

  // ============================================
  // RESIDENCY & STATUS - WITH CHILDREN ONLY
  // ============================================
  { key: "hasMinorChildren", label: "Has Minor Children?", category: "Status", formType: "withChildren" },
  { key: "hasCovenantMarriage", label: "Has Covenant Marriage?", category: "Status", formType: "withChildren" },
  { key: "marriageBrokenBeyondRepair", label: "Marriage Broken Beyond Repair?", category: "Status", formType: "withChildren" },
  { key: "wantsConciliation", label: "Wants Conciliation?", category: "Status", formType: "withChildren" },

  // ============================================
  // CHILDREN INFO - WITH CHILDREN ONLY
  // ============================================
  { key: "childrenMeetResidency", label: "Children Meet Residency (6mo AZ)?", category: "Children", formType: "withChildren" },
  { key: "childrenResideWith", label: "Children Reside With", category: "Children", formType: "withChildren" },
  { key: "hasChildrenBornBeforeMarriage", label: "Has Children Born Before Marriage?", category: "Children", formType: "withChildren" },
  { key: "childrenBornBeforeMarriageNames", label: "Children Born Before Marriage Names", category: "Children", formType: "withChildren" },

  // Children Array - Child 1
  { key: "children[0].name", label: "Child 1 Name", category: "Children", formType: "withChildren" },
  { key: "children[0].gender", label: "Child 1 Gender", category: "Children", formType: "withChildren" },
  { key: "children[0].dateOfBirth", label: "Child 1 Date of Birth", category: "Children", formType: "withChildren" },
  { key: "children[0].bornBeforeMarriage", label: "Child 1 Born Before Marriage?", category: "Children", formType: "withChildren" },

  // Children Array - Child 2
  { key: "children[1].name", label: "Child 2 Name", category: "Children", formType: "withChildren" },
  { key: "children[1].gender", label: "Child 2 Gender", category: "Children", formType: "withChildren" },
  { key: "children[1].dateOfBirth", label: "Child 2 Date of Birth", category: "Children", formType: "withChildren" },
  { key: "children[1].bornBeforeMarriage", label: "Child 2 Born Before Marriage?", category: "Children", formType: "withChildren" },

  // Children Array - Child 3
  { key: "children[2].name", label: "Child 3 Name", category: "Children", formType: "withChildren" },
  { key: "children[2].gender", label: "Child 3 Gender", category: "Children", formType: "withChildren" },
  { key: "children[2].dateOfBirth", label: "Child 3 Date of Birth", category: "Children", formType: "withChildren" },
  { key: "children[2].bornBeforeMarriage", label: "Child 3 Born Before Marriage?", category: "Children", formType: "withChildren" },

  // Children Array - Child 4
  { key: "children[3].name", label: "Child 4 Name", category: "Children", formType: "withChildren" },
  { key: "children[3].gender", label: "Child 4 Gender", category: "Children", formType: "withChildren" },
  { key: "children[3].dateOfBirth", label: "Child 4 Date of Birth", category: "Children", formType: "withChildren" },
  { key: "children[3].bornBeforeMarriage", label: "Child 4 Born Before Marriage?", category: "Children", formType: "withChildren" },

  // Children Array - Child 5
  { key: "children[4].name", label: "Child 5 Name", category: "Children", formType: "withChildren" },
  { key: "children[4].gender", label: "Child 5 Gender", category: "Children", formType: "withChildren" },
  { key: "children[4].dateOfBirth", label: "Child 5 Date of Birth", category: "Children", formType: "withChildren" },
  { key: "children[4].bornBeforeMarriage", label: "Child 5 Born Before Marriage?", category: "Children", formType: "withChildren" },

  // ============================================
  // DOMESTIC VIOLENCE - WITH CHILDREN ONLY
  // ============================================
  { key: "hasDomesticViolence", label: "Has Domestic Violence?", category: "Domestic Violence", formType: "withChildren" },
  { key: "domesticViolenceOption", label: "Domestic Violence Option", category: "Domestic Violence", formType: "withChildren" },
  { key: "domesticViolenceExplanation", label: "Domestic Violence Explanation", category: "Domestic Violence", formType: "withChildren" },

  // ============================================
  // DRUG/DUI CONVICTION - WITH CHILDREN ONLY
  // ============================================
  { key: "hasDrugConviction", label: "Has Drug/DUI Conviction?", category: "Drug Conviction", formType: "withChildren" },
  { key: "drugConvictionParty", label: "Drug Conviction Party", category: "Drug Conviction", formType: "withChildren" },

  // ============================================
  // CHILD SUPPORT - WITH CHILDREN ONLY
  // ============================================
  { key: "seekingChildSupport", label: "Seeking Child Support?", category: "Child Support", formType: "withChildren" },
  { key: "hasVoluntaryChildSupport", label: "Has Voluntary Child Support?", category: "Child Support", formType: "withChildren" },
  { key: "voluntaryChildSupportDetails", label: "Voluntary Child Support Details", category: "Child Support", formType: "withChildren" },
  { key: "pastSupportPeriod", label: "Past Support Period", category: "Child Support", formType: "withChildren" },

  // ============================================
  // LEGAL DECISION MAKING / CUSTODY - WITH CHILDREN ONLY
  // ============================================
  { key: "legalDecisionMaking", label: "Legal Decision Making", category: "Custody", formType: "withChildren" },
  { key: "finalSayParty", label: "Final Say Party", category: "Custody", formType: "withChildren" },

  // ============================================
  // PARENTING TIME - WITH CHILDREN ONLY
  // ============================================
  { key: "parentingTimeSchedule", label: "Parenting Time Schedule", category: "Parenting Time", formType: "withChildren" },
  { key: "customScheduleDetails", label: "Custom Schedule Details", category: "Parenting Time", formType: "withChildren" },
  { key: "isParentingTimeSupervised", label: "Is Parenting Time Supervised?", category: "Parenting Time", formType: "withChildren" },

  // ============================================
  // HOLIDAY SCHEDULE - WITH CHILDREN ONLY
  // ============================================
  { key: "holidaySchedule.newYearsEve", label: "New Year's Eve Schedule", category: "Holiday Schedule", formType: "withChildren" },
  { key: "holidaySchedule.newYearsDay", label: "New Year's Day Schedule", category: "Holiday Schedule", formType: "withChildren" },
  { key: "holidaySchedule.easter", label: "Easter Schedule", category: "Holiday Schedule", formType: "withChildren" },
  { key: "holidaySchedule.fourthOfJuly", label: "4th of July Schedule", category: "Holiday Schedule", formType: "withChildren" },
  { key: "holidaySchedule.halloween", label: "Halloween Schedule", category: "Holiday Schedule", formType: "withChildren" },
  { key: "holidaySchedule.thanksgiving", label: "Thanksgiving Schedule", category: "Holiday Schedule", formType: "withChildren" },
  { key: "holidaySchedule.hanukkah", label: "Hanukkah Schedule", category: "Holiday Schedule", formType: "withChildren" },
  { key: "holidaySchedule.christmasEve", label: "Christmas Eve Schedule", category: "Holiday Schedule", formType: "withChildren" },
  { key: "holidaySchedule.christmasDay", label: "Christmas Day Schedule", category: "Holiday Schedule", formType: "withChildren" },
  { key: "holidaySchedule.childBirthday", label: "Child Birthday Schedule", category: "Holiday Schedule", formType: "withChildren" },
  { key: "holidaySchedule.fatherBirthday", label: "Father's Birthday Schedule", category: "Holiday Schedule", formType: "withChildren" },
  { key: "holidaySchedule.motherBirthday", label: "Mother's Birthday Schedule", category: "Holiday Schedule", formType: "withChildren" },
  { key: "holidaySchedule.mothersDay", label: "Mother's Day Schedule", category: "Holiday Schedule", formType: "withChildren" },
  { key: "holidaySchedule.fathersDay", label: "Father's Day Schedule", category: "Holiday Schedule", formType: "withChildren" },
  { key: "holidaySchedule.otherHolidays", label: "Other Holidays", category: "Holiday Schedule", formType: "withChildren" },

  // ============================================
  // BREAK SCHEDULE - WITH CHILDREN ONLY
  // ============================================
  { key: "breakSchedule.springBreak", label: "Spring Break Schedule", category: "Break Schedule", formType: "withChildren" },
  { key: "breakSchedule.fallBreak", label: "Fall Break Schedule", category: "Break Schedule", formType: "withChildren" },
  { key: "breakSchedule.winterBreak", label: "Winter Break Schedule", category: "Break Schedule", formType: "withChildren" },

  // ============================================
  // SUMMER BREAK - WITH CHILDREN ONLY
  // ============================================
  { key: "hasSummerDeviation", label: "Has Summer Deviation?", category: "Summer Break", formType: "withChildren" },
  { key: "summerDeviationDetails", label: "Summer Deviation Details", category: "Summer Break", formType: "withChildren" },

  // ============================================
  // EXCHANGE & CONTACT - WITH CHILDREN ONLY
  // ============================================
  { key: "exchangeMethod", label: "Exchange Method", category: "Exchange", formType: "withChildren" },
  { key: "phoneContactOption", label: "Phone Contact Option", category: "Exchange", formType: "withChildren" },
  { key: "phoneContactCustomSchedule", label: "Phone Contact Custom Schedule", category: "Exchange", formType: "withChildren" },
  { key: "hasRightOfFirstRefusal", label: "Has Right of First Refusal?", category: "Exchange", formType: "withChildren" },

  // ============================================
  // VACATION TIME - WITH CHILDREN ONLY
  // ============================================
  { key: "hasVacationTime", label: "Has Vacation Time?", category: "Vacation", formType: "withChildren" },
  { key: "vacationDuration", label: "Vacation Duration", category: "Vacation", formType: "withChildren" },
  { key: "vacationNoticeRequired", label: "Vacation Notice Required", category: "Vacation", formType: "withChildren" },
  { key: "vacationPriorityYears", label: "Vacation Priority Years", category: "Vacation", formType: "withChildren" },

  // ============================================
  // TRAVEL OUTSIDE AZ - WITH CHILDREN ONLY
  // ============================================
  { key: "bothCanTravelOutsideAZ", label: "Both Can Travel Outside AZ?", category: "Travel", formType: "withChildren" },
  { key: "restrictedTravelParty", label: "Restricted Travel Party", category: "Travel", formType: "withChildren" },
  { key: "maxTravelDays", label: "Max Travel Days", category: "Travel", formType: "withChildren" },
  { key: "itineraryNoticeDays", label: "Itinerary Notice Days", category: "Travel", formType: "withChildren" },

  // ============================================
  // EXTRACURRICULAR ACTIVITIES - WITH CHILDREN ONLY
  // ============================================
  { key: "extracurricularOption", label: "Extracurricular Option", category: "Extracurricular", formType: "withChildren" },
  { key: "extracurricularLimit", label: "Extracurricular Limit", category: "Extracurricular", formType: "withChildren" },
  { key: "extracurricularOtherDetails", label: "Extracurricular Other Details", category: "Extracurricular", formType: "withChildren" },

  // ============================================
  // NAME CHANGE - COMMON (petitioner)
  // ============================================
  { key: "wantsMaidenName", label: "Petitioner Wants Maiden Name?", category: "Name Change", formType: "common" },
  { key: "maidenName", label: "Petitioner Maiden Name", category: "Name Change", formType: "common" },

  // ============================================
  // NAME CHANGE - WITH CHILDREN ONLY (spouse)
  // ============================================
  { key: "spouseWantsMaidenName", label: "Respondent Wants Maiden Name?", category: "Name Change", formType: "withChildren" },
  { key: "spouseMaidenName", label: "Respondent Maiden Name", category: "Name Change", formType: "withChildren" },

  // ============================================
  // PROPERTY AGREEMENT - COMMON
  // ============================================
  { key: "hasPropertyAgreement", label: "Has Property Agreement?", category: "Property Agreement", formType: "common" },
  { key: "propertyAgreementDetails", label: "Property Agreement Details", category: "Property Agreement", formType: "common" },
  { key: "allPropertyCovered", label: "All Property Covered?", category: "Property Agreement", formType: "common" },
  { key: "propertyDivisionPreference", label: "Property Division Preference", category: "Property Agreement", formType: "common" },
  { key: "courtDecidesSeparateProperty", label: "Court Decides Separate Property", category: "Property Agreement", formType: "common" },

  // ============================================
  // REAL ESTATE / HOMES - COMMON
  // ============================================
  { key: "hasHome", label: "Has Home?", category: "Real Estate", formType: "common" },

  // Home 1
  { key: "homes[0].address", label: "Home 1 Address", category: "Real Estate", formType: "common" },
  { key: "homes[0].hasDisclaimerDeed", label: "Home 1 Has Disclaimer Deed?", category: "Real Estate", formType: "common" },
  { key: "homes[0].usedCommunityFunds", label: "Home 1 Used Community Funds?", category: "Real Estate", formType: "common" },
  { key: "homes[0].requestEquitableLien", label: "Home 1 Request Equitable Lien?", category: "Real Estate", formType: "common" },
  { key: "homes[0].divisionOption", label: "Home 1 Division Option", category: "Real Estate", formType: "common" },

  // Home 2
  { key: "homes[1].address", label: "Home 2 Address", category: "Real Estate", formType: "common" },
  { key: "homes[1].hasDisclaimerDeed", label: "Home 2 Has Disclaimer Deed?", category: "Real Estate", formType: "common" },
  { key: "homes[1].usedCommunityFunds", label: "Home 2 Used Community Funds?", category: "Real Estate", formType: "common" },
  { key: "homes[1].requestEquitableLien", label: "Home 2 Request Equitable Lien?", category: "Real Estate", formType: "common" },
  { key: "homes[1].divisionOption", label: "Home 2 Division Option", category: "Real Estate", formType: "common" },

  // Home 3
  { key: "homes[2].address", label: "Home 3 Address", category: "Real Estate", formType: "common" },
  { key: "homes[2].hasDisclaimerDeed", label: "Home 3 Has Disclaimer Deed?", category: "Real Estate", formType: "common" },
  { key: "homes[2].usedCommunityFunds", label: "Home 3 Used Community Funds?", category: "Real Estate", formType: "common" },
  { key: "homes[2].requestEquitableLien", label: "Home 3 Request Equitable Lien?", category: "Real Estate", formType: "common" },
  { key: "homes[2].divisionOption", label: "Home 3 Division Option", category: "Real Estate", formType: "common" },

  // ============================================
  // FURNITURE & APPLIANCES - COMMON
  // ============================================
  { key: "hasFurnitureOver200", label: "Has Furniture Over $200?", category: "Furniture", formType: "common" },
  { key: "furnitureDivision", label: "Furniture Division", category: "Furniture", formType: "common" },
  { key: "hasAppliancesOver200", label: "Has Appliances Over $200?", category: "Furniture", formType: "common" },
  { key: "applianceDivision", label: "Appliance Division", category: "Furniture", formType: "common" },

  // ============================================
  // BANK ACCOUNTS - COMMON
  // ============================================
  { key: "bankAccountsDuringMarriage", label: "Bank Accounts During Marriage", category: "Bank Accounts", formType: "common" },
  { key: "bankAccountsDivision", label: "Bank Accounts Division", category: "Bank Accounts", formType: "common" },

  // ============================================
  // BANK ACCOUNTS - NO CHILDREN ONLY (extra field)
  // ============================================
  { key: "bankAccountsBeforeMarriage", label: "Bank Accounts Before Marriage", category: "Bank Accounts", formType: "noChildren" },

  // ============================================
  // RETIREMENT ACCOUNTS - COMMON
  // ============================================
  { key: "hasRetirement", label: "Has Retirement Accounts?", category: "Retirement", formType: "common" },

  // Retirement Account 1
  { key: "retirementAccounts[0].accountType", label: "Retirement 1 Account Type", category: "Retirement", formType: "common" },
  { key: "retirementAccounts[0].accountTypeOther", label: "Retirement 1 Account Type Other", category: "Retirement", formType: "common" },
  { key: "retirementAccounts[0].ownerName", label: "Retirement 1 Owner", category: "Retirement", formType: "common" },
  { key: "retirementAccounts[0].administrator", label: "Retirement 1 Administrator", category: "Retirement", formType: "common" },
  { key: "retirementAccounts[0].proposedDivision", label: "Retirement 1 Proposed Division", category: "Retirement", formType: "common" },

  // Retirement Account 2
  { key: "retirementAccounts[1].accountType", label: "Retirement 2 Account Type", category: "Retirement", formType: "common" },
  { key: "retirementAccounts[1].accountTypeOther", label: "Retirement 2 Account Type Other", category: "Retirement", formType: "common" },
  { key: "retirementAccounts[1].ownerName", label: "Retirement 2 Owner", category: "Retirement", formType: "common" },
  { key: "retirementAccounts[1].administrator", label: "Retirement 2 Administrator", category: "Retirement", formType: "common" },
  { key: "retirementAccounts[1].proposedDivision", label: "Retirement 2 Proposed Division", category: "Retirement", formType: "common" },

  // Retirement Account 3
  { key: "retirementAccounts[2].accountType", label: "Retirement 3 Account Type", category: "Retirement", formType: "common" },
  { key: "retirementAccounts[2].accountTypeOther", label: "Retirement 3 Account Type Other", category: "Retirement", formType: "common" },
  { key: "retirementAccounts[2].ownerName", label: "Retirement 3 Owner", category: "Retirement", formType: "common" },
  { key: "retirementAccounts[2].administrator", label: "Retirement 3 Administrator", category: "Retirement", formType: "common" },
  { key: "retirementAccounts[2].proposedDivision", label: "Retirement 3 Proposed Division", category: "Retirement", formType: "common" },

  // ============================================
  // VEHICLES - COMMON
  // ============================================
  { key: "hasVehicles", label: "Has Vehicles?", category: "Vehicles", formType: "common" },

  // Vehicle 1
  { key: "vehicles[0].year", label: "Vehicle 1 Year", category: "Vehicles", formType: "common" },
  { key: "vehicles[0].make", label: "Vehicle 1 Make", category: "Vehicles", formType: "common" },
  { key: "vehicles[0].model", label: "Vehicle 1 Model", category: "Vehicles", formType: "common" },
  { key: "vehicles[0].titledTo", label: "Vehicle 1 Titled To", category: "Vehicles", formType: "common" },
  { key: "vehicles[0].hasLoan", label: "Vehicle 1 Has Loan?", category: "Vehicles", formType: "common" },
  { key: "vehicles[0].loanBalance", label: "Vehicle 1 Loan Balance", category: "Vehicles", formType: "common" },
  { key: "vehicles[0].divisionOption", label: "Vehicle 1 Division Option", category: "Vehicles", formType: "common" },

  // Vehicle 2
  { key: "vehicles[1].year", label: "Vehicle 2 Year", category: "Vehicles", formType: "common" },
  { key: "vehicles[1].make", label: "Vehicle 2 Make", category: "Vehicles", formType: "common" },
  { key: "vehicles[1].model", label: "Vehicle 2 Model", category: "Vehicles", formType: "common" },
  { key: "vehicles[1].titledTo", label: "Vehicle 2 Titled To", category: "Vehicles", formType: "common" },
  { key: "vehicles[1].hasLoan", label: "Vehicle 2 Has Loan?", category: "Vehicles", formType: "common" },
  { key: "vehicles[1].loanBalance", label: "Vehicle 2 Loan Balance", category: "Vehicles", formType: "common" },
  { key: "vehicles[1].divisionOption", label: "Vehicle 2 Division Option", category: "Vehicles", formType: "common" },

  // Vehicle 3
  { key: "vehicles[2].year", label: "Vehicle 3 Year", category: "Vehicles", formType: "common" },
  { key: "vehicles[2].make", label: "Vehicle 3 Make", category: "Vehicles", formType: "common" },
  { key: "vehicles[2].model", label: "Vehicle 3 Model", category: "Vehicles", formType: "common" },
  { key: "vehicles[2].titledTo", label: "Vehicle 3 Titled To", category: "Vehicles", formType: "common" },
  { key: "vehicles[2].hasLoan", label: "Vehicle 3 Has Loan?", category: "Vehicles", formType: "common" },
  { key: "vehicles[2].loanBalance", label: "Vehicle 3 Loan Balance", category: "Vehicles", formType: "common" },
  { key: "vehicles[2].divisionOption", label: "Vehicle 3 Division Option", category: "Vehicles", formType: "common" },

  // Vehicle 4
  { key: "vehicles[3].year", label: "Vehicle 4 Year", category: "Vehicles", formType: "common" },
  { key: "vehicles[3].make", label: "Vehicle 4 Make", category: "Vehicles", formType: "common" },
  { key: "vehicles[3].model", label: "Vehicle 4 Model", category: "Vehicles", formType: "common" },
  { key: "vehicles[3].titledTo", label: "Vehicle 4 Titled To", category: "Vehicles", formType: "common" },
  { key: "vehicles[3].hasLoan", label: "Vehicle 4 Has Loan?", category: "Vehicles", formType: "common" },
  { key: "vehicles[3].loanBalance", label: "Vehicle 4 Loan Balance", category: "Vehicles", formType: "common" },
  { key: "vehicles[3].divisionOption", label: "Vehicle 4 Division Option", category: "Vehicles", formType: "common" },

  // ============================================
  // SEPARATE PROPERTY - COMMON
  // ============================================
  { key: "hasSeparateProperty", label: "Has Separate Property?", category: "Separate Property", formType: "common" },
  { key: "mySeparatePropertyList", label: "My Separate Property List", category: "Separate Property", formType: "common" },
  { key: "spouseSeparatePropertyList", label: "Spouse Separate Property List", category: "Separate Property", formType: "common" },

  // ============================================
  // COMMUNITY DEBTS - COMMON
  // ============================================
  { key: "hasCommunityDebt", label: "Has Community Debt?", category: "Community Debts", formType: "common" },
  { key: "communityDebtList", label: "Community Debt List", category: "Community Debts", formType: "common" },
  { key: "communityDebtDivision", label: "Community Debt Division", category: "Community Debts", formType: "common" },

  // ============================================
  // SEPARATE DEBTS - COMMON
  // ============================================
  { key: "hasSeparateDebt", label: "Has Separate Debt?", category: "Separate Debts", formType: "common" },
  { key: "mySeparateDebtList", label: "My Separate Debt List", category: "Separate Debts", formType: "common" },
  { key: "spouseSeparateDebtList", label: "Spouse Separate Debt List", category: "Separate Debts", formType: "common" },

  // ============================================
  // TAX FILING - COMMON
  // ============================================
  { key: "currentYearTaxFiling", label: "Current Year Tax Filing", category: "Tax Filing", formType: "common" },
  { key: "hasPreviousUnfiledTaxes", label: "Has Previous Unfiled Taxes?", category: "Tax Filing", formType: "common" },
  { key: "previousTaxOption", label: "Previous Tax Option", category: "Tax Filing", formType: "common" },

  // ============================================
  // SPOUSAL MAINTENANCE - COMMON
  // ============================================
  { key: "maintenanceEntitlement", label: "Maintenance Entitlement", category: "Maintenance", formType: "common" },
  { key: "maintenanceReasons", label: "Maintenance Reasons", category: "Maintenance", formType: "common" },

  // ============================================
  // OTHER ORDERS - COMMON
  // ============================================
  { key: "otherOrders", label: "Other Orders", category: "Other", formType: "common" },

  // ============================================
  // SYSTEM / COMPUTED FIELDS - COMMON
  // ============================================
  { key: "currentDate", label: "Current Date", category: "System", formType: "common" },
  { key: "caseNumber", label: "Case Number", category: "System", formType: "common" },
];

// Helper function to filter fields based on document type
const getFieldsForDocumentType = (documentType: string) => {
  const isWithChildren = documentType === "petition_for_divorce"; // with children
  const isNoChildren = documentType === "petition_for_divorce_no_children";

  return QUESTIONNAIRE_FIELDS.filter(field => {
    if (field.formType === "common") return true;
    if (isWithChildren && field.formType === "withChildren") return true;
    if (isNoChildren && field.formType === "noChildren") return true;
    return false;
  });
};

const STATES = [
  { value: "AZ", label: "Arizona" },
  { value: "NV", label: "Nevada" },
  { value: "TX", label: "Texas" },
];

const PRACTICE_AREAS = [
  { value: "family_law", label: "Family Law" },
  { value: "personal_injury", label: "Personal Injury" },
  { value: "estate_planning", label: "Estate Planning" },
];

const DOCUMENT_TYPES = {
  family_law: [
    { value: "petition_for_divorce", label: "Petition for Divorce" },
    { value: "petition_for_divorce_no_children", label: "Petition for Divorce (No Children)" },
    { value: "summons", label: "Summons" },
    { value: "preliminary_injunction", label: "Preliminary Injunction" },
    { value: "property_settlement", label: "Property Settlement Agreement" },
    { value: "custody_motion", label: "Custody Motion" },
    { value: "child_support_worksheet", label: "Child Support Worksheet" },
    { value: "parenting_plan", label: "Parenting Plan" },
  ],
  personal_injury: [
    { value: "demand_letter", label: "Demand Letter" },
    { value: "complaint", label: "Complaint" },
    { value: "settlement_agreement", label: "Settlement Agreement" },
  ],
  estate_planning: [
    { value: "last_will_testament", label: "Last Will & Testament" },
    { value: "power_of_attorney", label: "Power of Attorney" },
    { value: "healthcare_directive", label: "Healthcare Directive" },
    { value: "living_trust", label: "Living Trust" },
  ],
};

export default function DocSpringAdminPage() {
  // Client-side only mounting to prevent hydration errors with Radix UI
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<"unknown" | "connected" | "error">("unknown");
  const [templates, setTemplates] = useState<Template[]>([]);
  const [mappings, setMappings] = useState<FieldMapping[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
  const [isSavingMapping, setIsSavingMapping] = useState(false);

  // Mapping form state
  const [mappingDialogOpen, setMappingDialogOpen] = useState(false);
  const [editingMapping, setEditingMapping] = useState<FieldMapping | null>(null);
  const [mappingForm, setMappingForm] = useState({
    state: "",
    practiceArea: "",
    documentType: "",
    templateId: "",
    fieldMappings: {} as Record<string, string>,
  });

  // Search and selection state for mapping
  const [docspringSearch, setDocspringSearch] = useState("");
  const [intakeSearch, setIntakeSearch] = useState("");
  const [selectedDocspringField, setSelectedDocspringField] = useState<string | null>(null);

  // Test generation state
  const [isGeneratingTest, setIsGeneratingTest] = useState<string | null>(null);
  const [selectedIntakeField, setSelectedIntakeField] = useState<string | null>(null);

  // Quick Test state (2 fields instant test)
  const [quickTestTemplateId, setQuickTestTemplateId] = useState("");
  const [quickTestField1, setQuickTestField1] = useState("");
  const [quickTestValue1, setQuickTestValue1] = useState("John Doe");
  const [quickTestField2, setQuickTestField2] = useState("");
  const [quickTestValue2, setQuickTestValue2] = useState(new Date().toLocaleDateString());
  const [isQuickTesting, setIsQuickTesting] = useState(false);
  const [quickTestTemplateFields, setQuickTestTemplateFields] = useState<string[]>([]);
  const [isLoadingQuickTestFields, setIsLoadingQuickTestFields] = useState(false);
  const [quickTestDownloadUrl, setQuickTestDownloadUrl] = useState<string | null>(null);

  // Dialog fullscreen state
  const [isDialogFullscreen, setIsDialogFullscreen] = useState(false);

  // Filter questionnaire fields based on selected document type
  const filteredQuestionnaireFields = mappingForm.documentType
    ? getFieldsForDocumentType(mappingForm.documentType)
    : QUESTIONNAIRE_FIELDS;

  // Prevent hydration mismatch with Radix UI
  useEffect(() => {
    setMounted(true);
  }, []);

  // Load initial data
  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/docspring?action=config");
      const data = await response.json();

      if (data.configured && data.hasCredentials) {
        setConnectionStatus("connected");
        setMappings(data.mappings || []);
        // Load templates
        loadTemplates();
      } else {
        setConnectionStatus("unknown");
      }
    } catch (error) {
      console.error("Error loading config:", error);
      setConnectionStatus("error");
    } finally {
      setIsLoading(false);
    }
  };

  const testConnection = async () => {
    setIsTesting(true);
    try {
      const response = await fetch("/api/admin/docspring?action=test");
      const data = await response.json();

      if (data.success) {
        setConnectionStatus("connected");
        toast.success("Connection successful!");
        loadTemplates();
      } else {
        setConnectionStatus("error");
        toast.error(data.message || "Connection failed");
      }
    } catch (error) {
      setConnectionStatus("error");
      toast.error("Failed to test connection");
    } finally {
      setIsTesting(false);
    }
  };

  const loadTemplates = async () => {
    setIsLoadingTemplates(true);
    try {
      const response = await fetch("/api/admin/docspring?action=templates");
      const data = await response.json();

      if (data.templates) {
        setTemplates(data.templates);
      } else if (data.error) {
        toast.error(data.error);
      }
    } catch (error) {
      toast.error("Failed to load templates");
    } finally {
      setIsLoadingTemplates(false);
    }
  };

  const loadTemplateFields = async (templateId: string) => {
    try {
      const response = await fetch(`/api/admin/docspring?action=template-fields&templateId=${templateId}`);
      const data = await response.json();

      if (data.template) {
        setSelectedTemplate(data.template);
      }
    } catch (error) {
      toast.error("Failed to load template fields");
    }
  };

  const saveMapping = async () => {
    if (!mappingForm.state || !mappingForm.practiceArea || !mappingForm.documentType || !mappingForm.templateId) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSavingMapping(true);
    try {
      const template = templates.find(t => t.id === mappingForm.templateId);

      const response = await fetch("/api/admin/docspring", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save-mapping",
          mapping: {
            id: editingMapping?.id,
            state: mappingForm.state,
            practiceArea: mappingForm.practiceArea,
            documentType: mappingForm.documentType,
            templateId: mappingForm.templateId,
            templateName: template?.name || "Unknown Template",
            fieldMappings: mappingForm.fieldMappings,
          },
        }),
      });

      const data = await response.json();
      console.log("Save mapping response:", data);

      if (data.success) {
        const fieldCount = Object.keys(mappingForm.fieldMappings).length;
        toast.success(`Mapping saved! ${fieldCount} fields mapped.`);
        setMappingDialogOpen(false);
        loadConfig();
        resetMappingForm();
      } else {
        console.error("Save mapping error:", data);
        toast.error(data.error || "Failed to save mapping");
      }
    } catch (error) {
      console.error("Save mapping exception:", error);
      toast.error("Failed to save mapping - check console for details");
    } finally {
      setIsSavingMapping(false);
    }
  };

  const deleteMapping = async (mappingId: string) => {
    if (!confirm("Are you sure you want to delete this mapping?")) return;

    try {
      const response = await fetch("/api/admin/docspring", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete-mapping",
          mappingId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Mapping deleted");
        loadConfig();
      } else {
        toast.error(data.error || "Failed to delete mapping");
      }
    } catch (error) {
      toast.error("Failed to delete mapping");
    }
  };

  const testDownload = async (mapping: any) => {
    setIsGeneratingTest(mapping.id);
    try {
      const response = await fetch("/api/admin/docspring", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "test-generate",
          templateId: mapping.template_id,
          fieldMappings: mapping.field_mappings || {},
        }),
      });

      const data = await response.json();

      if (data.success && data.download_url) {
        toast.success(`Test PDF generated! ${data.mappedFieldsCount} fields mapped.`);
        // Open download in new tab
        window.open(data.download_url, "_blank");
      } else {
        toast.error(data.error || "Failed to generate test PDF");
      }
    } catch (error) {
      toast.error("Failed to generate test PDF");
    } finally {
      setIsGeneratingTest(null);
    }
  };

  const resetMappingForm = () => {
    setMappingForm({
      state: "",
      practiceArea: "",
      documentType: "",
      templateId: "",
      fieldMappings: {},
    });
    setEditingMapping(null);
    setSelectedTemplate(null);
    setDocspringSearch("");
    setIntakeSearch("");
    setSelectedDocspringField(null);
    setSelectedIntakeField(null);
  };

  const openEditMapping = (mapping: FieldMapping) => {
    setEditingMapping(mapping);
    setMappingForm({
      state: mapping.state,
      practiceArea: mapping.practiceArea,
      documentType: mapping.documentType,
      templateId: mapping.templateId,
      fieldMappings: mapping.fieldMappings,
    });
    loadTemplateFields(mapping.templateId);
    setMappingDialogOpen(true);
  };

  const handleTemplateSelect = (templateId: string) => {
    setMappingForm({ ...mappingForm, templateId, fieldMappings: {} });
    loadTemplateFields(templateId);
  };

  // Load fields when quick test template is selected
  const loadQuickTestFields = async (templateId: string) => {
    setQuickTestTemplateId(templateId);
    setIsLoadingQuickTestFields(true);
    try {
      const response = await fetch(`/api/admin/docspring?action=template-fields&templateId=${templateId}`);
      const data = await response.json();
      if (data.template?.editable_fields) {
        const fieldNames = data.template.editable_fields.map((f: { name: string }) => f.name);
        setQuickTestTemplateFields(fieldNames);
        // Auto-fill first 2 fields if available
        if (fieldNames.length >= 1) setQuickTestField1(fieldNames[0]);
        if (fieldNames.length >= 2) setQuickTestField2(fieldNames[1]);
      }
    } catch (error) {
      console.error("Failed to load template fields:", error);
    } finally {
      setIsLoadingQuickTestFields(false);
    }
  };

  // Quick Test with 2 fields - instant PDF generation
  const runQuickTest = async () => {
    if (!quickTestTemplateId) {
      toast.error("Please select a template first");
      return;
    }
    if (!quickTestField1 || !quickTestField2) {
      toast.error("Please enter both field names");
      return;
    }

    setIsQuickTesting(true);
    try {
      const response = await fetch("/api/admin/docspring", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "quick-test",
          templateId: quickTestTemplateId,
          testData: {
            [quickTestField1]: quickTestValue1,
            [quickTestField2]: quickTestValue2,
          },
        }),
      });

      const data = await response.json();

      if (data.success && data.download_url) {
        toast.success("Test PDF generated!");
        setQuickTestDownloadUrl(data.download_url);
        // Try to open, but also show link in case popup is blocked
        const newWindow = window.open(data.download_url, "_blank");
        if (!newWindow) {
          toast.info("Popup blocked - use the download link below");
        }
      } else {
        const errorMsg = data.error || "Failed to generate test PDF";
        const hint = data.hint ? ` - ${data.hint}` : "";
        toast.error(`${errorMsg}${hint}`);
        console.error("Quick test error:", data);
      }
    } catch (error) {
      toast.error("Failed to generate test PDF");
    } finally {
      setIsQuickTesting(false);
    }
  };

  // Show loading state until mounted (prevents hydration errors) and data loaded
  if (!mounted || isLoading) {
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
          <h1 className="text-2xl font-bold text-slate-900">DocSpring Integration</h1>
          <p className="text-slate-600">
            Configure PDF template generation with DocSpring API
          </p>
        </div>
        <Badge
          variant="outline"
          className={
            connectionStatus === "connected"
              ? "bg-green-50 text-green-700 border-green-200"
              : connectionStatus === "error"
              ? "bg-red-50 text-red-700 border-red-200"
              : "bg-amber-50 text-amber-700 border-amber-200"
          }
        >
          {connectionStatus === "connected" && <CheckCircle2 className="h-3 w-3 mr-1" />}
          {connectionStatus === "error" && <XCircle className="h-3 w-3 mr-1" />}
          {connectionStatus === "unknown" && <AlertCircle className="h-3 w-3 mr-1" />}
          {connectionStatus === "connected"
            ? "Connected"
            : connectionStatus === "error"
            ? "Connection Error"
            : "Not Configured"}
        </Badge>
      </div>

      {/* Quick Test Card - Instant 2-field test */}
      <Card className="border-2 border-dashed border-emerald-300 bg-emerald-50/50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-emerald-700">
            <Zap className="h-5 w-5" />
            Quick Test (2 Fields)
          </CardTitle>
          <CardDescription>
            Instantly test DocSpring with 2 custom fields to verify integration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
            {/* Template Selection */}
            <div className="md:col-span-2 space-y-2">
              <Label>Template</Label>
              <Select value={quickTestTemplateId} onValueChange={loadQuickTestFields}>
                <SelectTrigger>
                  <SelectValue placeholder="Select template..." />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {isLoadingQuickTestFields && (
                <span className="text-xs text-slate-500">Loading fields...</span>
              )}
            </div>

            {/* Field 1 */}
            <div className="space-y-2">
              <Label>Field 1 Name</Label>
              {quickTestTemplateFields.length > 0 ? (
                <Select value={quickTestField1} onValueChange={setQuickTestField1}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select field..." />
                  </SelectTrigger>
                  <SelectContent>
                    {quickTestTemplateFields.map((f) => (
                      <SelectItem key={f} value={f}>{f}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  placeholder="Select template first"
                  value={quickTestField1}
                  onChange={(e) => setQuickTestField1(e.target.value)}
                />
              )}
            </div>
            <div className="space-y-2">
              <Label>Field 1 Value</Label>
              <Input
                placeholder="e.g. John Doe"
                value={quickTestValue1}
                onChange={(e) => setQuickTestValue1(e.target.value)}
              />
            </div>

            {/* Field 2 */}
            <div className="space-y-2">
              <Label>Field 2 Name</Label>
              {quickTestTemplateFields.length > 0 ? (
                <Select value={quickTestField2} onValueChange={setQuickTestField2}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select field..." />
                  </SelectTrigger>
                  <SelectContent>
                    {quickTestTemplateFields.map((f) => (
                      <SelectItem key={f} value={f}>{f}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  placeholder="Select template first"
                  value={quickTestField2}
                  onChange={(e) => setQuickTestField2(e.target.value)}
                />
              )}
            </div>
            <div className="space-y-2">
              <Label>Field 2 Value</Label>
              <Input
                placeholder="e.g. 2024-01-15"
                value={quickTestValue2}
                onChange={(e) => setQuickTestValue2(e.target.value)}
              />
            </div>
          </div>

          {/* Show available fields */}
          {quickTestTemplateFields.length > 0 && (
            <div className="mt-3 p-2 bg-slate-100 rounded text-xs">
              <span className="font-medium text-slate-700">Available fields ({quickTestTemplateFields.length}): </span>
              <span className="text-slate-600">{quickTestTemplateFields.slice(0, 10).join(", ")}{quickTestTemplateFields.length > 10 ? "..." : ""}</span>
            </div>
          )}

          <div className="mt-4 flex items-center gap-4">
            <Button
              onClick={runQuickTest}
              disabled={isQuickTesting || !quickTestTemplateId || templates.length === 0}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {isQuickTesting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              {isQuickTesting ? "Generating..." : "Generate Test PDF"}
            </Button>
            {templates.length === 0 && (
              <span className="text-sm text-amber-600">
                Load templates first (click Refresh in Templates tab)
              </span>
            )}
            {quickTestDownloadUrl && (
              <a
                href={quickTestDownloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
              >
                <Download className="h-4 w-4" />
                Download PDF
              </a>
            )}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="connection" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-[500px]">
          <TabsTrigger value="connection" className="flex items-center gap-2">
            <Link2 className="h-4 w-4" />
            Connection
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="mappings" className="flex items-center gap-2">
            <Map className="h-4 w-4" />
            Mappings
          </TabsTrigger>
          <TabsTrigger value="test" className="flex items-center gap-2">
            <FlaskConical className="h-4 w-4" />
            Test
          </TabsTrigger>
        </TabsList>

        {/* Connection Tab */}
        <TabsContent value="connection">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                API Connection Settings
              </CardTitle>
              <CardDescription>
                Configure your DocSpring API credentials. Credentials are stored in environment variables for security.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                  <h4 className="font-medium text-slate-900 mb-2">Environment Variables Required</h4>
                  <p className="text-sm text-slate-600 mb-3">
                    Add these to your <code className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-800">.env.local</code> file:
                  </p>
                  <pre className="p-3 bg-slate-900 text-green-400 rounded-lg text-sm overflow-x-auto">
{`DOCSPRING_API_TOKEN_ID=your_token_id
DOCSPRING_API_TOKEN_SECRET=your_token_secret`}
                  </pre>
                </div>

                <div className="flex items-center gap-4">
                  <Button onClick={testConnection} disabled={isTesting}>
                    {isTesting ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Zap className="h-4 w-4 mr-2" />
                    )}
                    Test Connection
                  </Button>

                  <Button variant="outline" onClick={loadConfig}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh Status
                  </Button>
                </div>

                {connectionStatus === "connected" && (
                  <div className="flex items-center gap-2 p-4 rounded-lg bg-green-50 border border-green-200">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <span className="text-green-700 font-medium">
                      DocSpring API is connected and ready!
                    </span>
                  </div>
                )}

                {connectionStatus === "error" && (
                  <div className="flex items-center gap-2 p-4 rounded-lg bg-red-50 border border-red-200">
                    <XCircle className="h-5 w-5 text-red-600" />
                    <span className="text-red-700 font-medium">
                      Connection failed. Please check your credentials.
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    DocSpring Templates
                  </CardTitle>
                  <CardDescription>
                    Available PDF templates from your DocSpring account
                  </CardDescription>
                </div>
                <Button variant="outline" onClick={loadTemplates} disabled={isLoadingTemplates}>
                  {isLoadingTemplates ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-2" />
                  )}
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {templates.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 mb-2">No Templates Found</h3>
                  <p className="text-slate-500 max-w-md mx-auto">
                    {connectionStatus !== "connected"
                      ? "Connect to DocSpring API first to view templates."
                      : "Upload PDF templates to your DocSpring account to see them here."}
                  </p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Template Name</TableHead>
                        <TableHead>Template ID</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {templates.map((template) => (
                        <TableRow key={template.id}>
                          <TableCell className="font-medium">{template.name}</TableCell>
                          <TableCell>
                            <code className="px-2 py-1 rounded bg-slate-100 text-xs">
                              {template.id}
                            </code>
                          </TableCell>
                          <TableCell className="text-slate-500">
                            {template.description || "No description"}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => loadTemplateFields(template.id)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View Fields
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {/* Template Fields Dialog */}
              {selectedTemplate && (
                <Dialog open={!!selectedTemplate && !mappingDialogOpen} onOpenChange={() => setSelectedTemplate(null)}>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>{selectedTemplate.name}</DialogTitle>
                      <DialogDescription>
                        Template ID: <code className="px-1.5 py-0.5 rounded bg-slate-100">{selectedTemplate.id}</code>
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <h4 className="font-medium">Editable Fields ({selectedTemplate.editable_fields?.length || 0})</h4>
                      {selectedTemplate.editable_fields && selectedTemplate.editable_fields.length > 0 ? (
                        <div className="rounded-md border">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead>Field ID</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Required</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {selectedTemplate.editable_fields.map((field, idx) => (
                                <TableRow key={idx}>
                                  <TableCell className="text-sm font-medium">
                                    {field.title || field.name}
                                  </TableCell>
                                  <TableCell className="font-mono text-xs text-slate-500">
                                    {field.name}
                                  </TableCell>
                                  <TableCell>
                                    <Badge variant="secondary">{field.type}</Badge>
                                  </TableCell>
                                  <TableCell>
                                    {field.required ? (
                                      <Badge className="bg-red-100 text-red-700">Required</Badge>
                                    ) : (
                                      <Badge variant="outline">Optional</Badge>
                                    )}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      ) : (
                        <p className="text-slate-500">No editable fields found in this template.</p>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Mappings Tab */}
        <TabsContent value="mappings">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Map className="h-5 w-5" />
                    Field Mappings
                  </CardTitle>
                  <CardDescription>
                    Map questionnaire fields to DocSpring template fields
                  </CardDescription>
                </div>
                <Button onClick={() => {
                  resetMappingForm();
                  setMappingDialogOpen(true);
                }}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Mapping
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {mappings.length === 0 ? (
                <div className="text-center py-12">
                  <Database className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 mb-2">No Mappings Configured</h3>
                  <p className="text-slate-500 max-w-md mx-auto mb-4">
                    Create mappings to connect questionnaire data with DocSpring templates for automatic PDF generation.
                  </p>
                  <Button onClick={() => {
                    resetMappingForm();
                    setMappingDialogOpen(true);
                  }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Mapping
                  </Button>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>State</TableHead>
                        <TableHead>Practice Area</TableHead>
                        <TableHead>Document Type</TableHead>
                        <TableHead>Template</TableHead>
                        <TableHead>Fields Mapped</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mappings.map((mapping: any) => (
                        <TableRow key={mapping.id}>
                          <TableCell>
                            <Badge variant="outline">{mapping.state}</Badge>
                          </TableCell>
                          <TableCell className="capitalize">
                            {mapping.practice_area?.replace(/_/g, " ")}
                          </TableCell>
                          <TableCell className="capitalize">
                            {mapping.document_type?.replace(/_/g, " ")}
                          </TableCell>
                          <TableCell>
                            <code className="px-2 py-1 rounded bg-slate-100 text-xs">
                              {mapping.template_id?.slice(0, 15)}...
                            </code>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {Object.keys(mapping.field_mappings || {}).length} fields
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => testDownload(mapping)}
                                disabled={isGeneratingTest === mapping.id}
                                title="Test Download with Sample Data"
                              >
                                {isGeneratingTest === mapping.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Download className="h-4 w-4 text-emerald-500" />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openEditMapping({
                                  id: mapping.id,
                                  state: mapping.state,
                                  practiceArea: mapping.practice_area,
                                  documentType: mapping.document_type,
                                  templateId: mapping.template_id,
                                  templateName: mapping.template_name,
                                  fieldMappings: mapping.field_mappings || {},
                                })}
                                title="Edit Mapping"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteMapping(mapping.id)}
                                title="Delete Mapping"
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
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

          {/* Mapping Dialog */}
          <Dialog open={mappingDialogOpen} onOpenChange={(open) => {
            setMappingDialogOpen(open);
            if (!open) {
              resetMappingForm();
              setIsDialogFullscreen(false);
            }
          }}>
            <DialogContent className={`overflow-y-auto transition-all duration-200 ${
              isDialogFullscreen
                ? "!max-w-none !w-screen !h-screen !max-h-screen !rounded-none !top-0 !left-0 !translate-x-0 !translate-y-0 !fixed !inset-0"
                : "max-w-[100vw] w-[calc(100vw-2rem)] max-h-[90vh]"
            }`}>
              <DialogHeader className="flex flex-row items-start justify-between">
                <div>
                  <DialogTitle>
                    {editingMapping ? "Edit Field Mapping" : "Create New Field Mapping"}
                  </DialogTitle>
                  <DialogDescription>
                    Configure how questionnaire data maps to DocSpring template fields
                  </DialogDescription>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsDialogFullscreen(!isDialogFullscreen)}
                  className="h-8 w-8 shrink-0"
                  title={isDialogFullscreen ? "Exit fullscreen" : "Fullscreen"}
                >
                  {isDialogFullscreen ? (
                    <Minimize2 className="h-4 w-4" />
                  ) : (
                    <Maximize2 className="h-4 w-4" />
                  )}
                </Button>
              </DialogHeader>

              <div className="space-y-6 py-4">
                {/* Step 1: Select Document Type */}
                <div className="space-y-4">
                  <h4 className="font-medium text-slate-900">Step 1: Select Document Type</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>State</Label>
                      <Select
                        value={mappingForm.state || undefined}
                        onValueChange={(value) => setMappingForm({ ...mappingForm, state: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select state" />
                        </SelectTrigger>
                        <SelectContent>
                          {STATES.map((state) => (
                            <SelectItem key={state.value} value={state.value}>
                              {state.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Practice Area</Label>
                      <Select
                        value={mappingForm.practiceArea || undefined}
                        onValueChange={(value) => setMappingForm({
                          ...mappingForm,
                          practiceArea: value,
                          documentType: "",
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select area" />
                        </SelectTrigger>
                        <SelectContent>
                          {PRACTICE_AREAS.map((area) => (
                            <SelectItem key={area.value} value={area.value}>
                              {area.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Document Type</Label>
                      <Select
                        value={mappingForm.documentType || undefined}
                        onValueChange={(value) => setMappingForm({ ...mappingForm, documentType: value })}
                        disabled={!mappingForm.practiceArea}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select document" />
                        </SelectTrigger>
                        <SelectContent>
                          {mappingForm.practiceArea &&
                            DOCUMENT_TYPES[mappingForm.practiceArea as keyof typeof DOCUMENT_TYPES]?.map((doc) => (
                              <SelectItem key={doc.value} value={doc.value}>
                                {doc.label}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Step 2: Select Template */}
                <div className="space-y-4">
                  <h4 className="font-medium text-slate-900">Step 2: Select DocSpring Template</h4>
                  <div className="space-y-2">
                    <Label>Template</Label>
                    <Select
                      value={mappingForm.templateId || undefined}
                      onValueChange={handleTemplateSelect}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a template" />
                      </SelectTrigger>
                      <SelectContent>
                        {templates.map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {templates.length === 0 && (
                      <p className="text-sm text-amber-600">
                        No templates available. Upload templates to DocSpring first.
                      </p>
                    )}
                  </div>
                </div>

                {/* Step 3: Field Mappings - Side by Side */}
                {selectedTemplate && selectedTemplate.editable_fields && (
                  <>
                    <Separator />
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-slate-900">
                          Step 3: Map Fields ({selectedTemplate.editable_fields.length} DocSpring fields → {filteredQuestionnaireFields.length} Intake fields)
                        </h4>
                        <Badge variant="secondary">
                          {Object.keys(mappingForm.fieldMappings).filter(k => mappingForm.fieldMappings[k]).length} mapped
                        </Badge>
                      </div>

                      {/* Map Selected Button */}
                      {selectedDocspringField && selectedIntakeField && (
                        <div className="flex items-center justify-center gap-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                          <code className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">{selectedDocspringField}</code>
                          <ArrowRight className="h-4 w-4 text-green-600" />
                          <code className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded">{selectedIntakeField}</code>
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => {
                              setMappingForm({
                                ...mappingForm,
                                fieldMappings: {
                                  ...mappingForm.fieldMappings,
                                  [selectedDocspringField]: selectedIntakeField,
                                },
                              });
                              setSelectedDocspringField(null);
                              setSelectedIntakeField(null);
                              toast.success(`Mapped: ${selectedDocspringField} → ${selectedIntakeField}`);
                            }}
                          >
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            Map These Fields
                          </Button>
                        </div>
                      )}

                      {/* Side by Side View */}
                      <div className="grid grid-cols-2 gap-4">
                        {/* Left: DocSpring Template Fields */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label className="text-purple-700 font-medium">DocSpring Template Fields</Label>
                            <Badge variant="outline" className="text-purple-600">{selectedTemplate.editable_fields.length}</Badge>
                          </div>
                          <Input
                            placeholder="Search DocSpring fields..."
                            value={docspringSearch}
                            onChange={(e) => setDocspringSearch(e.target.value)}
                            className="h-8 text-xs"
                          />
                          <p className="text-[10px] text-slate-500">Click a field to select it for mapping</p>
                          <div className="border rounded-lg bg-purple-50/50 max-h-[350px] overflow-y-auto">
                            {selectedTemplate.editable_fields
                              .filter((field: any) => {
                                const search = docspringSearch.toLowerCase();
                                return field.name.toLowerCase().includes(search) ||
                                       (field.title && field.title.toLowerCase().includes(search));
                              })
                              .map((field: any, idx: number) => {
                              const isMapped = !!mappingForm.fieldMappings[field.name];
                              const isSelected = selectedDocspringField === field.name;
                              const displayTitle = field.title && field.title !== field.name ? field.title : null;
                              return (
                                <div
                                  key={idx}
                                  onClick={() => setSelectedDocspringField(isSelected ? null : field.name)}
                                  className={`flex items-center justify-between p-2 border-b last:border-0 cursor-pointer transition-colors
                                    ${isSelected ? 'bg-purple-200 border-purple-400' : isMapped ? 'bg-green-50' : 'hover:bg-purple-100'}`}
                                >
                                  <div className="flex-1 min-w-0">
                                    {displayTitle ? (
                                      <>
                                        <span className="text-xs text-purple-900 font-medium truncate block" title={displayTitle}>
                                          {displayTitle}
                                        </span>
                                        <code className="text-[10px] text-purple-500 truncate block" title={field.name}>
                                          {field.name}
                                        </code>
                                      </>
                                    ) : (
                                      <code className="text-xs text-purple-800 truncate block" title={field.name}>
                                        {field.name}
                                      </code>
                                    )}
                                    {isMapped && (
                                      <span className="text-[10px] text-green-600">→ {mappingForm.fieldMappings[field.name]}</span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 ml-2">
                                    <Badge variant="outline" className="text-[10px] px-1">
                                      {field.type}
                                    </Badge>
                                    {isMapped && <CheckCircle2 className="h-3 w-3 text-green-600" />}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Right: Intake Form Fields */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label className="text-emerald-700 font-medium">Intake Form Fields</Label>
                            <Badge variant="outline" className="text-emerald-600">{filteredQuestionnaireFields.length}</Badge>
                          </div>
                          <Input
                            placeholder="Search intake fields..."
                            value={intakeSearch}
                            onChange={(e) => setIntakeSearch(e.target.value)}
                            className="h-8 text-xs"
                          />
                          <p className="text-[10px] text-slate-500">Click a field to select it for mapping</p>
                          <div className="border rounded-lg bg-emerald-50/50 max-h-[350px] overflow-y-auto">
                            {filteredQuestionnaireFields
                              .filter((field) =>
                                field.label.toLowerCase().includes(intakeSearch.toLowerCase()) ||
                                field.key.toLowerCase().includes(intakeSearch.toLowerCase())
                              )
                              .map((field, idx) => {
                              const usedIn = Object.entries(mappingForm.fieldMappings)
                                .filter(([_, v]) => v === field.key)
                                .map(([k]) => k);
                              const isSelected = selectedIntakeField === field.key;
                              return (
                                <div
                                  key={idx}
                                  onClick={() => setSelectedIntakeField(isSelected ? null : field.key)}
                                  className={`flex items-center justify-between p-2 border-b last:border-0 cursor-pointer transition-colors
                                    ${isSelected ? 'bg-emerald-200 border-emerald-400' : usedIn.length > 0 ? 'bg-green-50' : 'hover:bg-emerald-100'}`}
                                >
                                  <div className="flex-1 min-w-0">
                                    <span className="text-xs text-emerald-800 block truncate" title={field.label}>
                                      {field.label}
                                    </span>
                                    <code className="text-[10px] text-slate-500">{field.key}</code>
                                    {usedIn.length > 0 && (
                                      <span className="text-[10px] text-green-600 block">Used in: {usedIn.length} field(s)</span>
                                    )}
                                  </div>
                                  <Badge variant="outline" className="text-[10px] px-1">
                                    {field.category}
                                  </Badge>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Mapping Table */}
                      <div className="space-y-2">
                        <Label className="text-slate-700 font-medium">Create Mappings</Label>
                        <p className="text-xs text-slate-500">Select a DocSpring field and map it to an intake field</p>
                        <div className="rounded-md border max-h-[300px] overflow-y-auto">
                          <Table>
                            <TableHeader>
                              <TableRow className="bg-slate-50">
                                <TableHead className="w-[45%] text-purple-700">DocSpring Field</TableHead>
                                <TableHead className="w-[10%] text-center">→</TableHead>
                                <TableHead className="w-[45%] text-emerald-700">Intake Field</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {selectedTemplate.editable_fields.slice(0, 100).map((field: any, idx: number) => (
                                <TableRow key={idx} className={mappingForm.fieldMappings[field.name] ? 'bg-green-50/50' : ''}>
                                  <TableCell className="py-1">
                                    <div className="max-w-[250px]">
                                      {field.title && field.title !== field.name ? (
                                        <>
                                          <span className="text-xs text-purple-900 font-medium truncate block" title={field.title}>
                                            {field.title}
                                          </span>
                                          <code className="text-[10px] text-purple-500 truncate block" title={field.name}>
                                            {field.name}
                                          </code>
                                        </>
                                      ) : (
                                        <code className="text-xs bg-purple-100 text-purple-700 px-1 py-0.5 rounded truncate block" title={field.name}>
                                          {field.name}
                                        </code>
                                      )}
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-center py-1">
                                    <ArrowRight className="h-3 w-3 text-slate-400 mx-auto" />
                                  </TableCell>
                                  <TableCell className="py-1">
                                    <Select
                                      value={mappingForm.fieldMappings[field.name] || "__none__"}
                                      onValueChange={(value) => {
                                        const newMappings = { ...mappingForm.fieldMappings };
                                        if (value === "__none__") {
                                          delete newMappings[field.name];
                                        } else {
                                          newMappings[field.name] = value;
                                        }
                                        setMappingForm({ ...mappingForm, fieldMappings: newMappings });
                                      }}
                                    >
                                      <SelectTrigger className="h-8 text-xs">
                                        <SelectValue placeholder="Select intake field..." />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="__none__">-- Not Mapped --</SelectItem>
                                        {filteredQuestionnaireFields.map((qField) => (
                                          <SelectItem key={qField.key} value={qField.key}>
                                            <span className="text-xs">{qField.label}</span>
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                          {selectedTemplate.editable_fields.length > 100 && (
                            <div className="p-2 text-center text-sm text-slate-500 bg-slate-50 border-t">
                              Showing first 100 of {selectedTemplate.editable_fields.length} fields
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setMappingDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={saveMapping} disabled={isSavingMapping}>
                  {isSavingMapping ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                  )}
                  Save Mapping
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* Test Tab */}
        <TabsContent value="test">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FlaskConical className="h-5 w-5" />
                Test Field Mapping
              </CardTitle>
              <CardDescription>
                Preview how intake data maps to DocSpring template fields
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Template Selection */}
                <div className="space-y-2">
                  <Label>Select Template to Test</Label>
                  <Select
                    value={selectedTemplate?.id}
                    onValueChange={(templateId) => loadTemplateFields(templateId)}
                  >
                    <SelectTrigger className="w-full max-w-md">
                      <SelectValue placeholder="Choose a template" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedTemplate && selectedTemplate.editable_fields && (
                  <div className="grid grid-cols-2 gap-6">
                    {/* Left: Sample Intake Data */}
                    <div className="space-y-4">
                      <h4 className="font-medium text-slate-900 flex items-center gap-2">
                        <Database className="h-4 w-4" />
                        Sample Intake Data
                      </h4>
                      <div className="rounded-lg border bg-slate-50 p-4 max-h-[500px] overflow-y-auto">
                        <div className="space-y-3">
                          {QUESTIONNAIRE_FIELDS.slice(0, 20).map((field) => (
                            <div key={field.key} className="flex justify-between items-center py-1 border-b border-slate-200 last:border-0">
                              <span className="text-sm text-slate-600">{field.label}</span>
                              <code className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded">
                                {field.key === "fullName" && "John Smith"}
                                {field.key === "email" && "john@email.com"}
                                {field.key === "ssn4" && "1234"}
                                {field.key === "county" && "Maricopa"}
                                {field.key === "gender" && "male"}
                                {field.key === "mailingAddress" && "123 Main St, Phoenix, AZ 85001"}
                                {field.key === "phone" && "(555) 123-4567"}
                                {field.key === "dateOfBirth" && "1985-03-15"}
                                {field.key === "dateOfMarriage" && "2015-06-20"}
                                {field.key === "spouseFullName" && "Jane Smith"}
                                {field.key === "spouseDateOfBirth" && "1987-08-22"}
                                {field.key === "spouseMailingAddress" && "456 Oak Ave, Phoenix, AZ 85002"}
                                {field.key === "spouseSsn4" && "5678"}
                                {field.key === "spousePhone" && "(555) 987-6543"}
                                {field.key === "spouseEmail" && "jane@email.com"}
                                {field.key === "isPregnant" && "false"}
                                {field.key === "wantsMaidenName" && "true"}
                                {field.key === "maidenName" && "Johnson"}
                                {field.key === "hasPropertyAgreement" && "true"}
                                {field.key === "propertyAgreementDetails" && "50/50 split"}
                                {!["fullName", "email", "ssn4", "county", "gender", "mailingAddress", "phone", "dateOfBirth", "dateOfMarriage", "spouseFullName", "spouseDateOfBirth", "spouseMailingAddress", "spouseSsn4", "spousePhone", "spouseEmail", "isPregnant", "wantsMaidenName", "maidenName", "hasPropertyAgreement", "propertyAgreementDetails"].includes(field.key) && "..."}
                              </code>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Right: DocSpring Fields */}
                    <div className="space-y-4">
                      <h4 className="font-medium text-slate-900 flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        DocSpring Template Fields ({selectedTemplate.editable_fields.length})
                      </h4>
                      <div className="rounded-lg border bg-slate-50 p-4 max-h-[500px] overflow-y-auto">
                        <div className="space-y-2">
                          {selectedTemplate.editable_fields.slice(0, 50).map((field: any, idx: number) => (
                            <div key={idx} className="flex justify-between items-center py-1 border-b border-slate-200 last:border-0">
                              <div className="min-w-0 flex-1 mr-2">
                                {field.title && field.title !== field.name ? (
                                  <>
                                    <span className="text-xs text-slate-800 font-medium truncate block" title={field.title}>
                                      {field.title}
                                    </span>
                                    <code className="text-[10px] text-purple-500 truncate block" title={field.name}>
                                      {field.name}
                                    </code>
                                  </>
                                ) : (
                                  <code className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded truncate block" title={field.name}>
                                    {field.name}
                                  </code>
                                )}
                              </div>
                              <Badge variant="outline" className="text-xs shrink-0">
                                {field.type}
                              </Badge>
                            </div>
                          ))}
                          {selectedTemplate.editable_fields.length > 50 && (
                            <p className="text-sm text-slate-500 text-center pt-2">
                              ... and {selectedTemplate.editable_fields.length - 50} more fields
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {selectedTemplate && selectedTemplate.editable_fields && (
                  <div className="mt-6 p-4 rounded-lg bg-emerald-50 border border-emerald-200">
                    <h4 className="font-medium text-emerald-900 mb-2">Mapping Summary</h4>
                    <p className="text-sm text-emerald-700">
                      Template has <strong>{selectedTemplate.editable_fields.length}</strong> fillable fields.
                      You have <strong>{QUESTIONNAIRE_FIELDS.length}</strong> intake fields available.
                    </p>
                    <p className="text-sm text-emerald-600 mt-2">
                      Go to the <strong>Mappings</strong> tab to create field mappings for this template.
                    </p>
                  </div>
                )}

                {!selectedTemplate && templates.length > 0 && (
                  <div className="text-center py-12">
                    <FlaskConical className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-900 mb-2">Select a Template</h3>
                    <p className="text-slate-500">
                      Choose a template above to preview its fields and test mapping.
                    </p>
                  </div>
                )}

                {templates.length === 0 && (
                  <div className="text-center py-12">
                    <AlertCircle className="h-12 w-12 text-amber-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-900 mb-2">No Templates Available</h3>
                    <p className="text-slate-500">
                      Connect to DocSpring and load templates first.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
