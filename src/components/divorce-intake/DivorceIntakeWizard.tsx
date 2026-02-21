"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, AlertCircle, Check } from "lucide-react";
import {
  DivorceIntakeData,
  initialDivorceIntakeData,
  DIVORCE_INTAKE_STEPS,
} from "@/types/divorce-intake";

// Step Components
import { ChildrenCheckStep } from "./steps/ChildrenCheckStep";
import { PersonalInfoStep } from "./steps/PersonalInfoStep";
import { SpouseInfoStep } from "./steps/SpouseInfoStep";
import { MarriageInfoStep } from "./steps/MarriageInfoStep";
import { ResidencyStep } from "./steps/ResidencyStep";
import { RealEstateStep } from "./steps/RealEstateStep";
import { FurnitureStep } from "./steps/FurnitureStep";
import { BankAccountsStep } from "./steps/BankAccountsStep";
import { RetirementStep } from "./steps/RetirementStep";
import { VehiclesStep } from "./steps/VehiclesStep";
import { SeparatePropertyStep } from "./steps/SeparatePropertyStep";
import { DebtsStep } from "./steps/DebtsStep";
import { SpousalMaintenanceStep } from "./steps/SpousalMaintenanceStep";
import { TaxFilingStep } from "./steps/TaxFilingStep";
import { ReviewStep } from "./steps/ReviewStep";

interface DivorceIntakeWizardProps {
  caseId?: string;
  initialData?: Partial<DivorceIntakeData>;
  onComplete?: (data: DivorceIntakeData) => void;
}

export function DivorceIntakeWizard({
  caseId,
  initialData,
  onComplete,
}: DivorceIntakeWizardProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<DivorceIntakeData>({
    ...initialDivorceIntakeData,
    ...initialData,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [residencyBlocked, setResidencyBlocked] = useState(false);

  const currentStep = formData.currentStep;
  const totalSteps = DIVORCE_INTAKE_STEPS.length;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const updateFormData = useCallback((updates: Partial<DivorceIntakeData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  }, []);

  const goToStep = useCallback((step: number) => {
    if (step >= 0 && step < totalSteps) {
      setFormData((prev) => ({ ...prev, currentStep: step }));
    }
  }, [totalSteps]);

  const nextStep = useCallback(() => {
    // Handle children check - if they have children, redirect
    if (currentStep === 0 && formData.hasChildren === true) {
      toast.info("Redirecting to divorce with children form...");
      router.push("/intake/divorce-with-children");
      return;
    }

    // Handle residency check
    if (currentStep === 4 && formData.marriageInfo.meetsResidencyRequirement === false) {
      setResidencyBlocked(true);
      return;
    }

    if (currentStep < totalSteps - 1) {
      goToStep(currentStep + 1);
    }
  }, [currentStep, formData.hasChildren, formData.marriageInfo.meetsResidencyRequirement, totalSteps, goToStep, router]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setResidencyBlocked(false);
      goToStep(currentStep - 1);
    }
  }, [currentStep, goToStep]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/cases/save-intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caseId,
          intakeType: "divorce_no_children",
          data: formData,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save intake data");
      }

      const result = await response.json();
      toast.success("Intake form completed successfully!");

      if (onComplete) {
        onComplete(formData);
      } else {
        router.push(`/cases/${result.caseId || caseId}?generate=true`);
      }
    } catch (error) {
      console.error("Error saving intake:", error);
      toast.error("Failed to save your information. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    if (residencyBlocked) {
      return (
        <div className="text-center py-12">
          <AlertCircle className="h-16 w-16 text-amber-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-900 mb-2">
            Residency Requirement Not Met
          </h3>
          <p className="text-slate-600 max-w-md mx-auto mb-6">
            Arizona requires that at least one spouse has been a resident of Arizona
            for at least 90 days before filing for divorce. You may need to wait until
            you meet this requirement or consult with an attorney.
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={prevStep}>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
            <Button onClick={() => router.push("/chat")}>
              Talk to Our AI Assistant
            </Button>
          </div>
        </div>
      );
    }

    switch (currentStep) {
      case 0:
        return <ChildrenCheckStep data={formData} updateData={updateFormData} />;
      case 1:
        return <PersonalInfoStep data={formData} updateData={updateFormData} />;
      case 2:
        return <SpouseInfoStep data={formData} updateData={updateFormData} />;
      case 3:
        return <MarriageInfoStep data={formData} updateData={updateFormData} />;
      case 4:
        return <ResidencyStep data={formData} updateData={updateFormData} />;
      case 5:
        return <RealEstateStep data={formData} updateData={updateFormData} />;
      case 6:
        return <FurnitureStep data={formData} updateData={updateFormData} />;
      case 7:
        return <BankAccountsStep data={formData} updateData={updateFormData} />;
      case 8:
        return <RetirementStep data={formData} updateData={updateFormData} />;
      case 9:
        return <VehiclesStep data={formData} updateData={updateFormData} />;
      case 10:
        return <SeparatePropertyStep data={formData} updateData={updateFormData} />;
      case 11:
        return <DebtsStep data={formData} updateData={updateFormData} />;
      case 12:
        return <SpousalMaintenanceStep data={formData} updateData={updateFormData} />;
      case 13:
        return <TaxFilingStep data={formData} updateData={updateFormData} />;
      case 14:
        return <ReviewStep data={formData} goToStep={goToStep} />;
      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return formData.hasChildren !== null;
      case 1:
        return (
          formData.personalInfo.fullLegalName &&
          formData.personalInfo.dateOfBirth &&
          formData.personalInfo.currentAddress &&
          formData.personalInfo.city &&
          formData.personalInfo.state &&
          formData.personalInfo.zipCode &&
          formData.personalInfo.county
        );
      case 2:
        return (
          formData.spouseInfo.fullLegalName &&
          formData.spouseInfo.dateOfBirth &&
          formData.spouseInfo.currentAddress &&
          formData.spouseInfo.city &&
          formData.spouseInfo.state &&
          formData.spouseInfo.zipCode
        );
      case 3:
        return (
          formData.marriageInfo.dateOfMarriage &&
          formData.marriageInfo.dateOfSeparation
        );
      case 4:
        return formData.marriageInfo.meetsResidencyRequirement !== null;
      case 5:
        return formData.hasRealEstate !== null;
      case 6:
        return formData.hasFurniture !== null;
      case 7:
        return formData.hasBankAccounts !== null;
      case 8:
        return formData.hasRetirementAccounts !== null;
      case 9:
        return formData.hasVehicles !== null;
      case 10:
        return formData.separateProperty.hasSeparateProperty !== null;
      case 11:
        return formData.hasDebts !== null;
      case 12:
        return formData.spousalMaintenance.isRequesting !== null;
      case 13:
        return formData.taxFiling.filingPreference !== null;
      case 14:
        return true;
      default:
        return true;
    }
  };

  const stepInfo = DIVORCE_INTAKE_STEPS[currentStep];

  return (
    <div className="max-w-3xl mx-auto">
      {/* Progress Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-slate-500">
            Step {currentStep + 1} of {totalSteps}
          </span>
          <span className="text-sm font-medium text-slate-700">
            {Math.round(progress)}% Complete
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Step Navigation Pills */}
      <div className="flex gap-1 mb-6 overflow-x-auto pb-2">
        {DIVORCE_INTAKE_STEPS.map((step, index) => (
          <button
            key={step.id}
            onClick={() => index < currentStep && goToStep(index)}
            disabled={index > currentStep}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
              index === currentStep
                ? "bg-emerald-600 text-white"
                : index < currentStep
                ? "bg-green-100 text-green-700 hover:bg-green-200 cursor-pointer"
                : "bg-slate-100 text-slate-400 cursor-not-allowed"
            }`}
          >
            {index < currentStep && <Check className="h-3 w-3" />}
            {step.title}
          </button>
        ))}
      </div>

      {/* Main Card */}
      <Card>
        <CardHeader>
          <CardTitle>{stepInfo.title}</CardTitle>
          <CardDescription>{stepInfo.description}</CardDescription>
        </CardHeader>
        <CardContent>
          {renderStepContent()}

          {/* Navigation Buttons */}
          {!residencyBlocked && (
            <div className="flex justify-between mt-8 pt-6 border-t">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 0}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>

              {currentStep === totalSteps - 1 ? (
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isSubmitting ? "Submitting..." : "Complete & Generate Documents"}
                  <Check className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button onClick={nextStep} disabled={!canProceed()}>
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
