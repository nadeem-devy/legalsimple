"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Search,
  Star,
  MapPin,
  ArrowRight,
  Shield,
  Briefcase,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PRACTICE_AREAS } from "@/config/practice-areas";

interface LawyerProfile {
  id: string;
  user_id: string;
  bar_number: string;
  bar_state: string;
  verified: boolean;
  practice_areas: string[];
  states_licensed: string[];
  hourly_rate: number | null;
  bio: string | null;
  years_experience: number | null;
  availability_status: string;
  rating: number;
  total_cases: number;
  cover_gradient?: string;
  profile: {
    full_name: string | null;
    email: string;
    avatar_url?: string | null;
  } | null;
}

function RatingStars({ rating }: { rating: number }) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.5;

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={cn(
            "h-3.5 w-3.5",
            i < fullStars
              ? "text-amber-400 fill-amber-400"
              : i === fullStars && hasHalf
              ? "text-amber-400 fill-amber-200"
              : "text-slate-200 fill-slate-200"
          )}
        />
      ))}
    </div>
  );
}

function getPracticeAreaName(code: string) {
  return (
    PRACTICE_AREAS[code as keyof typeof PRACTICE_AREAS]?.name ||
    code.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
  );
}

// Map Tailwind gradient class names to inline CSS
const gradientMap: Record<string, string> = {
  "from-blue-600 via-indigo-600 to-purple-700":
    "linear-gradient(135deg, #2563eb, #4f46e5, #7c3aed)",
  "from-emerald-600 via-teal-600 to-cyan-700":
    "linear-gradient(135deg, #059669, #0d9488, #0e7490)",
  "from-amber-500 via-orange-600 to-red-600":
    "linear-gradient(135deg, #f59e0b, #ea580c, #dc2626)",
  "from-rose-500 via-pink-600 to-fuchsia-700":
    "linear-gradient(135deg, #f43f5e, #db2777, #a21caf)",
  "from-slate-600 via-gray-700 to-zinc-800":
    "linear-gradient(135deg, #475569, #374151, #27272a)",
  "from-violet-600 via-purple-600 to-indigo-700":
    "linear-gradient(135deg, #7c3aed, #9333ea, #4338ca)",
  "from-sky-600 via-blue-600 to-indigo-700":
    "linear-gradient(135deg, #0284c7, #2563eb, #4338ca)",
  "from-emerald-500 via-green-600 to-teal-700":
    "linear-gradient(135deg, #10b981, #16a34a, #0f766e)",
};

export default function LawyersPage() {
  const router = useRouter();
  const [lawyers, setLawyers] = useState<LawyerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("all");

  useEffect(() => {
    const loadLawyers = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/lawyers");
        if (response.ok) {
          const data = await response.json();
          if (data.lawyers) {
            setLawyers(data.lawyers);
          }
        }
      } catch (error) {
        console.error("Error loading lawyers:", error);
      } finally {
        setLoading(false);
      }
    };
    loadLawyers();
  }, []);

  const filteredLawyers = lawyers.filter((lawyer) => {
    const name = lawyer.profile?.full_name || "";
    const matchesSearch =
      !searchQuery ||
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (lawyer.bio || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      lawyer.practice_areas.some((a) =>
        getPracticeAreaName(a).toLowerCase().includes(searchQuery.toLowerCase())
      );
    const matchesFilter =
      activeFilter === "all" || lawyer.practice_areas.includes(activeFilter);
    return matchesSearch && matchesFilter;
  });

  // Loading skeleton
  if (loading) {
    return (
      <div className="space-y-8">
        <div className="rounded-2xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 p-8 sm:p-12">
          <div className="h-8 bg-white/20 rounded w-2/3 mb-3 animate-pulse" />
          <div className="h-5 bg-white/10 rounded w-1/2 mb-8 animate-pulse" />
          <div className="h-14 bg-white/20 rounded-xl animate-pulse" />
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="rounded-2xl border overflow-hidden animate-pulse"
            >
              <div className="h-28 bg-slate-200" />
              <div className="p-5 pt-10 relative">
                <div className="absolute -top-8 left-5 w-16 h-16 rounded-xl bg-slate-300 border-4 border-white" />
                <div className="h-5 bg-slate-200 rounded w-2/3 mb-2" />
                <div className="h-3 bg-slate-100 rounded w-1/2 mb-4" />
                <div className="h-8 bg-slate-50 rounded-lg w-full mb-3" />
                <div className="h-10 bg-slate-100 rounded-xl w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero Search Section */}
      <div className="rounded-2xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 p-8 sm:p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="relative">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
            Find Your Perfect Lawyer
          </h1>
          <p className="text-emerald-100 text-lg mb-8">
            Connect with verified attorneys who specialize in your legal needs
          </p>

          <div className="relative">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input
              placeholder="Search by name, specialty, or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-14 pl-14 pr-6 text-lg rounded-xl border-0 shadow-lg bg-white focus-visible:ring-2 focus-visible:ring-white/50"
            />
          </div>

          <div className="flex flex-wrap gap-2 mt-5">
            <button
              onClick={() => setActiveFilter("all")}
              className={cn(
                "px-4 py-1.5 rounded-full text-sm font-medium transition-all",
                activeFilter === "all"
                  ? "bg-white text-emerald-700 shadow-md"
                  : "bg-white/15 text-white hover:bg-white/25"
              )}
            >
              All Lawyers
            </button>
            {Object.values(PRACTICE_AREAS).map((area) => (
              <button
                key={area.code}
                onClick={() =>
                  setActiveFilter(
                    activeFilter === area.code ? "all" : area.code
                  )
                }
                className={cn(
                  "px-4 py-1.5 rounded-full text-sm font-medium transition-all",
                  activeFilter === area.code
                    ? "bg-white text-emerald-700 shadow-md"
                    : "bg-white/15 text-white hover:bg-white/25"
                )}
              >
                {area.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-slate-500">
          <span className="font-semibold text-slate-900">
            {filteredLawyers.length}
          </span>{" "}
          {filteredLawyers.length === 1 ? "lawyer" : "lawyers"} available
        </p>
      </div>

      {/* Lawyer Cards */}
      {filteredLawyers.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-5">
            <Search className="h-10 w-10 text-slate-300" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">
            No lawyers found
          </h3>
          <p className="text-slate-500 max-w-md mx-auto mb-6">
            {lawyers.length === 0
              ? "No lawyers are currently available. Please check back later."
              : "Try adjusting your search or clearing the filters."}
          </p>
          {lawyers.length > 0 && (
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery("");
                setActiveFilter("all");
              }}
            >
              Clear Filters
            </Button>
          )}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredLawyers.map((lawyer) => {
            const coverBg =
              lawyer.cover_gradient && gradientMap[lawyer.cover_gradient]
                ? gradientMap[lawyer.cover_gradient]
                : "linear-gradient(135deg, #059669, #0d9488, #0e7490)";

            return (
              <Card
                key={lawyer.id}
                className="group relative hover:shadow-xl transition-all duration-300 cursor-pointer rounded-2xl border-slate-200/80 hover:border-emerald-300 overflow-hidden bg-white"
                onClick={() => router.push(`/lawyers/${lawyer.id}`)}
              >
                <CardContent className="p-0">
                  {/* Cover image area */}
                  <div
                    className="h-28 relative overflow-hidden"
                    style={{ background: coverBg }}
                  >
                    {/* Decorative circles */}
                    <div className="absolute top-2 right-4 w-16 h-16 border border-white/15 rounded-full" />
                    <div className="absolute -bottom-3 -left-3 w-20 h-20 border border-white/10 rounded-full" />

                    {/* Rate badge */}
                    {lawyer.hourly_rate && (
                      <div className="absolute top-3 right-3 bg-black/20 backdrop-blur-sm text-white text-xs font-bold px-2.5 py-1 rounded-lg">
                        ${lawyer.hourly_rate}/hr
                      </div>
                    )}

                    {/* Availability dot */}
                    <div className="absolute top-3 left-3">
                      <div
                        className={cn(
                          "w-2.5 h-2.5 rounded-full ring-2 ring-white/30",
                          lawyer.availability_status === "available"
                            ? "bg-emerald-400"
                            : "bg-amber-400"
                        )}
                      />
                    </div>
                  </div>

                  {/* Profile photo overlapping cover */}
                  <div className="relative px-5 pb-5">
                    <div className="absolute -top-9 left-5">
                      <div className="w-[72px] h-[72px] rounded-xl border-4 border-white shadow-lg overflow-hidden bg-white">
                        {lawyer.profile?.avatar_url ? (
                          <img
                            src={lawyer.profile.avatar_url}
                            alt={lawyer.profile?.full_name || "Lawyer"}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-2xl font-bold">
                            {(lawyer.profile?.full_name || "L").charAt(0)}
                          </div>
                        )}
                      </div>
                      {lawyer.verified && (
                        <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
                          <Shield className="h-[16px] w-[16px] text-emerald-500 fill-emerald-100" />
                        </div>
                      )}
                    </div>

                    {/* Content below photo */}
                    <div className="pt-12">
                      {/* Name + Rating */}
                      <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                        {lawyer.profile?.full_name || "Attorney"}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-1">
                        <RatingStars rating={lawyer.rating} />
                        <span className="text-sm font-semibold text-slate-700">
                          {lawyer.rating}
                        </span>
                        <span className="text-xs text-slate-400">
                          ({lawyer.total_cases} cases)
                        </span>
                      </div>

                      {/* Quick info row */}
                      <div className="flex items-center gap-3 mt-3 text-xs text-slate-400">
                        {lawyer.years_experience && (
                          <span className="flex items-center gap-1">
                            <Briefcase className="h-3 w-3" />
                            {lawyer.years_experience} yrs
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {lawyer.states_licensed.join(", ")}
                        </span>
                      </div>

                      {/* Practice area badges */}
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {lawyer.practice_areas.map((area) => (
                          <Badge
                            key={area}
                            variant="secondary"
                            className="bg-slate-50 text-slate-600 border border-slate-100 text-[11px] font-medium px-2 py-0.5"
                          >
                            {getPracticeAreaName(area)}
                          </Badge>
                        ))}
                      </div>

                      {/* View Profile Button */}
                      <Button
                        className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 rounded-xl h-10 text-sm font-semibold gap-2 shadow-sm hover:shadow-md transition-all"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/lawyers/${lawyer.id}`);
                        }}
                      >
                        View Profile
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
