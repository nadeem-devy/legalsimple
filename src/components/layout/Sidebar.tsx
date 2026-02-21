"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LogOut, ChevronLeft, ChevronRight, Menu,
  LayoutDashboard, MessageSquare, FolderOpen, FileText, Settings,
  HelpCircle, Store, Users, DollarSign, Briefcase, BarChart3, Shield,
  FileInput, FileCode, Mail, LucideIcon
} from "lucide-react";
import { LogoIcon, LogoFull } from "@/components/ui/logo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState, useMemo, useEffect } from "react";
import { useMessageNotifications } from "@/hooks/useMessageNotifications";

// Icon mapping for serialization across server/client boundary
const iconMap: Record<string, LucideIcon> = {
  LayoutDashboard,
  MessageSquare,
  FolderOpen,
  FileText,
  Settings,
  HelpCircle,
  Store,
  Users,
  DollarSign,
  Briefcase,
  BarChart3,
  Shield,
  FileInput,
  FileCode,
  Mail,
};

interface NavItem {
  name: string;
  href: string;
  icon: string; // Icon name instead of component
  badge?: string;
}

interface SidebarProps {
  navigation: NavItem[];
  userRole: "client" | "lawyer" | "admin";
  userName?: string;
  userEmail?: string;
  userInitial?: string;
  verified?: boolean;
  children: React.ReactNode;
}

export function Sidebar({
  navigation,
  userRole,
  userName,
  userEmail,
  userInitial,
  verified = true,
  children,
}: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const { unreadCount: liveUnread, newMessageAlert } = useMessageNotifications();

  // Suppress badge + notification when already on the messages page
  const onMessagesPage = pathname === "/messages" || pathname.startsWith("/messages/")
    || pathname === "/lawyer/messages" || pathname.startsWith("/lawyer/messages/");

  // Dismiss notification when navigating to messages page
  useEffect(() => {
    if (onMessagesPage) setNotification(null);
  }, [onMessagesPage]);

  // Show in-app notification banner when new messages arrive (not on messages page)
  useEffect(() => {
    if (newMessageAlert === 0 || onMessagesPage) return;
    setNotification("You have a new message");
    const timer = setTimeout(() => setNotification(null), 5000);
    return () => clearTimeout(timer);
  }, [newMessageAlert, onMessagesPage]);

  // Merge server-side badge with live polled unread count
  // Hide badge entirely when user is on the messages page
  const liveNavigation = useMemo(() => {
    if (onMessagesPage) {
      return navigation.map((item) =>
        item.name === "Messages" ? { ...item, badge: undefined } : item
      );
    }
    if (liveUnread === null) return navigation;
    if (liveUnread <= 0) {
      return navigation.map((item) =>
        item.name === "Messages" ? { ...item, badge: undefined } : item
      );
    }
    return navigation.map((item) =>
      item.name === "Messages"
        ? { ...item, badge: String(liveUnread) }
        : item
    );
  }, [navigation, liveUnread, onMessagesPage]);

  const roleColors = {
    client: {
      bg: "bg-white",
      border: "border-slate-200",
      text: "text-slate-900",
      accent: "bg-emerald-600",
      accentHover: "hover:bg-emerald-700",
      badge: "bg-emerald-100 text-emerald-700",
      navActive: "bg-emerald-50 text-emerald-700 border-l-emerald-600",
      navHover: "hover:bg-slate-50",
      mainBg: "bg-slate-50",
    },
    lawyer: {
      bg: "bg-white",
      border: "border-slate-200",
      text: "text-slate-900",
      accent: "bg-emerald-600",
      accentHover: "hover:bg-emerald-700",
      badge: "bg-emerald-100 text-emerald-700",
      navActive: "bg-emerald-50 text-emerald-700 border-l-emerald-600",
      navHover: "hover:bg-slate-50",
      mainBg: "bg-slate-50",
    },
    admin: {
      bg: "bg-slate-900",
      border: "border-slate-700",
      text: "text-white",
      accent: "bg-emerald-600",
      accentHover: "hover:bg-emerald-700",
      badge: "bg-emerald-600 text-white",
      navActive: "bg-slate-800 text-white border-l-emerald-500",
      navHover: "hover:bg-slate-800",
      mainBg: "bg-slate-950",
    },
  };

  const colors = roleColors[userRole];
  const isAdmin = userRole === "admin";

  return (
    <div className={`min-h-screen ${colors.mainBg}`}>
      {/* Mobile Header */}
      <div className={`lg:hidden fixed top-0 left-0 right-0 z-50 ${colors.bg} border-b ${colors.border} px-4 py-3`}>
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <LogoFull size="sm" darkMode={isAdmin} />
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(!mobileOpen)}
            className={isAdmin ? "text-white hover:bg-slate-800" : ""}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full transition-all duration-300",
          colors.bg,
          "border-r",
          colors.border,
          collapsed ? "w-20" : "w-64",
          "lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className={cn("p-4 border-b", colors.border)}>
            <Link href="/" className="flex items-center gap-2">
              {collapsed ? (
                <LogoIcon size="md" darkMode={isAdmin} />
              ) : (
                <div className="flex items-center gap-2">
                  <LogoFull size="sm" darkMode={isAdmin} />
                  <Badge className={cn("text-xs", colors.badge)}>
                    {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
                  </Badge>
                </div>
              )}
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {liveNavigation.map((item) => {
              const isActive = pathname === item.href || (pathname.startsWith(item.href + "/") && item.href !== "/dashboard" && item.href !== "/lawyer/dashboard" && item.href !== "/admin/dashboard");
              const Icon = iconMap[item.icon] || LayoutDashboard;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all border-l-4",
                    isActive
                      ? cn(colors.navActive, "border-l-4")
                      : cn(`${isAdmin ? "text-slate-400" : "text-slate-600"} ${colors.navHover}`, "border-l-transparent"),
                    collapsed && "justify-center px-2"
                  )}
                >
                  <span className="relative">
                    <Icon className={cn("h-5 w-5 flex-shrink-0", isActive && !isAdmin && "text-emerald-600")} />
                    {collapsed && item.badge && (
                      <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-white" />
                    )}
                  </span>
                  {!collapsed && (
                    <span className="font-medium">{item.name}</span>
                  )}
                  {!collapsed && item.badge && (
                    <Badge variant="secondary" className="ml-auto text-xs bg-red-100 text-red-700">
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Verification Badge */}
          {userRole === "lawyer" && !verified && !collapsed && (
            <div className="px-4 pb-2">
              <Badge variant="outline" className="w-full justify-center text-amber-600 border-amber-300 py-1">
                Pending Verification
              </Badge>
            </div>
          )}

          {/* User Section */}
          <div className={cn("p-4 border-t", colors.border)}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start gap-3 px-2",
                    isAdmin ? "text-white hover:bg-slate-800" : "hover:bg-slate-100",
                    collapsed && "justify-center"
                  )}
                >
                  <Avatar className="h-9 w-9 flex-shrink-0">
                    <AvatarFallback
                      className={cn(
                        userRole === "admin" ? "bg-emerald-600 text-white" : "bg-emerald-100 text-emerald-600"
                      )}
                    >
                      {userInitial || "U"}
                    </AvatarFallback>
                  </Avatar>
                  {!collapsed && (
                    <div className="text-left overflow-hidden">
                      <p className={`text-sm font-medium truncate ${colors.text}`}>{userName}</p>
                      <p className={`text-xs truncate ${isAdmin ? "text-slate-400" : "text-slate-500"}`}>
                        {userEmail}
                      </p>
                    </div>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{userName}</p>
                  <p className="text-xs text-slate-500">{userEmail}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <form action="/api/auth/signout" method="POST" className="w-full">
                    <button type="submit" className="flex items-center cursor-pointer w-full px-2 py-1.5 text-sm">
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </button>
                  </form>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Collapse Button */}
          <div className={cn("p-4 border-t hidden lg:block", colors.border)}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCollapsed(!collapsed)}
              className={cn(
                "w-full",
                isAdmin ? "text-slate-400 hover:text-white hover:bg-slate-800" : ""
              )}
            >
              {collapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <>
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Collapse
                </>
              )}
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={cn(
          "transition-all duration-300 pt-16 lg:pt-0 h-screen flex flex-col",
          collapsed ? "lg:ml-20" : "lg:ml-64"
        )}
      >
        <div className="p-6 lg:p-8 flex-1 min-h-0 overflow-auto">
          {children}
        </div>
      </main>

      {/* New Message Notification Banner */}
      {notification && (
        <div
          className="fixed top-4 right-4 z-[100] animate-in slide-in-from-top-2 fade-in duration-300"
          onClick={() => setNotification(null)}
        >
          <div className="bg-white border border-slate-200 shadow-lg rounded-lg px-4 py-3 flex items-center gap-3 cursor-pointer hover:shadow-xl transition-shadow">
            <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <MessageSquare className="h-4 w-4 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900">{notification}</p>
              <p className="text-xs text-slate-500">Click to dismiss</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
