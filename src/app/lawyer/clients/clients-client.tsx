"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Search,
  Users,
  MapPin,
  MessageSquare,
  FolderOpen,
  ArrowUpRight,
  TrendingUp,
} from "lucide-react";

interface ClientData {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  state: string | null;
  total_cases: number;
  active_cases: number;
  status: "active" | "inactive";
}

const avatarColors = [
  "bg-rose-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-violet-500",
  "bg-cyan-500",
  "bg-pink-500",
  "bg-indigo-500",
  "bg-teal-500",
];

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return avatarColors[Math.abs(hash) % avatarColors.length];
}

function getInitials(name: string | null): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function ClientsClient({ clients }: { clients: ClientData[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");

  const filteredClients = clients.filter((client) => {
    const matchesSearch =
      searchQuery === "" ||
      (client.full_name || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || client.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const activeClients = clients.filter((c) => c.status === "active").length;
  const totalCases = clients.reduce((acc, c) => acc + c.total_cases, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="h-6 w-6 text-violet-500" />
            Clients
          </h1>
          <p className="text-slate-600 mt-1">Manage your client relationships and cases</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-violet-500 to-purple-600 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-violet-100 text-sm">Total Clients</p>
                <p className="text-2xl font-bold">{clients.length}</p>
              </div>
              <Users className="h-8 w-8 text-violet-200" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Active Clients</p>
                <p className="text-2xl font-bold">{activeClients}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-200" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-500 to-cyan-600 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-sm">Total Cases</p>
                <p className="text-2xl font-bold">{totalCases}</p>
              </div>
              <FolderOpen className="h-8 w-8 text-emerald-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search clients by name..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button variant={filterStatus === "all" ? "default" : "outline"} size="sm" onClick={() => setFilterStatus("all")}>
            All
          </Button>
          <Button variant={filterStatus === "active" ? "default" : "outline"} size="sm" onClick={() => setFilterStatus("active")}>
            Active
          </Button>
          <Button variant={filterStatus === "inactive" ? "default" : "outline"} size="sm" onClick={() => setFilterStatus("inactive")}>
            Inactive
          </Button>
        </div>
      </div>

      {/* Clients Grid */}
      {filteredClients.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <Users className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No clients found</h3>
            <p className="text-slate-500">Try adjusting your search or filters</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-2">
          {filteredClients.map((client) => {
            const name = client.full_name || "Unknown";
            const color = getAvatarColor(name);

            return (
              <Card key={client.id} className="hover:shadow-md transition-all duration-200">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className={`${color} text-white text-xs font-semibold`}>
                          {getInitials(client.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-sm font-semibold text-slate-900">{name}</h3>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          {client.state && (
                            <span className="flex items-center gap-0.5">
                              <MapPin className="h-3 w-3" />
                              {client.state}
                            </span>
                          )}
                          <span>{client.total_cases} case{client.total_cases !== 1 ? "s" : ""}</span>
                          {client.active_cases > 0 && (
                            <Badge variant="secondary" className="bg-green-100 text-green-700 text-[10px] px-1.5 py-0">
                              {client.active_cases} active
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                        <Link href={`/lawyer/messages?client=${client.id}`}>
                          <MessageSquare className="h-3.5 w-3.5 text-slate-400" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                        <Link href={`/lawyer/cases?client=${client.id}`}>
                          <ArrowUpRight className="h-3.5 w-3.5 text-slate-400" />
                        </Link>
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
