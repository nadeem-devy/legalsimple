"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Users,
  Search,
  RefreshCw,
  Loader2,
  Eye,
  MoreHorizontal,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  UserCog,
  Scale,
  Briefcase,
  Ban,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

interface User {
  id: string;
  email: string;
  full_name: string;
  phone?: string | null;
  role: "client" | "lawyer" | "admin";
  state?: string | null;
  avatar_url?: string | null;
  created_at: string;
  last_sign_in?: string | null;
  total_cases: number;
  status: "active" | "suspended";
}

const roleConfig: Record<
  string,
  { label: string; color: string; icon: React.ReactNode }
> = {
  client: {
    label: "Client",
    color: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
    icon: <Users className="h-3 w-3" />,
  },
  lawyer: {
    label: "Lawyer",
    color: "bg-purple-500/20 text-purple-400 border border-purple-500/30",
    icon: <Scale className="h-3 w-3" />,
  },
  admin: {
    label: "Admin",
    color: "bg-red-500/20 text-red-400 border border-red-500/30",
    icon: <Shield className="h-3 w-3" />,
  },
};

export default function AdminUsersPage() {
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [newRole, setNewRole] = useState<string>("");
  const [isActionLoading, setIsActionLoading] = useState(false);

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/users");
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to fetch users");
      }
      const data = await res.json();
      setUsers(data.users);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load users";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    loadUsers();
  }, [loadUsers]);

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setIsDetailOpen(true);
  };

  const handleChangeRole = (user: User) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setIsRoleDialogOpen(true);
  };

  const confirmRoleChange = async () => {
    if (!selectedUser || !newRole || newRole === selectedUser.role) return;

    setIsActionLoading(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUser.id,
          action: "change_role",
          value: newRole,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update role");
      }

      setUsers((prev) =>
        prev.map((u) =>
          u.id === selectedUser.id
            ? { ...u, role: newRole as User["role"] }
            : u
        )
      );

      toast.success(
        `${selectedUser.full_name}'s role changed to ${roleConfig[newRole]?.label}`
      );
      setIsRoleDialogOpen(false);
      setSelectedUser(null);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to change role"
      );
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleToggleStatus = async (user: User) => {
    const newStatus = user.status === "active" ? "suspend" : "reactivate";

    setIsActionLoading(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          action: "toggle_status",
          value: newStatus,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update status");
      }

      setUsers((prev) =>
        prev.map((u) =>
          u.id === user.id
            ? {
                ...u,
                status:
                  user.status === "active"
                    ? ("suspended" as const)
                    : ("active" as const),
              }
            : u
        )
      );

      toast.success(
        newStatus === "suspend"
          ? `${user.full_name}'s account has been suspended`
          : `${user.full_name}'s account has been reactivated`
      );
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update status"
      );
    } finally {
      setIsActionLoading(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    const matchesStatus = statusFilter === "all" || u.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const stats = {
    total: users.length,
    clients: users.filter((u) => u.role === "client").length,
    lawyers: users.filter((u) => u.role === "lawyer").length,
    admins: users.filter((u) => u.role === "admin").length,
  };

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Users</h1>
          <p className="text-slate-400">Manage user accounts and roles</p>
        </div>
        <Button variant="outline" onClick={loadUsers} disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800/80 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-400">
                  Total Users
                </p>
                <p className="text-3xl font-bold text-white mt-1">
                  {stats.total}
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-slate-700/50 flex items-center justify-center">
                <Users className="h-6 w-6 text-slate-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/80 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-400">Clients</p>
                <p className="text-3xl font-bold text-emerald-400 mt-1">
                  {stats.clients}
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <Briefcase className="h-6 w-6 text-emerald-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/80 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-400">Lawyers</p>
                <p className="text-3xl font-bold text-purple-400 mt-1">
                  {stats.lawyers}
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Scale className="h-6 w-6 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/80 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-400">Admins</p>
                <p className="text-3xl font-bold text-red-400 mt-1">
                  {stats.admins}
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-red-500/10 flex items-center justify-center">
                <Shield className="h-6 w-6 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-slate-800/80 border-slate-700">
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[250px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500"
                />
              </div>
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[150px] bg-slate-900/50 border-slate-600 text-white">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="client">Client</SelectItem>
                <SelectItem value="lawyer">Lawyer</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px] bg-slate-900/50 border-slate-600 text-white">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="bg-slate-800/80 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-lg">All Users</CardTitle>
          <CardDescription className="text-slate-400">
            {filteredUsers.length} user
            {filteredUsers.length !== 1 ? "s" : ""} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-500 mx-auto mb-3" />
                <p className="text-sm text-slate-400">Loading users...</p>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">
                Failed to Load Users
              </h3>
              <p className="text-slate-400 mb-4">{error}</p>
              <Button variant="outline" onClick={loadUsers}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-16">
              <Users className="h-12 w-12 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">
                No Users Found
              </h3>
              <p className="text-slate-400">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="rounded-lg border border-slate-700 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-700 bg-slate-900/50 hover:bg-slate-900/50">
                    <TableHead className="text-slate-300 font-semibold py-3">
                      User
                    </TableHead>
                    <TableHead className="text-slate-300 font-semibold py-3">
                      Role
                    </TableHead>
                    <TableHead className="text-slate-300 font-semibold py-3">
                      State
                    </TableHead>
                    <TableHead className="text-slate-300 font-semibold py-3 text-center">
                      Cases
                    </TableHead>
                    <TableHead className="text-slate-300 font-semibold py-3">
                      Status
                    </TableHead>
                    <TableHead className="text-slate-300 font-semibold py-3">
                      Joined
                    </TableHead>
                    <TableHead className="text-slate-300 font-semibold py-3">
                      Last Active
                    </TableHead>
                    <TableHead className="text-slate-300 font-semibold py-3 text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow
                      key={user.id}
                      className="border-slate-700/50 hover:bg-slate-700/30 transition-colors"
                    >
                      {/* User */}
                      <TableCell className="py-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 ring-2 ring-slate-700">
                            <AvatarFallback className="bg-slate-700 text-white text-sm font-medium">
                              {user.full_name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="font-medium text-white truncate">
                              {user.full_name}
                            </p>
                            <p className="text-sm text-slate-400 truncate">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      {/* Role */}
                      <TableCell>
                        <Badge
                          className={`${roleConfig[user.role]?.color} font-medium`}
                        >
                          {roleConfig[user.role]?.icon}
                          <span className="ml-1">
                            {roleConfig[user.role]?.label}
                          </span>
                        </Badge>
                      </TableCell>

                      {/* State */}
                      <TableCell>
                        {user.state ? (
                          <Badge
                            variant="outline"
                            className="border-slate-600 text-slate-300 font-medium"
                          >
                            {user.state}
                          </Badge>
                        ) : (
                          <span className="text-slate-500">—</span>
                        )}
                      </TableCell>

                      {/* Cases */}
                      <TableCell className="text-center">
                        <span className="text-white font-medium">
                          {user.total_cases}
                        </span>
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        {user.status === "active" ? (
                          <Badge className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Active
                          </Badge>
                        ) : (
                          <Badge className="bg-red-500/15 text-red-400 border border-red-500/30">
                            <Ban className="h-3 w-3 mr-1" />
                            Suspended
                          </Badge>
                        )}
                      </TableCell>

                      {/* Joined */}
                      <TableCell className="text-slate-300 text-sm">
                        {format(new Date(user.created_at), "MMM d, yyyy")}
                      </TableCell>

                      {/* Last Active */}
                      <TableCell className="text-slate-300 text-sm">
                        {user.last_sign_in
                          ? format(
                              new Date(user.last_sign_in),
                              "MMM d, h:mm a"
                            )
                          : "—"}
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-slate-400 hover:text-white hover:bg-slate-700"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="bg-slate-800 border-slate-700"
                          >
                            <DropdownMenuItem
                              onClick={() => handleViewUser(user)}
                              className="text-slate-300 focus:text-white focus:bg-slate-700"
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleChangeRole(user)}
                              className="text-slate-300 focus:text-white focus:bg-slate-700"
                            >
                              <UserCog className="h-4 w-4 mr-2" />
                              Change Role
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-slate-700" />
                            <DropdownMenuItem
                              onClick={() => handleToggleStatus(user)}
                              disabled={isActionLoading}
                              className={
                                user.status === "active"
                                  ? "text-red-400 focus:text-red-300 focus:bg-red-500/10"
                                  : "text-emerald-400 focus:text-emerald-300 focus:bg-emerald-500/10"
                              }
                            >
                              {user.status === "active" ? (
                                <>
                                  <Ban className="h-4 w-4 mr-2" />
                                  Suspend User
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Reactivate User
                                </>
                              )}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-lg bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Profile
            </DialogTitle>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 ring-2 ring-slate-600">
                  <AvatarFallback className="bg-slate-700 text-white text-xl font-medium">
                    {selectedUser.full_name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold text-white">
                    {selectedUser.full_name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={roleConfig[selectedUser.role]?.color}>
                      {roleConfig[selectedUser.role]?.icon}
                      <span className="ml-1">
                        {roleConfig[selectedUser.role]?.label}
                      </span>
                    </Badge>
                    {selectedUser.status === "active" ? (
                      <Badge className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        Active
                      </Badge>
                    ) : (
                      <Badge className="bg-red-500/15 text-red-400 border border-red-500/30">
                        Suspended
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-slate-900/50 border border-slate-700">
                <div>
                  <p className="text-sm text-slate-500 flex items-center gap-1.5 mb-1">
                    <Mail className="h-3 w-3" /> Email
                  </p>
                  <p className="font-medium text-white text-sm">
                    {selectedUser.email}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 flex items-center gap-1.5 mb-1">
                    <Phone className="h-3 w-3" /> Phone
                  </p>
                  <p className="font-medium text-white text-sm">
                    {selectedUser.phone || "Not provided"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 flex items-center gap-1.5 mb-1">
                    <MapPin className="h-3 w-3" /> State
                  </p>
                  <p className="font-medium text-white text-sm">
                    {selectedUser.state || "Not specified"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 flex items-center gap-1.5 mb-1">
                    <Briefcase className="h-3 w-3" /> Total Cases
                  </p>
                  <p className="font-medium text-white text-sm">
                    {selectedUser.total_cases}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 flex items-center gap-1.5 mb-1">
                    <Calendar className="h-3 w-3" /> Joined
                  </p>
                  <p className="font-medium text-white text-sm">
                    {format(
                      new Date(selectedUser.created_at),
                      "MMM d, yyyy"
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">Last Active</p>
                  <p className="font-medium text-white text-sm">
                    {selectedUser.last_sign_in
                      ? format(
                          new Date(selectedUser.last_sign_in),
                          "MMM d, yyyy 'at' h:mm a"
                        )
                      : "Never"}
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setIsDetailOpen(false)}
                  className="border-slate-600 text-slate-300"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Change Role Dialog */}
      <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
        <DialogContent className="bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">Change User Role</DialogTitle>
            <DialogDescription className="text-slate-400">
              Update role for {selectedUser?.full_name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">
                Select New Role
              </label>
              <Select value={newRole} onValueChange={setNewRole}>
                <SelectTrigger className="bg-slate-900/50 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="client">Client</SelectItem>
                  <SelectItem value="lawyer">Lawyer</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <p className="text-sm text-amber-400">
                Changing a user&apos;s role will affect their access to features
                and permissions immediately.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRoleDialogOpen(false)}
              className="border-slate-600 text-slate-300"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmRoleChange}
              disabled={isActionLoading || newRole === selectedUser?.role}
            >
              {isActionLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : null}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
