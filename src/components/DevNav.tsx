"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, Scale, Shield, Home, X } from "lucide-react";
import { LogoIcon } from "@/components/ui/logo";
import { useState } from "react";

export function DevNav() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(true);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-50 bg-slate-900 text-white p-3 rounded-full shadow-lg hover:bg-slate-800 transition-colors"
      >
        <LogoIcon size="sm" darkMode />
      </button>
    );
  }

  const navItems = [
    { href: "/", label: "Landing", icon: Home },
    { href: "/dashboard", label: "Client Dashboard", icon: User },
    { href: "/cases", label: "Client Cases", icon: User },
    { href: "/chat", label: "AI Chat", icon: User },
    { href: "/lawyer/dashboard", label: "Lawyer Dashboard", icon: Scale },
    { href: "/lawyer/cases", label: "Lawyer Cases", icon: Scale },
    { href: "/admin/dashboard", label: "Admin Dashboard", icon: Shield },
    { href: "/admin/lawyers", label: "Admin Lawyers", icon: Shield },
    { href: "/admin/docspring-mapping", label: "DocSpring Mapping", icon: Shield },
  ];

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white border-2 border-slate-200 rounded-2xl shadow-2xl p-4 w-64">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Dev Mode</span>
        </div>
        <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600">
          <X className="h-4 w-4" />
        </button>
      </div>
      <nav className="space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? "bg-emerald-50 text-emerald-700 font-medium"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-3 pt-3 border-t text-xs text-slate-400 text-center">
        Supabase not configured
      </div>
    </div>
  );
}
