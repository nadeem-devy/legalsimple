"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Star,
  Shield,
  MapPin,
  Briefcase,
  DollarSign,
  ArrowLeft,
  MessageCircle,
  FileUp,
  CheckCircle2,
  Clock,
  Scale,
  Award,
  GraduationCap,
  Users,
  ThumbsUp,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { PRACTICE_AREAS } from "@/config/practice-areas";
import { QuickChatSheet } from "@/components/chat/QuickChatSheet";

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

interface CaseItem {
  id: string;
  case_number: string;
  case_type: string;
  status: string;
}

function RatingStars({
  rating,
  size = "sm",
}: {
  rating: number;
  size?: "sm" | "md" | "lg";
}) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.5;
  const starSize =
    size === "lg" ? "h-6 w-6" : size === "md" ? "h-5 w-5" : "h-4 w-4";

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={cn(
            starSize,
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

// Cover gradient map - Tailwind classes can't be dynamic so we use inline styles
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

// Dummy reviews keyed by lawyer ID
const DEMO_REVIEWS: Record<
  string,
  {
    id: string;
    author: string;
    avatar: string;
    rating: number;
    date: string;
    text: string;
    helpful: number;
    case_type: string;
  }[]
> = {
  "lawyer-001": [
    {
      id: "rev-001",
      author: "Maria S.",
      avatar: "https://i.pravatar.cc/80?img=44",
      rating: 5,
      date: "2025-12-15",
      text: "Sarah made my divorce process so much less stressful. She was always available to answer questions and fought hard for a fair settlement. I couldn't have asked for a better attorney.",
      helpful: 12,
      case_type: "Divorce",
    },
    {
      id: "rev-002",
      author: "Thomas R.",
      avatar: "https://i.pravatar.cc/80?img=60",
      rating: 5,
      date: "2025-11-03",
      text: "Highly recommend Sarah for any estate planning needs. She explained everything clearly and made sure all my documents were properly drafted. Very thorough and professional.",
      helpful: 8,
      case_type: "Estate Planning",
    },
    {
      id: "rev-003",
      author: "Linda K.",
      avatar: "https://i.pravatar.cc/80?img=32",
      rating: 4,
      date: "2025-09-22",
      text: "Great experience overall. Sarah handled my custody case with care and sensitivity. The process took a bit longer than expected but the outcome was excellent.",
      helpful: 5,
      case_type: "Child Custody",
    },
  ],
  "lawyer-002": [
    {
      id: "rev-004",
      author: "Jason P.",
      avatar: "https://i.pravatar.cc/80?img=57",
      rating: 5,
      date: "2025-12-20",
      text: "Michael got me a settlement that was way more than I expected. He was aggressive in negotiations and kept me informed every step of the way. Best PI lawyer in Nevada.",
      helpful: 18,
      case_type: "Auto Accident",
    },
    {
      id: "rev-005",
      author: "Amanda W.",
      avatar: "https://i.pravatar.cc/80?img=41",
      rating: 5,
      date: "2025-10-11",
      text: "After my workplace injury, Michael took my case and handled everything. I didn't have to worry about a thing. Settled for $320K. Truly exceptional lawyer.",
      helpful: 14,
      case_type: "Workplace Injury",
    },
  ],
  "lawyer-003": [
    {
      id: "rev-006",
      author: "Kevin T.",
      avatar: "https://i.pravatar.cc/80?img=52",
      rating: 5,
      date: "2025-11-28",
      text: "Robert helped me set up my LLC and operating agreement. His business knowledge is outstanding. He anticipated issues I hadn't even thought about. Worth every penny.",
      helpful: 9,
      case_type: "LLC Formation",
    },
    {
      id: "rev-007",
      author: "Susan M.",
      avatar: "https://i.pravatar.cc/80?img=29",
      rating: 4,
      date: "2025-08-14",
      text: "Solid work on my estate plan. Robert was methodical and thorough. He made sure my trust was set up correctly and explained the tax implications clearly.",
      helpful: 6,
      case_type: "Trust & Estate",
    },
  ],
  "lawyer-004": [
    {
      id: "rev-008",
      author: "Carlos D.",
      avatar: "https://i.pravatar.cc/80?img=14",
      rating: 5,
      date: "2025-12-02",
      text: "Emily was incredible during my custody battle. She was compassionate but fierce when it mattered. My kids are safe and that's all that matters. She's the best.",
      helpful: 22,
      case_type: "Child Custody",
    },
    {
      id: "rev-009",
      author: "Rachel H.",
      avatar: "https://i.pravatar.cc/80?img=20",
      rating: 5,
      date: "2025-10-30",
      text: "Went through a difficult divorce and Emily guided me through every step. Bilingual services were a huge plus for communicating with my family. Highly recommend!",
      helpful: 15,
      case_type: "Divorce",
    },
    {
      id: "rev-010",
      author: "Mark F.",
      avatar: "https://i.pravatar.cc/80?img=51",
      rating: 5,
      date: "2025-09-05",
      text: "Emily handled our adoption case with so much heart and professionalism. The process went smoothly and she made our family complete. We are forever grateful.",
      helpful: 19,
      case_type: "Adoption",
    },
  ],
  "lawyer-005": [
    {
      id: "rev-011",
      author: "Derek N.",
      avatar: "https://i.pravatar.cc/80?img=55",
      rating: 5,
      date: "2025-11-15",
      text: "James handled both my car accident claim and later my divorce. Having one lawyer who knows my full situation was invaluable. Great results on both cases.",
      helpful: 10,
      case_type: "Auto Accident",
    },
    {
      id: "rev-012",
      author: "Tina L.",
      avatar: "https://i.pravatar.cc/80?img=25",
      rating: 4,
      date: "2025-07-20",
      text: "Good lawyer but hard to reach sometimes due to his busy schedule. When he's on your case though, he delivers. Got a solid settlement for my injury claim.",
      helpful: 7,
      case_type: "Personal Injury",
    },
  ],
  "lawyer-006": [
    {
      id: "rev-013",
      author: "George W.",
      avatar: "https://i.pravatar.cc/80?img=59",
      rating: 5,
      date: "2025-12-08",
      text: "Patricia is the estate planning expert you want. She set up a comprehensive plan for my family including trusts, powers of attorney, and healthcare directives. Exceptional attention to detail.",
      helpful: 11,
      case_type: "Estate Planning",
    },
    {
      id: "rev-014",
      author: "Barbara C.",
      avatar: "https://i.pravatar.cc/80?img=24",
      rating: 5,
      date: "2025-10-01",
      text: "Went through probate with Patricia's guidance after losing my mother. She was empathetic and efficient. Made a difficult time much more manageable.",
      helpful: 16,
      case_type: "Probate",
    },
  ],
  "lawyer-007": [
    {
      id: "rev-015",
      author: "Steve B.",
      avatar: "https://i.pravatar.cc/80?img=61",
      rating: 5,
      date: "2025-11-20",
      text: "David's corporate background really shows. He structured my partnership agreement perfectly and caught potential issues that could have cost us down the road. Top-tier business lawyer.",
      helpful: 13,
      case_type: "Partnership Agreement",
    },
    {
      id: "rev-016",
      author: "Nancy A.",
      avatar: "https://i.pravatar.cc/80?img=36",
      rating: 4,
      date: "2025-08-25",
      text: "Solid personal injury representation. David got a fair settlement for my slip-and-fall case. His rates are higher but you get what you pay for in quality.",
      helpful: 4,
      case_type: "Slip & Fall",
    },
  ],
  "lawyer-008": [
    {
      id: "rev-017",
      author: "William H.",
      avatar: "https://i.pravatar.cc/80?img=68",
      rating: 5,
      date: "2025-12-18",
      text: "Jennifer is worth every dollar. She handled my complex divorce involving properties in three states and a business. Her multi-state license was crucial. Absolute pro.",
      helpful: 25,
      case_type: "Complex Divorce",
    },
    {
      id: "rev-018",
      author: "Patricia M.",
      avatar: "https://i.pravatar.cc/80?img=38",
      rating: 5,
      date: "2025-11-05",
      text: "Five stars isn't enough. Jennifer managed my personal injury case alongside my estate planning. Her breadth of knowledge is remarkable. The best lawyer I've ever worked with.",
      helpful: 20,
      case_type: "Personal Injury",
    },
    {
      id: "rev-019",
      author: "Robert L.",
      avatar: "https://i.pravatar.cc/80?img=62",
      rating: 5,
      date: "2025-09-15",
      text: "Jennifer's reputation is well-deserved. She negotiated a settlement that exceeded our expectations. Her 25 years of experience really show in how she handles complex matters.",
      helpful: 17,
      case_type: "Estate Planning",
    },
  ],
};

export default function LawyerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [lawyer, setLawyer] = useState<LawyerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Submit document dialog
  const [showSubmitDoc, setShowSubmitDoc] = useState(false);
  const [userCases, setUserCases] = useState<CaseItem[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState("");
  const [clientMessage, setClientMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Chat sheet
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    const loadLawyer = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/lawyers/${params.id}`);
        if (response.ok) {
          const data = await response.json();
          if (data.lawyer) {
            setLawyer(data.lawyer);
          }
        }
      } catch (error) {
        console.error("Error loading lawyer:", error);
      } finally {
        setLoading(false);
      }
    };
    if (params.id) loadLawyer();
  }, [params.id]);

  useEffect(() => {
    if (showSubmitDoc) {
      const loadCases = async () => {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          const { data } = await supabase
            .from("cases")
            .select("*")
            .eq("client_id", user.id)
            .order("created_at", { ascending: false });
          setUserCases((data as CaseItem[]) || []);
        }
      };
      loadCases();
      setSelectedCaseId("");
      setClientMessage("");
      setSubmitSuccess(false);
    }
  }, [showSubmitDoc]);

  const handleSubmitDoc = async () => {
    if (!selectedCaseId || !lawyer) return;
    setSubmitting(true);
    try {
      const response = await fetch("/api/lawyers/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          case_id: selectedCaseId,
          lawyer_id: lawyer.user_id,
          client_message: clientMessage || null,
        }),
      });
      if (response.ok) {
        setSubmitSuccess(true);
      }
    } catch (error) {
      console.error("Error submitting:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const coverBg =
    lawyer?.cover_gradient && gradientMap[lawyer.cover_gradient]
      ? gradientMap[lawyer.cover_gradient]
      : "linear-gradient(135deg, #059669, #0d9488, #0e7490)";

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-56 rounded-2xl bg-slate-200 animate-pulse" />
        <div className="flex gap-6 -mt-16 px-8">
          <div className="w-32 h-32 rounded-2xl bg-slate-300 animate-pulse border-4 border-white" />
          <div className="pt-20 flex-1">
            <div className="h-7 bg-slate-200 rounded w-1/3 mb-3 animate-pulse" />
            <div className="h-4 bg-slate-100 rounded w-1/4 animate-pulse" />
          </div>
        </div>
        <div className="grid md:grid-cols-4 gap-4 px-8">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-24 rounded-xl bg-slate-100 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!lawyer) {
    return (
      <div className="text-center py-20">
        <Scale className="h-16 w-16 text-slate-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          Lawyer Not Found
        </h2>
        <p className="text-slate-500 mb-6">
          This lawyer profile doesn&apos;t exist or has been removed.
        </p>
        <Button variant="outline" onClick={() => router.push("/lawyers")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Lawyers
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Back button */}
      <Button
        variant="ghost"
        size="sm"
        className="text-slate-500 hover:text-slate-900 -ml-2"
        onClick={() => router.push("/lawyers")}
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to Lawyers
      </Button>

      {/* Cover + Profile Header */}
      <div className="relative rounded-2xl overflow-hidden shadow-lg">
        {/* Cover image area */}
        <div
          className="h-52 relative"
          style={{ background: coverBg }}
        >
          {/* Decorative pattern overlay */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-6 right-10 w-32 h-32 border-2 border-white rounded-full" />
            <div className="absolute top-16 right-32 w-20 h-20 border border-white rounded-full" />
            <div className="absolute bottom-4 left-10 w-24 h-24 border border-white rounded-full" />
          </div>
          {/* Availability badge */}
          <div className="absolute top-5 right-5">
            <Badge
              className={cn(
                "text-sm px-3 py-1 font-medium",
                lawyer.availability_status === "available"
                  ? "bg-white/20 text-white backdrop-blur-sm border-white/30"
                  : "bg-amber-500/20 text-amber-100 backdrop-blur-sm border-amber-300/30"
              )}
            >
              <div
                className={cn(
                  "w-2 h-2 rounded-full mr-2",
                  lawyer.availability_status === "available"
                    ? "bg-emerald-400"
                    : "bg-amber-400"
                )}
              />
              {lawyer.availability_status === "available"
                ? "Available"
                : "Busy"}
            </Badge>
          </div>
        </div>

        {/* Profile info overlapping cover */}
        <div className="bg-white px-8 pb-6 pt-0 relative">
          {/* Avatar */}
          <div className="absolute -top-16 left-8">
            <div className="w-32 h-32 rounded-2xl border-4 border-white shadow-xl overflow-hidden bg-white">
              {lawyer.profile?.avatar_url ? (
                <img
                  src={lawyer.profile.avatar_url}
                  alt={lawyer.profile?.full_name || "Lawyer"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-4xl font-bold">
                  {(lawyer.profile?.full_name || "L").charAt(0)}
                </div>
              )}
            </div>
            {lawyer.verified && (
              <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-md">
                <Shield className="h-6 w-6 text-emerald-500 fill-emerald-100" />
              </div>
            )}
          </div>

          {/* Name + meta info */}
          <div className="pl-40 pt-3">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  {lawyer.profile?.full_name || "Attorney"}
                </h1>
                <p className="text-slate-500 mt-0.5">
                  {lawyer.bar_state} Bar #{lawyer.bar_number}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <RatingStars rating={lawyer.rating} size="md" />
                  <span className="text-lg font-bold text-slate-800">
                    {lawyer.rating}
                  </span>
                  <span className="text-sm text-slate-400">
                    ({lawyer.total_cases} cases handled)
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="gap-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50 rounded-xl h-11 px-5"
                  onClick={() => setShowChat(true)}
                >
                  <MessageCircle className="h-4 w-4" />
                  Chat
                </Button>
                <Button
                  className="gap-2 bg-emerald-600 hover:bg-emerald-700 rounded-xl h-11 px-5 shadow-md"
                  onClick={() => setShowSubmitDoc(true)}
                >
                  <FileUp className="h-4 w-4" />
                  Submit Document for Review
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="rounded-xl border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="rounded-xl bg-emerald-50 p-2.5">
              <DollarSign className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-900">
                {lawyer.hourly_rate ? `$${lawyer.hourly_rate}` : "N/A"}
              </p>
              <p className="text-xs text-slate-400">Per Hour</p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="rounded-xl bg-blue-50 p-2.5">
              <Briefcase className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-900">
                {lawyer.years_experience || "N/A"}
              </p>
              <p className="text-xs text-slate-400">Years Experience</p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="rounded-xl bg-purple-50 p-2.5">
              <Users className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-900">
                {lawyer.total_cases}
              </p>
              <p className="text-xs text-slate-400">Cases Handled</p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="rounded-xl bg-amber-50 p-2.5">
              <MapPin className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-900">
                {lawyer.states_licensed.length}
              </p>
              <p className="text-xs text-slate-400">
                {lawyer.states_licensed.join(", ")}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main content - two columns */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Left column - About & Details */}
        <div className="md:col-span-2 space-y-6">
          {/* About */}
          <Card className="rounded-xl shadow-sm">
            <CardContent className="p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-slate-400" />
                About
              </h2>
              <p className="text-slate-600 leading-relaxed whitespace-pre-line">
                {lawyer.bio}
              </p>
            </CardContent>
          </Card>

          {/* Practice Areas */}
          <Card className="rounded-xl shadow-sm">
            <CardContent className="p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Scale className="h-5 w-5 text-slate-400" />
                Practice Areas
              </h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {lawyer.practice_areas.map((area) => (
                  <div
                    key={area}
                    className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100"
                  >
                    <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                      <Scale className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800 text-sm">
                        {getPracticeAreaName(area)}
                      </p>
                      <p className="text-xs text-slate-400">Verified</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Licensed States */}
          <Card className="rounded-xl shadow-sm">
            <CardContent className="p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Award className="h-5 w-5 text-slate-400" />
                Licensed States
              </h2>
              <div className="flex flex-wrap gap-3">
                {lawyer.states_licensed.map((state) => (
                  <div
                    key={state}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-100"
                  >
                    <MapPin className="h-4 w-4 text-emerald-500" />
                    <span className="font-semibold text-slate-700">
                      {state}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Client Reviews */}
          <Card className="rounded-xl shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-slate-400" />
                  Client Reviews
                </h2>
                <div className="flex items-center gap-2 bg-amber-50 px-3 py-1.5 rounded-lg">
                  <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                  <span className="text-sm font-bold text-amber-700">
                    {lawyer.rating}
                  </span>
                  <span className="text-xs text-amber-500">
                    ({(DEMO_REVIEWS[lawyer.id] || []).length} reviews)
                  </span>
                </div>
              </div>

              {/* Rating breakdown bar */}
              <div className="space-y-1.5 mb-6">
                {[5, 4, 3, 2, 1].map((stars) => {
                  const reviews = DEMO_REVIEWS[lawyer.id] || [];
                  const count = reviews.filter(
                    (r) => Math.floor(r.rating) === stars
                  ).length;
                  const percent =
                    reviews.length > 0
                      ? (count / reviews.length) * 100
                      : 0;
                  return (
                    <div key={stars} className="flex items-center gap-2">
                      <span className="text-xs text-slate-500 w-3 text-right">
                        {stars}
                      </span>
                      <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-400 rounded-full transition-all"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-400 w-6">
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Reviews list */}
              <div className="space-y-5">
                {(DEMO_REVIEWS[lawyer.id] || []).map((review) => (
                  <div
                    key={review.id}
                    className="border border-slate-100 rounded-xl p-4 hover:border-slate-200 transition-colors"
                  >
                    {/* Review header */}
                    <div className="flex items-start gap-3">
                      <img
                        src={review.avatar}
                        alt={review.author}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-bold text-slate-900">
                            {review.author}
                          </h4>
                          <span className="text-xs text-slate-400">
                            {new Date(review.date).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              }
                            )}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <div className="flex gap-0.5">
                            {Array.from({ length: 5 }, (_, i) => (
                              <Star
                                key={i}
                                className={cn(
                                  "h-3 w-3",
                                  i < review.rating
                                    ? "text-amber-400 fill-amber-400"
                                    : "text-slate-200 fill-slate-200"
                                )}
                              />
                            ))}
                          </div>
                          <Badge
                            variant="secondary"
                            className="bg-slate-50 text-slate-500 text-[10px] px-1.5 py-0"
                          >
                            {review.case_type}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Review text */}
                    <p className="text-sm text-slate-600 leading-relaxed mt-3">
                      {review.text}
                    </p>

                    {/* Review footer */}
                    <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-50">
                      <button className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-emerald-600 transition-colors">
                        <ThumbsUp className="h-3.5 w-3.5" />
                        Helpful ({review.helpful})
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {(DEMO_REVIEWS[lawyer.id] || []).length === 0 && (
                <div className="text-center py-8">
                  <MessageSquare className="h-10 w-10 text-slate-200 mx-auto mb-3" />
                  <p className="text-sm text-slate-400">
                    No reviews yet for this lawyer.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right column - Sidebar actions */}
        <div className="space-y-5">
          {/* Quick contact card */}
          <Card className="rounded-xl shadow-sm border-emerald-100 bg-gradient-to-b from-emerald-50/50 to-white">
            <CardContent className="p-5 space-y-4">
              <h3 className="font-bold text-slate-900">Get in Touch</h3>

              <Button
                variant="outline"
                className="w-full justify-start gap-3 h-12 rounded-xl border-slate-200 hover:bg-emerald-50 hover:border-emerald-200"
                onClick={() => setShowChat(true)}
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <MessageCircle className="h-4 w-4 text-emerald-600" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-slate-800">
                    Chat Now
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Send a direct message
                  </p>
                </div>
              </Button>

              <Button
                className="w-full justify-start gap-3 h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 shadow-md"
                onClick={() => setShowSubmitDoc(true)}
              >
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                  <FileUp className="h-4 w-4 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold">
                    Submit Document for Review
                  </p>
                  <p className="text-[10px] text-emerald-200">
                    Get professional review
                  </p>
                </div>
              </Button>
            </CardContent>
          </Card>

          {/* Key info card */}
          <Card className="rounded-xl shadow-sm">
            <CardContent className="p-5 space-y-3">
              <h3 className="font-bold text-slate-900">Quick Info</h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <span className="text-sm text-slate-500">Hourly Rate</span>
                  <span className="text-sm font-bold text-slate-900">
                    {lawyer.hourly_rate ? `$${lawyer.hourly_rate}/hr` : "N/A"}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <span className="text-sm text-slate-500">Experience</span>
                  <span className="text-sm font-bold text-slate-900">
                    {lawyer.years_experience} years
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <span className="text-sm text-slate-500">Bar State</span>
                  <span className="text-sm font-bold text-slate-900">
                    {lawyer.bar_state}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <span className="text-sm text-slate-500">Cases</span>
                  <span className="text-sm font-bold text-slate-900">
                    {lawyer.total_cases}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-slate-500">Status</span>
                  <Badge
                    className={cn(
                      "text-xs",
                      lawyer.availability_status === "available"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-700"
                    )}
                  >
                    {lawyer.availability_status === "available"
                      ? "Available"
                      : "Busy"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Response time card */}
          <Card className="rounded-xl shadow-sm">
            <CardContent className="p-5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">
                  Responds within 24 hours
                </p>
                <p className="text-xs text-slate-400">
                  Average response time
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Submit Document Dialog */}
      <Dialog open={showSubmitDoc} onOpenChange={setShowSubmitDoc}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              Submit Document to{" "}
              {lawyer?.profile?.full_name || "Attorney"}
            </DialogTitle>
            <DialogDescription>
              Select a case to submit for review. The lawyer will review your
              documents and respond with feedback.
            </DialogDescription>
          </DialogHeader>

          {submitSuccess ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Document Submitted!
              </h3>
              <p className="text-slate-500">
                The lawyer will review your documents and respond within 24
                hours.
              </p>
              <Button
                className="mt-6 bg-emerald-600 hover:bg-emerald-700 rounded-xl"
                onClick={() => setShowSubmitDoc(false)}
              >
                Done
              </Button>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Select Case
                  </label>
                  <Select
                    value={selectedCaseId}
                    onValueChange={setSelectedCaseId}
                  >
                    <SelectTrigger className="mt-1.5 rounded-lg">
                      <SelectValue placeholder="Choose a case..." />
                    </SelectTrigger>
                    <SelectContent>
                      {userCases.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.case_number} - {getPracticeAreaName(c.case_type)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {userCases.length === 0 && (
                    <p className="text-sm text-slate-500 mt-1.5">
                      No cases found.{" "}
                      <Link
                        href="/chat"
                        className="text-emerald-600 font-medium hover:underline"
                      >
                        Start a new case
                      </Link>{" "}
                      first.
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Message (optional)
                  </label>
                  <Textarea
                    className="mt-1.5 rounded-lg"
                    placeholder="Describe what you need reviewed..."
                    value={clientMessage}
                    onChange={(e) => setClientMessage(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>

              <DialogFooter className="mt-4">
                <Button
                  variant="outline"
                  className="rounded-lg"
                  onClick={() => setShowSubmitDoc(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-emerald-600 hover:bg-emerald-700 rounded-lg gap-2"
                  disabled={!selectedCaseId || submitting}
                  onClick={handleSubmitDoc}
                >
                  <FileUp className="h-4 w-4" />
                  {submitting ? "Submitting..." : "Submit for Review"}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Quick Chat Sheet */}
      <QuickChatSheet
        open={showChat}
        onOpenChange={setShowChat}
        lawyerId={lawyer.id}
        lawyerUserId={lawyer.user_id}
        lawyerName={lawyer.profile?.full_name || "Attorney"}
        lawyerAvatar={lawyer.profile?.avatar_url}
        lawyerVerified={lawyer.verified}
      />
    </div>
  );
}
