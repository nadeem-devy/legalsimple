"use client";

import { DivorceIntakeData, ARIZONA_COUNTIES, US_STATES } from "@/types/divorce-intake";
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

interface PersonalInfoStepProps {
  data: DivorceIntakeData;
  updateData: (updates: Partial<DivorceIntakeData>) => void;
}

export function PersonalInfoStep({ data, updateData }: PersonalInfoStepProps) {
  const updatePersonalInfo = (field: string, value: string | boolean) => {
    updateData({
      personalInfo: {
        ...data.personalInfo,
        [field]: value,
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-emerald-800">
          <strong>You are the Petitioner</strong> - This is the person filing for divorce.
          Please enter your information exactly as it appears on your legal documents.
        </p>
      </div>

      {/* Full Legal Name */}
      <div className="space-y-2">
        <Label htmlFor="fullName" className="flex items-center gap-2">
          Full Legal Name
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <HelpCircle className="h-4 w-4 text-slate-400" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">Enter your name exactly as it appears on your ID or marriage certificate</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </Label>
        <Input
          id="fullName"
          placeholder="e.g., John Michael Smith"
          value={data.personalInfo.fullLegalName}
          onChange={(e) => updatePersonalInfo("fullLegalName", e.target.value)}
        />
      </div>

      {/* Date of Birth */}
      <div className="space-y-2">
        <Label htmlFor="dob">Date of Birth</Label>
        <Input
          id="dob"
          type="date"
          value={data.personalInfo.dateOfBirth}
          onChange={(e) => updatePersonalInfo("dateOfBirth", e.target.value)}
        />
      </div>

      {/* Current Address */}
      <div className="space-y-2">
        <Label htmlFor="address">Current Street Address</Label>
        <AddressAutocomplete
          value={data.personalInfo.currentAddress}
          onChange={(val) => updatePersonalInfo("currentAddress", val)}
          onSelect={(details) => {
            updatePersonalInfo("currentAddress", details.street);
            if (details.city) updatePersonalInfo("city", details.city);
            if (details.state) updatePersonalInfo("state", details.state);
            if (details.zip) updatePersonalInfo("zipCode", details.zip);
          }}
          placeholder="123 Main Street, Apt 4B"
          streetOnly
        />
      </div>

      {/* City, State, Zip in a row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="space-y-2 col-span-2 md:col-span-1">
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            placeholder="Phoenix"
            value={data.personalInfo.city}
            onChange={(e) => updatePersonalInfo("city", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="state">State</Label>
          <Select
            value={data.personalInfo.state}
            onValueChange={(value) => updatePersonalInfo("state", value)}
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
          <Label htmlFor="zip">ZIP Code</Label>
          <Input
            id="zip"
            placeholder="85001"
            value={data.personalInfo.zipCode}
            onChange={(e) => updatePersonalInfo("zipCode", e.target.value)}
          />
        </div>
      </div>

      {/* Arizona County */}
      <div className="space-y-2">
        <Label htmlFor="county" className="flex items-center gap-2">
          Arizona County
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <HelpCircle className="h-4 w-4 text-slate-400" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">Select the Arizona county where you currently reside</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </Label>
        <Select
          value={data.personalInfo.county}
          onValueChange={(value) => updatePersonalInfo("county", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select county" />
          </SelectTrigger>
          <SelectContent>
            {ARIZONA_COUNTIES.map((county) => (
              <SelectItem key={county} value={county}>
                {county} County
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Contact Information */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="(602) 555-0123"
            value={data.personalInfo.phoneNumber}
            onChange={(e) => updatePersonalInfo("phoneNumber", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            placeholder="john@example.com"
            value={data.personalInfo.email}
            onChange={(e) => updatePersonalInfo("email", e.target.value)}
          />
        </div>
      </div>

      {/* Employment Status */}
      <div className="space-y-3">
        <Label className="flex items-center gap-2">
          Are you currently employed?
        </Label>
        <RadioGroup
          value={
            data.personalInfo.isCurrentlyEmployed === null
              ? undefined
              : data.personalInfo.isCurrentlyEmployed
              ? "yes"
              : "no"
          }
          onValueChange={(value) =>
            updatePersonalInfo("isCurrentlyEmployed", value === "yes")
          }
          className="flex gap-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="yes" id="employed-yes" />
            <Label htmlFor="employed-yes" className="cursor-pointer">Yes</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="no" id="employed-no" />
            <Label htmlFor="employed-no" className="cursor-pointer">No</Label>
          </div>
        </RadioGroup>
      </div>

      {/* Conditional Employment Details */}
      {data.personalInfo.isCurrentlyEmployed && (
        <div className="grid md:grid-cols-2 gap-4 pl-4 border-l-2 border-emerald-200">
          <div className="space-y-2">
            <Label htmlFor="employer">Employer Name</Label>
            <Input
              id="employer"
              placeholder="Company Name"
              value={data.personalInfo.employer || ""}
              onChange={(e) => updatePersonalInfo("employer", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="occupation">Your Occupation/Job Title</Label>
            <Input
              id="occupation"
              placeholder="e.g., Software Engineer"
              value={data.personalInfo.occupation || ""}
              onChange={(e) => updatePersonalInfo("occupation", e.target.value)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
