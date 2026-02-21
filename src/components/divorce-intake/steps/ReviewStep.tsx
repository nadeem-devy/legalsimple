"use client";

import { DivorceIntakeData } from "@/types/divorce-intake";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  User,
  Users,
  Calendar,
  Home,
  Sofa,
  Landmark,
  PiggyBank,
  Car,
  Lock,
  CreditCard,
  Scale,
  Receipt,
  Edit,
  CheckCircle2,
} from "lucide-react";

interface ReviewStepProps {
  data: DivorceIntakeData;
  goToStep: (step: number) => void;
}

export function ReviewStep({ data, goToStep }: ReviewStepProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Not provided";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const sections = [
    {
      title: "Your Information",
      icon: User,
      stepIndex: 1,
      items: [
        { label: "Name", value: data.personalInfo.fullLegalName },
        { label: "Date of Birth", value: formatDate(data.personalInfo.dateOfBirth) },
        {
          label: "Address",
          value: `${data.personalInfo.currentAddress}, ${data.personalInfo.city}, ${data.personalInfo.state} ${data.personalInfo.zipCode}`,
        },
        { label: "County", value: data.personalInfo.county },
        {
          label: "Employment",
          value: data.personalInfo.isCurrentlyEmployed
            ? `${data.personalInfo.occupation || "Employed"} at ${data.personalInfo.employer || "N/A"}`
            : "Not employed",
        },
      ],
    },
    {
      title: "Spouse Information",
      icon: Users,
      stepIndex: 2,
      items: [
        { label: "Name", value: data.spouseInfo.fullLegalName },
        { label: "Date of Birth", value: formatDate(data.spouseInfo.dateOfBirth) },
        {
          label: "Address",
          value: `${data.spouseInfo.currentAddress}, ${data.spouseInfo.city}, ${data.spouseInfo.state} ${data.spouseInfo.zipCode}`,
        },
      ],
    },
    {
      title: "Marriage Details",
      icon: Calendar,
      stepIndex: 3,
      items: [
        { label: "Date of Marriage", value: formatDate(data.marriageInfo.dateOfMarriage) },
        {
          label: "Location",
          value: data.marriageInfo.cityOfMarriage
            ? `${data.marriageInfo.cityOfMarriage}, ${data.marriageInfo.stateOfMarriage}`
            : "Not provided",
        },
        { label: "Date of Separation", value: formatDate(data.marriageInfo.dateOfSeparation) },
        {
          label: "Residency Requirement",
          value: data.marriageInfo.meetsResidencyRequirement ? "Met" : "Not Met",
        },
      ],
    },
    {
      title: "Real Estate",
      icon: Home,
      stepIndex: 5,
      items: data.hasRealEstate
        ? data.realEstateProperties.map((p, i) => ({
            label: `Property ${i + 1}`,
            value: `${p.address} (${formatCurrency(p.equity)} equity) → ${
              p.whoGetsProperty === "petitioner"
                ? "You keep"
                : p.whoGetsProperty === "respondent"
                ? "Spouse keeps"
                : "Sell & split"
            }`,
          }))
        : [{ label: "Status", value: "No real estate to divide" }],
    },
    {
      title: "Furniture & Household",
      icon: Sofa,
      stepIndex: 6,
      items: data.hasFurniture
        ? [
            {
              label: "Division Method",
              value:
                data.furniture.divisionMethod === "already_divided"
                  ? "Already divided"
                  : data.furniture.divisionMethod === "petitioner_keeps_all"
                  ? "You keep everything"
                  : data.furniture.divisionMethod === "respondent_keeps_all"
                  ? "Spouse keeps everything"
                  : "Will divide later",
            },
          ]
        : [{ label: "Status", value: "No furniture to divide" }],
    },
    {
      title: "Bank Accounts",
      icon: Landmark,
      stepIndex: 7,
      items: data.hasBankAccounts
        ? [
            {
              label: "Total",
              value: `${data.bankAccounts.length} accounts totaling ${formatCurrency(
                data.bankAccounts.reduce((sum, a) => sum + a.approximateBalance, 0)
              )}`,
            },
          ]
        : [{ label: "Status", value: "No bank accounts to divide" }],
    },
    {
      title: "Retirement Accounts",
      icon: PiggyBank,
      stepIndex: 8,
      items: data.hasRetirementAccounts
        ? [
            {
              label: "Total",
              value: `${data.retirementAccounts.length} accounts totaling ${formatCurrency(
                data.retirementAccounts.reduce((sum, a) => sum + a.approximateValue, 0)
              )}`,
            },
          ]
        : [{ label: "Status", value: "No retirement accounts to divide" }],
    },
    {
      title: "Vehicles",
      icon: Car,
      stepIndex: 9,
      items: data.hasVehicles
        ? data.vehicles.map((v, i) => ({
            label: `Vehicle ${i + 1}`,
            value: `${v.year} ${v.make} ${v.model} → ${
              v.whoGetsVehicle === "petitioner" ? "You keep" : "Spouse keeps"
            }`,
          }))
        : [{ label: "Status", value: "No vehicles to divide" }],
    },
    {
      title: "Separate Property",
      icon: Lock,
      stepIndex: 10,
      items: data.separateProperty.hasSeparateProperty
        ? [
            {
              label: "Items",
              value: `${data.separateProperty.items?.length || 0} items claimed as separate property`,
            },
          ]
        : [{ label: "Status", value: "No separate property claimed" }],
    },
    {
      title: "Debts",
      icon: CreditCard,
      stepIndex: 11,
      items: data.hasDebts
        ? [
            {
              label: "Total",
              value: `${data.debts.length} debts totaling ${formatCurrency(
                data.debts.reduce((sum, d) => sum + d.approximateBalance, 0)
              )}`,
            },
          ]
        : [{ label: "Status", value: "No debts to divide" }],
    },
    {
      title: "Spousal Maintenance",
      icon: Scale,
      stepIndex: 12,
      items: data.spousalMaintenance.isRequesting
        ? [
            {
              label: "Requesting Party",
              value:
                data.spousalMaintenance.requestingParty === "petitioner"
                  ? "You are requesting"
                  : "Spouse is requesting",
            },
            {
              label: "Amount",
              value: data.spousalMaintenance.requestedAmount
                ? `${formatCurrency(data.spousalMaintenance.requestedAmount)}/month`
                : "To be determined",
            },
          ]
        : [{ label: "Status", value: "No spousal maintenance requested" }],
    },
    {
      title: "Tax Filing",
      icon: Receipt,
      stepIndex: 13,
      items: [
        {
          label: "Preference",
          value:
            data.taxFiling.filingPreference === "file_separately"
              ? "File Separately"
              : data.taxFiling.filingPreference === "file_jointly_final_year"
              ? "File Jointly"
              : "Undecided",
        },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          <div>
            <p className="text-sm font-medium text-green-800">
              Review Your Information
            </p>
            <p className="text-sm text-green-700">
              Please review all information carefully before submitting. Click the
              edit button on any section to make changes.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <Card key={section.title} className="border-slate-200">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Icon className="h-5 w-5 text-slate-500" />
                    {section.title}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => goToStep(section.stepIndex)}
                    className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <dl className="space-y-1">
                  {section.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <dt className="text-slate-500">{item.label}:</dt>
                      <dd className="text-slate-900 font-medium text-right max-w-[60%]">
                        {item.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
        <p className="text-sm text-emerald-800">
          <strong>What happens next:</strong> After you submit, we&apos;ll generate your
          divorce petition documents based on this information. You&apos;ll be able to
          review and download the documents before filing.
        </p>
      </div>
    </div>
  );
}
