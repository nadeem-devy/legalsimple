"use client";

import { DivorceIntakeData, US_STATES } from "@/types/divorce-intake";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { AddressAutocomplete } from "@/components/ui/AddressAutocomplete";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SpouseInfoStepProps {
  data: DivorceIntakeData;
  updateData: (updates: Partial<DivorceIntakeData>) => void;
}

export function SpouseInfoStep({ data, updateData }: SpouseInfoStepProps) {
  const updateSpouseInfo = (field: string, value: string | boolean) => {
    updateData({
      spouseInfo: {
        ...data.spouseInfo,
        [field]: value,
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-amber-800">
          <strong>Your Spouse is the Respondent</strong> - This is the person being served
          with divorce papers. Please provide as much information as you know.
        </p>
      </div>

      {/* Full Legal Name */}
      <div className="space-y-2">
        <Label htmlFor="spouseFullName" className="flex items-center gap-2">
          Spouse&apos;s Full Legal Name
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <HelpCircle className="h-4 w-4 text-slate-400" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">Enter their name as it appears on legal documents</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </Label>
        <Input
          id="spouseFullName"
          placeholder="e.g., Jane Marie Smith"
          value={data.spouseInfo.fullLegalName}
          onChange={(e) => updateSpouseInfo("fullLegalName", e.target.value)}
        />
      </div>

      {/* Date of Birth */}
      <div className="space-y-2">
        <Label htmlFor="spouseDob">Spouse&apos;s Date of Birth</Label>
        <Input
          id="spouseDob"
          type="date"
          value={data.spouseInfo.dateOfBirth}
          onChange={(e) => updateSpouseInfo("dateOfBirth", e.target.value)}
        />
      </div>

      {/* Current Address */}
      <div className="space-y-2">
        <Label htmlFor="spouseAddress">Spouse&apos;s Current Street Address</Label>
        <AddressAutocomplete
          value={data.spouseInfo.currentAddress}
          onChange={(val) => updateSpouseInfo("currentAddress", val)}
          onSelect={(details) => {
            updateSpouseInfo("currentAddress", details.street);
            if (details.city) updateSpouseInfo("city", details.city);
            if (details.state) updateSpouseInfo("state", details.state);
            if (details.zip) updateSpouseInfo("zipCode", details.zip);
          }}
          placeholder="456 Oak Avenue"
          streetOnly
        />
      </div>

      {/* City, State, Zip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="space-y-2 col-span-2 md:col-span-1">
          <Label htmlFor="spouseCity">City</Label>
          <Input
            id="spouseCity"
            placeholder="Phoenix"
            value={data.spouseInfo.city}
            onChange={(e) => updateSpouseInfo("city", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="spouseState">State</Label>
          <Select
            value={data.spouseInfo.state}
            onValueChange={(value) => updateSpouseInfo("state", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              {US_STATES.map((state) => (
                <SelectItem key={state.value} value={state.value}>
                  {state.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="spouseZip">ZIP Code</Label>
          <Input
            id="spouseZip"
            placeholder="85001"
            value={data.spouseInfo.zipCode}
            onChange={(e) => updateSpouseInfo("zipCode", e.target.value)}
          />
        </div>
      </div>

      {/* Spouse County (optional) */}
      <div className="space-y-2">
        <Label htmlFor="spouseCounty">
          Spouse&apos;s County <span className="text-slate-400">(if known)</span>
        </Label>
        <Input
          id="spouseCounty"
          placeholder="Maricopa"
          value={data.spouseInfo.county}
          onChange={(e) => updateSpouseInfo("county", e.target.value)}
        />
      </div>

      {/* Contact Information */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="spousePhone">
            Phone Number <span className="text-slate-400">(if known)</span>
          </Label>
          <Input
            id="spousePhone"
            type="tel"
            placeholder="(602) 555-0456"
            value={data.spouseInfo.phoneNumber || ""}
            onChange={(e) => updateSpouseInfo("phoneNumber", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="spouseEmail">
            Email Address <span className="text-slate-400">(if known)</span>
          </Label>
          <Input
            id="spouseEmail"
            type="email"
            placeholder="jane@example.com"
            value={data.spouseInfo.email || ""}
            onChange={(e) => updateSpouseInfo("email", e.target.value)}
          />
        </div>
      </div>

      {/* Employment Status */}
      <div className="space-y-3">
        <Label>Is your spouse currently employed?</Label>
        <RadioGroup
          value={
            data.spouseInfo.isCurrentlyEmployed === null
              ? undefined
              : data.spouseInfo.isCurrentlyEmployed
              ? "yes"
              : "no"
          }
          onValueChange={(value) =>
            updateSpouseInfo("isCurrentlyEmployed", value === "yes")
          }
          className="flex gap-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="yes" id="spouse-employed-yes" />
            <Label htmlFor="spouse-employed-yes" className="cursor-pointer">Yes</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="no" id="spouse-employed-no" />
            <Label htmlFor="spouse-employed-no" className="cursor-pointer">No</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="unknown" id="spouse-employed-unknown" />
            <Label htmlFor="spouse-employed-unknown" className="cursor-pointer">Unknown</Label>
          </div>
        </RadioGroup>
      </div>

      {/* Conditional Employment Details */}
      {data.spouseInfo.isCurrentlyEmployed && (
        <div className="grid md:grid-cols-2 gap-4 pl-4 border-l-2 border-amber-200">
          <div className="space-y-2">
            <Label htmlFor="spouseEmployer">
              Employer Name <span className="text-slate-400">(if known)</span>
            </Label>
            <Input
              id="spouseEmployer"
              placeholder="Company Name"
              value={data.spouseInfo.employer || ""}
              onChange={(e) => updateSpouseInfo("employer", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="spouseOccupation">
              Occupation/Job Title <span className="text-slate-400">(if known)</span>
            </Label>
            <Input
              id="spouseOccupation"
              placeholder="e.g., Teacher"
              value={data.spouseInfo.occupation || ""}
              onChange={(e) => updateSpouseInfo("occupation", e.target.value)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
