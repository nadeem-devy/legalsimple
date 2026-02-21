"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FileText, Users, Shield, MessageSquare, Clock, CheckCircle, ArrowRight,
  Sparkles, Zap, Globe, Lock, Star, ChevronDown, Play, Bot, Gavel, Building2,
  Heart, Car, Home, DollarSign, Award, TrendingUp, Phone, Mail, MapPin
} from "lucide-react";
import { LogoFull, LogoIcon } from "@/components/ui/logo";

const stats = [
  { value: "10,000+", label: "Documents Generated", icon: FileText },
  { value: "98%", label: "Client Satisfaction", icon: Heart },
  { value: "3", label: "States Covered", icon: Globe },
  { value: "24/7", label: "AI Availability", icon: Clock },
];

const testimonials = [
  {
    name: "Sarah Mitchell",
    role: "Phoenix, AZ",
    content: "I was dreading the divorce paperwork, but LegalSimple made it incredibly easy. The AI walked me through every question in plain English. Had my documents ready in under an hour!",
    rating: 5,
    case: "Divorce Filing",
  },
  {
    name: "Marcus Johnson",
    role: "Las Vegas, NV",
    content: "After my car accident, I didn't know where to start. This platform helped me create a professional demand letter that got the insurance company's attention. Settled for $15,000!",
    rating: 5,
    case: "Personal Injury",
  },
  {
    name: "Elena Rodriguez",
    role: "Houston, TX",
    content: "Created my will and power of attorney documents in one evening. The lawyer review option gave me extra peace of mind. Saved thousands compared to traditional law firms.",
    rating: 5,
    case: "Estate Planning",
  },
];

const faqs = [
  {
    q: "Is LegalSimple.ai a law firm?",
    a: "No, we are not a law firm. LegalSimple.ai is a legal document preparation service that uses AI to help you create court-ready documents. For complex cases, we connect you with licensed attorneys in our network."
  },
  {
    q: "Are the documents legally valid?",
    a: "Yes! Our documents are formatted according to each state's court requirements and include all necessary legal language. They are the same forms used by attorneys and accepted by courts in Arizona, Nevada, and Texas."
  },
  {
    q: "How much does it cost?",
    a: "Document generation starts at $29.99 per document. This is a fraction of what traditional law firms charge, which can range from $500 to $5,000 for similar documents."
  },
  {
    q: "What if I need help from a real lawyer?",
    a: "Our platform connects you with licensed attorneys who can review your documents, provide legal advice, or take over your case entirely. You'll see this option when your case complexity requires professional guidance."
  },
  {
    q: "How long does it take to get my documents?",
    a: "Most documents are generated within minutes of completing the AI intake process. The average user completes the entire process in 20-30 minutes and has downloadable documents immediately."
  },
];

const comparisonData = [
  { feature: "Document Preparation", us: "$29.99", lawyer: "$500-2,000", diy: "Free" },
  { feature: "Time to Complete", us: "30 min", lawyer: "1-2 weeks", diy: "Days" },
  { feature: "Court-Ready Format", us: true, lawyer: true, diy: false },
  { feature: "State-Specific Forms", us: true, lawyer: true, diy: false },
  { feature: "24/7 Availability", us: true, lawyer: false, diy: true },
  { feature: "Lawyer Review Option", us: true, lawyer: true, diy: false },
  { feature: "Guided Process", us: true, lawyer: true, diy: false },
];

function AnimatedCounter({ value, duration = 2000 }: { value: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const numericValue = parseInt(value.replace(/[^0-9]/g, "")) || 0;
  const suffix = value.replace(/[0-9,]/g, "");

  useEffect(() => {
    let start = 0;
    const end = numericValue;
    const increment = end / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [numericValue, duration]);

  return <span>{count.toLocaleString()}{suffix}</span>;
}

const chatScript = [
  { role: "ai", content: "Hello! I'm here to help you with your legal matter. What type of issue are you facing today?" },
  { role: "user", content: "I need help filing for divorce in Arizona." },
  { role: "ai", content: "I understand. I'll help you through this process. First, is this an uncontested divorce where both parties agree on the terms?" },
  { role: "user", content: "Yes, we've agreed on everything." },
  { role: "ai", content: "Great, that makes the process simpler. Let me gather some information to prepare your Petition for Dissolution of Marriage..." },
];

function ChatPreview() {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);

  useEffect(() => {
    if (messages.length >= chatScript.length) return;

    const timeout = setTimeout(() => {
      setMessages(prev => {
        if (prev.length < chatScript.length) {
          return [...prev, chatScript[prev.length]];
        }
        return prev;
      });
    }, 2000);

    return () => clearTimeout(timeout);
  }, [messages.length]);

  return (
    <div className="bg-white rounded-2xl shadow-2xl border overflow-hidden max-w-md mx-auto">
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-4 flex items-center gap-3">
        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
          <Bot className="h-6 w-6 text-white" />
        </div>
        <div>
          <p className="text-white font-semibold">LegalSimple AI</p>
          <p className="text-emerald-100 text-sm">Online • Ready to help</p>
        </div>
      </div>
      <div className="p-4 h-72 overflow-y-auto space-y-3 bg-slate-50">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
              msg.role === "user"
                ? "bg-emerald-600 text-white rounded-br-md"
                : "bg-white border shadow-sm rounded-bl-md"
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {messages.length < chatScript.length && (
          <div className="flex justify-start">
            <div className="bg-white border shadow-sm p-3 rounded-2xl rounded-bl-md">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="p-4 border-t bg-white">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 rounded-full border bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <button className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center text-white hover:bg-emerald-700 transition-colors">
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Floating Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />
        <div className="absolute top-40 right-10 w-72 h-72 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute bottom-20 left-1/3 w-72 h-72 bg-emerald-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: "2s" }} />
      </div>

      {/* Header */}
      <header className="relative border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <LogoFull size="sm" />
          <nav className="hidden md:flex items-center gap-8">
            <a href="#how-it-works" className="text-slate-600 hover:text-emerald-600 transition-colors">How It Works</a>
            <a href="#practice-areas" className="text-slate-600 hover:text-emerald-600 transition-colors">Practice Areas</a>
            <a href="#pricing" className="text-slate-600 hover:text-emerald-600 transition-colors">Pricing</a>
            <a href="#faq" className="text-slate-600 hover:text-emerald-600 transition-colors">FAQ</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" className="hidden sm:flex">Sign In</Button>
            </Link>
            <Link href="/register">
              <Button className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg shadow-emerald-500/25">
                Get Started Free
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className={`space-y-8 transition-all duration-1000 ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10"}`}>
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-full px-4 py-2">
                <Sparkles className="h-4 w-4 text-emerald-600" />
                <span className="text-sm font-medium text-emerald-700">AI-Powered Legal Documents</span>
                <Badge variant="secondary" className="bg-emerald-600 text-white text-xs">New</Badge>
              </div>

              <h1 className="text-5xl lg:text-6xl font-bold text-slate-900 leading-tight">
                Legal Documents
                <span className="block bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
                  Made Simple
                </span>
              </h1>

              <p className="text-xl text-slate-600 leading-relaxed max-w-lg">
                Create court-ready legal documents in minutes with our AI assistant.
                No legal jargon. No confusion. Just answer simple questions and get
                professional documents instantly.
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <Link href="/register">
                  <Button size="lg" className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-xl shadow-emerald-500/30 text-lg px-8 py-6 rounded-xl gap-2 group">
                    Start Your Case Free
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="text-lg px-8 py-6 rounded-xl gap-2 border-2">
                  <Play className="h-5 w-5" />
                  Watch Demo
                </Button>
              </div>

              <div className="flex items-center gap-6 pt-4">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 border-2 border-white flex items-center justify-center text-xs font-medium text-slate-600">
                      {String.fromCharCode(64 + i)}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-sm text-slate-600">Trusted by 10,000+ clients</p>
                </div>
              </div>
            </div>

            <div className={`transition-all duration-1000 delay-300 ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10"}`}>
              <ChatPreview />
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
      </section>

      {/* Stats Section */}
      <section className="relative py-16 bg-gradient-to-b from-slate-50 to-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <div key={i} className="text-center group">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/25 group-hover:scale-110 transition-transform">
                  <stat.icon className="h-8 w-8 text-white" />
                </div>
                <p className="text-3xl font-bold text-slate-900 mb-1">
                  <AnimatedCounter value={stat.value} />
                </p>
                <p className="text-slate-600">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-12 border-y bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 text-slate-500">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              <span className="font-medium">256-bit SSL Encryption</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              <span className="font-medium">SOC 2 Compliant</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              <span className="font-medium">State Bar Compliant Forms</span>
            </div>
            <div className="flex items-center gap-2">
              <Gavel className="h-5 w-5" />
              <span className="font-medium">Court-Accepted Documents</span>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge variant="secondary" className="mb-4">Simple Process</Badge>
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Get Your Documents in Three Easy Steps
            </h2>
            <p className="text-xl text-slate-600">
              No appointments, no waiting rooms, no confusing legal forms.
              Just answer simple questions and we do the rest.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                step: "01",
                icon: MessageSquare,
                title: "Chat with AI",
                description: "Tell us about your situation in your own words. Our AI asks simple, clear questions to understand exactly what you need.",
                color: "from-emerald-500 to-teal-500",
              },
              {
                step: "02",
                icon: Zap,
                title: "AI Generates Documents",
                description: "Our AI creates professionally formatted, court-ready documents tailored to your specific situation and jurisdiction.",
                color: "from-teal-500 to-cyan-500",
              },
              {
                step: "03",
                icon: CheckCircle,
                title: "Review & Download",
                description: "Review your documents, make any edits, and download instantly. Connect with a lawyer if you need additional help.",
                color: "from-cyan-500 to-emerald-500",
              },
            ].map((item, i) => (
              <div key={i} className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <Card className="relative bg-white border-2 hover:border-emerald-200 transition-all hover:shadow-xl rounded-3xl overflow-hidden">
                  <CardContent className="p-8">
                    <div className={`w-16 h-16 bg-gradient-to-r ${item.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                      <item.icon className="h-8 w-8 text-white" />
                    </div>
                    <span className="text-6xl font-bold text-slate-100 absolute top-4 right-4">{item.step}</span>
                    <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
                    <p className="text-slate-600 leading-relaxed">{item.description}</p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Practice Areas */}
      <section id="practice-areas" className="py-24 bg-gradient-to-b from-slate-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge variant="secondary" className="mb-4">Practice Areas</Badge>
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Legal Help for Life's Major Moments
            </h2>
            <p className="text-xl text-slate-600">
              We cover the most common legal needs across Arizona, Nevada, and Texas
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                icon: Heart,
                title: "Family Law",
                description: "Navigate family matters with confidence",
                items: ["Divorce & Dissolution", "Child Custody", "Child Support", "Adoption", "Prenuptial Agreements"],
                color: "from-rose-500 to-pink-600",
                bgColor: "bg-rose-50",
              },
              {
                icon: Car,
                title: "Personal Injury",
                description: "Get the compensation you deserve",
                items: ["Car Accidents", "Slip & Fall", "Medical Malpractice", "Workplace Injuries", "Insurance Claims"],
                color: "from-amber-500 to-orange-600",
                bgColor: "bg-amber-50",
              },
              {
                icon: Home,
                title: "Estate Planning",
                description: "Protect your family's future",
                items: ["Last Will & Testament", "Living Trusts", "Power of Attorney", "Healthcare Directives", "Beneficiary Designations"],
                color: "from-emerald-500 to-teal-600",
                bgColor: "bg-emerald-50",
              },
            ].map((area, i) => (
              <Card key={i} className="group hover:shadow-2xl transition-all duration-300 overflow-hidden rounded-3xl border-2 hover:border-transparent">
                <div className={`h-2 bg-gradient-to-r ${area.color}`} />
                <CardContent className="p-8">
                  <div className={`w-16 h-16 ${area.bgColor} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <area.icon className={`h-8 w-8 bg-gradient-to-r ${area.color} bg-clip-text text-transparent`} style={{ WebkitTextStroke: "2px currentColor" }} />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">{area.title}</h3>
                  <p className="text-slate-600 mb-6">{area.description}</p>
                  <ul className="space-y-3">
                    {area.items.map((item, j) => (
                      <li key={j} className="flex items-center gap-3 text-slate-700">
                        <CheckCircle className={`h-5 w-5 bg-gradient-to-r ${area.color} rounded-full p-0.5 text-white`} />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <Link href="/register">
                    <Button className={`w-full mt-8 bg-gradient-to-r ${area.color} hover:opacity-90 rounded-xl`}>
                      Get Started
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* States */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge variant="secondary" className="mb-4">Coverage</Badge>
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Available in Your State
            </h2>
            <p className="text-xl text-slate-600">
              State-specific forms and court requirements for Arizona, Nevada, and Texas
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { name: "Arizona", abbr: "AZ", courts: ["Maricopa Superior Court", "Pima Superior Court", "All County Courts"], color: "from-red-500 to-orange-500" },
              { name: "Nevada", abbr: "NV", courts: ["Clark County District", "Washoe County District", "Family Court Division"], color: "from-emerald-500 to-teal-500" },
              { name: "Texas", abbr: "TX", courts: ["Harris County District", "Dallas County District", "All State Courts"], color: "from-teal-500 to-cyan-500" },
            ].map((state, i) => (
              <Card key={i} className="group text-center hover:shadow-2xl transition-all duration-300 rounded-3xl overflow-hidden border-2 hover:-translate-y-2">
                <CardContent className="p-8">
                  <div className={`w-24 h-24 bg-gradient-to-br ${state.color} rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl group-hover:scale-110 transition-transform`}>
                    <span className="text-4xl font-bold text-white">{state.abbr}</span>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-4">{state.name}</h3>
                  <ul className="space-y-2 text-slate-600">
                    {state.courts.map((court, j) => (
                      <li key={j} className="flex items-center justify-center gap-2">
                        <Building2 className="h-4 w-4 text-slate-400" />
                        {court}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section id="pricing" className="py-24 bg-gradient-to-b from-slate-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge variant="secondary" className="mb-4">Compare</Badge>
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Why Choose LegalSimple.ai?
            </h2>
            <p className="text-xl text-slate-600">
              See how we compare to traditional options
            </p>
          </div>

          <div className="max-w-4xl mx-auto overflow-hidden rounded-3xl border-2 shadow-xl bg-white">
            <div className="grid grid-cols-4 bg-slate-900 text-white p-6">
              <div className="font-semibold">Feature</div>
              <div className="text-center">
                <div className="font-bold text-emerald-400">LegalSimple.ai</div>
                <div className="text-xs text-slate-400">Recommended</div>
              </div>
              <div className="text-center font-semibold">Traditional Lawyer</div>
              <div className="text-center font-semibold">DIY Forms</div>
            </div>
            {comparisonData.map((row, i) => (
              <div key={i} className={`grid grid-cols-4 p-4 items-center ${i % 2 === 0 ? "bg-slate-50" : "bg-white"}`}>
                <div className="font-medium text-slate-900">{row.feature}</div>
                <div className="text-center">
                  {typeof row.us === "boolean" ? (
                    row.us ? <CheckCircle className="h-6 w-6 text-green-500 mx-auto" /> : <span className="text-slate-300">—</span>
                  ) : (
                    <span className="font-bold text-emerald-600">{row.us}</span>
                  )}
                </div>
                <div className="text-center">
                  {typeof row.lawyer === "boolean" ? (
                    row.lawyer ? <CheckCircle className="h-6 w-6 text-green-500 mx-auto" /> : <span className="text-slate-300">—</span>
                  ) : (
                    <span className="text-slate-600">{row.lawyer}</span>
                  )}
                </div>
                <div className="text-center">
                  {typeof row.diy === "boolean" ? (
                    row.diy ? <CheckCircle className="h-6 w-6 text-green-500 mx-auto" /> : <span className="text-slate-300">—</span>
                  ) : (
                    <span className="text-slate-600">{row.diy}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge variant="secondary" className="mb-4">Testimonials</Badge>
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Trusted by Thousands
            </h2>
            <p className="text-xl text-slate-600">
              Real stories from real clients who got the help they needed
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonials.map((testimonial, i) => (
              <Card key={i} className="group hover:shadow-2xl transition-all duration-300 rounded-3xl overflow-hidden">
                <CardContent className="p-8">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, j) => (
                      <Star key={j} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-slate-700 mb-6 leading-relaxed">&ldquo;{testimonial.content}&rdquo;</p>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{testimonial.name}</p>
                      <p className="text-sm text-slate-500">{testimonial.role}</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="mt-4">{testimonial.case}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 bg-gradient-to-b from-slate-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge variant="secondary" className="mb-4">FAQ</Badge>
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-slate-600">
              Everything you need to know about LegalSimple.ai
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="border-2 rounded-2xl overflow-hidden bg-white hover:border-emerald-200 transition-colors"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full p-6 text-left flex items-center justify-between gap-4"
                >
                  <span className="font-semibold text-slate-900">{faq.q}</span>
                  <ChevronDown className={`h-5 w-5 text-slate-400 transition-transform ${openFaq === i ? "rotate-180" : ""}`} />
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-6">
                    <p className="text-slate-600 leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For Lawyers CTA */}
      <section className="py-24 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-500 rounded-full blur-3xl" />
        </div>
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center text-white">
            <Badge variant="secondary" className="mb-4 bg-white/10 text-white border-white/20">For Attorneys</Badge>
            <h2 className="text-4xl font-bold mb-6">Are You a Lawyer?</h2>
            <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
              Join our network to receive pre-qualified leads with organized case files.
              Focus on practicing law, not chasing clients.
            </p>
            <div className="grid md:grid-cols-4 gap-6 mb-12">
              {[
                { icon: TrendingUp, label: "Pre-qualified Leads" },
                { icon: FileText, label: "Organized Case Files" },
                { icon: MessageSquare, label: "Secure Messaging" },
                { icon: DollarSign, label: "Integrated Billing" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-center gap-3 text-slate-300">
                  <item.icon className="h-5 w-5 text-emerald-400" />
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
            <Link href="/register/lawyer">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-6 rounded-xl gap-2">
                Join the Lawyer Network
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.05%22%3E%3Cpath d=%22M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center text-white">
            <h2 className="text-5xl font-bold mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-emerald-100 mb-10 max-w-xl mx-auto">
              Join thousands who have simplified their legal journey.
              Create your first document in minutes.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link href="/register">
                <Button size="lg" variant="secondary" className="text-lg px-10 py-7 rounded-xl gap-2 shadow-2xl group">
                  Start Your Free Case
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
            <p className="text-emerald-200 mt-6 text-sm">
              No credit card required • Free to start • Cancel anytime
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-5 gap-12 mb-12">
            <div className="md:col-span-2">
              <div className="mb-4">
                <LogoFull size="md" darkMode />
              </div>
              <p className="mb-6 leading-relaxed">
                AI-powered legal document preparation for everyone.
                Making justice accessible, one document at a time.
              </p>
              <div className="flex items-center gap-4">
                <a href="#" className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-slate-700 transition-colors">
                  <Globe className="h-5 w-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-slate-700 transition-colors">
                  <Mail className="h-5 w-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-slate-700 transition-colors">
                  <Phone className="h-5 w-5" />
                </a>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Practice Areas</h4>
              <ul className="space-y-3">
                <li><a href="#" className="hover:text-white transition-colors">Family Law</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Personal Injury</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Estate Planning</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">States</h4>
              <ul className="space-y-3">
                <li><a href="#" className="hover:text-white transition-colors">Arizona</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Nevada</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Texas</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-3">
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Disclaimer</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Portals</h4>
              <ul className="space-y-3">
                <li><Link href="/lawyer/dashboard" className="hover:text-white transition-colors">Lawyer Dashboard</Link></li>
                <li><Link href="/admin/dashboard" className="hover:text-white transition-colors">Admin Dashboard</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
              <p>
                LegalSimple.ai is not a law firm and does not provide legal advice.
                We provide self-help document preparation services.
              </p>
              <p>&copy; {new Date().getFullYear()} LegalSimple.ai. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
