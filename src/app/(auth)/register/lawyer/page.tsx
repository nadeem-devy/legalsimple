"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, CheckCircle } from "lucide-react";
import { STATE_OPTIONS } from "@/config/states";
import { PRACTICE_AREA_OPTIONS } from "@/config/practice-areas";

const lawyerRegisterSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
  phone: z.string().min(10, "Please enter a valid phone number"),
  barNumber: z.string().min(1, "Bar number is required"),
  barState: z.enum(["AZ", "NV", "TX"]),
  statesLicensed: z.array(z.enum(["AZ", "NV", "TX"])).min(1, "Select at least one state"),
  practiceAreas: z.array(z.enum(["family_law", "personal_injury", "estate_planning"])).min(1, "Select at least one practice area"),
  yearsExperience: z.string().min(1, "Years of experience is required"),
  hourlyRate: z.string().optional(),
  bio: z.string().min(50, "Please provide a bio of at least 50 characters"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type LawyerRegisterForm = z.infer<typeof lawyerRegisterSchema>;

export default function LawyerRegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedStates, setSelectedStates] = useState<string[]>([]);
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LawyerRegisterForm>({
    resolver: zodResolver(lawyerRegisterSchema),
    defaultValues: {
      statesLicensed: [],
      practiceAreas: [],
    },
  });

  const toggleState = (state: string) => {
    const updated = selectedStates.includes(state)
      ? selectedStates.filter((s) => s !== state)
      : [...selectedStates, state];
    setSelectedStates(updated);
    setValue("statesLicensed", updated as ("AZ" | "NV" | "TX")[]);
  };

  const toggleArea = (area: string) => {
    const updated = selectedAreas.includes(area)
      ? selectedAreas.filter((a) => a !== area)
      : [...selectedAreas, area];
    setSelectedAreas(updated);
    setValue("practiceAreas", updated as ("family_law" | "personal_injury" | "estate_planning")[]);
  };

  const onSubmit = async (data: LawyerRegisterForm) => {
    setIsLoading(true);
    const supabase = createClient();

    try {
      // Sign up the user
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            role: "lawyer",
            full_name: data.fullName,
          },
        },
      });

      if (signUpError) {
        toast.error(signUpError.message);
        return;
      }

      if (authData.user) {
        // Update the profile
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error: profileError } = await (supabase as any)
          .from("profiles")
          .update({
            full_name: data.fullName,
            phone: data.phone,
            state: data.barState,
            role: "lawyer",
          })
          .eq("id", authData.user.id);

        if (profileError) {
          console.error("Profile update error:", profileError);
        }

        // Create lawyer profile
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error: lawyerError } = await (supabase as any)
          .from("lawyer_profiles")
          .insert({
            user_id: authData.user.id,
            bar_number: data.barNumber,
            bar_state: data.barState,
            states_licensed: data.statesLicensed,
            practice_areas: data.practiceAreas,
            years_experience: parseInt(data.yearsExperience),
            hourly_rate: data.hourlyRate ? parseFloat(data.hourlyRate) : null,
            bio: data.bio,
            verified: false,
          });

        if (lawyerError) {
          console.error("Lawyer profile error:", lawyerError);
          toast.error("Error creating lawyer profile");
          return;
        }

        toast.success("Account created! Your profile is pending verification.");
        router.push("/lawyer/dashboard");
        router.refresh();
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Join the Lawyer Network</CardTitle>
        <CardDescription>
          Connect with pre-qualified clients who need your expertise
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
          {/* Personal Information */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Personal Information</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  placeholder="John Doe, Esq."
                  {...register("fullName")}
                  disabled={isLoading}
                />
                {errors.fullName && (
                  <p className="text-sm text-red-500">{errors.fullName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@lawfirm.com"
                  {...register("email")}
                  disabled={isLoading}
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="(555) 555-5555"
                  {...register("phone")}
                  disabled={isLoading}
                />
                {errors.phone && (
                  <p className="text-sm text-red-500">{errors.phone.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="yearsExperience">Years of Experience</Label>
                <Input
                  id="yearsExperience"
                  type="number"
                  placeholder="10"
                  {...register("yearsExperience")}
                  disabled={isLoading}
                />
                {errors.yearsExperience && (
                  <p className="text-sm text-red-500">{errors.yearsExperience.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Bar Information */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Bar Information</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="barNumber">Bar Number</Label>
                <Input
                  id="barNumber"
                  placeholder="123456"
                  {...register("barNumber")}
                  disabled={isLoading}
                />
                {errors.barNumber && (
                  <p className="text-sm text-red-500">{errors.barNumber.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="barState">Primary Bar State</Label>
                <Select
                  onValueChange={(value) => setValue("barState", value as "AZ" | "NV" | "TX")}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATE_OPTIONS.map((state) => (
                      <SelectItem key={state.value} value={state.value}>
                        {state.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.barState && (
                  <p className="text-sm text-red-500">{errors.barState.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* States Licensed */}
          <div>
            <Label className="text-base">States Licensed to Practice</Label>
            <p className="text-sm text-slate-500 mb-3">Select all states where you are licensed</p>
            <div className="flex flex-wrap gap-2">
              {STATE_OPTIONS.map((state) => (
                <Button
                  key={state.value}
                  type="button"
                  variant={selectedStates.includes(state.value) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleState(state.value)}
                  disabled={isLoading}
                  className="gap-1"
                >
                  {selectedStates.includes(state.value) && <CheckCircle className="h-3 w-3" />}
                  {state.label}
                </Button>
              ))}
            </div>
            {errors.statesLicensed && (
              <p className="text-sm text-red-500 mt-2">{errors.statesLicensed.message}</p>
            )}
          </div>

          {/* Practice Areas */}
          <div>
            <Label className="text-base">Practice Areas</Label>
            <p className="text-sm text-slate-500 mb-3">Select your areas of expertise</p>
            <div className="flex flex-wrap gap-2">
              {PRACTICE_AREA_OPTIONS.map((area) => (
                <Button
                  key={area.value}
                  type="button"
                  variant={selectedAreas.includes(area.value) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleArea(area.value)}
                  disabled={isLoading}
                  className="gap-1"
                >
                  {selectedAreas.includes(area.value) && <CheckCircle className="h-3 w-3" />}
                  {area.label}
                </Button>
              ))}
            </div>
            {errors.practiceAreas && (
              <p className="text-sm text-red-500 mt-2">{errors.practiceAreas.message}</p>
            )}
          </div>

          {/* Hourly Rate */}
          <div className="space-y-2">
            <Label htmlFor="hourlyRate">Hourly Rate (optional)</Label>
            <Input
              id="hourlyRate"
              type="number"
              placeholder="250"
              {...register("hourlyRate")}
              disabled={isLoading}
            />
            <p className="text-sm text-slate-500">Your hourly rate in USD</p>
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <Label htmlFor="bio">Professional Bio</Label>
            <Textarea
              id="bio"
              placeholder="Tell potential clients about your experience, specializations, and approach to legal practice..."
              rows={4}
              {...register("bio")}
              disabled={isLoading}
            />
            {errors.bio && (
              <p className="text-sm text-red-500">{errors.bio.message}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Account Security</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  {...register("password")}
                  disabled={isLoading}
                />
                {errors.password && (
                  <p className="text-sm text-red-500">{errors.password.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  {...register("confirmPassword")}
                  disabled={isLoading}
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Lawyer Account
          </Button>
          <p className="text-sm text-slate-500 text-center">
            Your account will be verified by our team before you can accept cases.
          </p>
          <p className="text-sm text-slate-600 text-center">
            Already have an account?{" "}
            <Link href="/login" className="text-emerald-600 hover:underline">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
