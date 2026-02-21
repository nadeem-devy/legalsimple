"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Settings,
  User,
  Bell,
  Shield,
  CreditCard,
  Scale,
  Mail,
  Phone,
  Camera,
  Save,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Smartphone,
  Lock,
  Key,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ProfileData {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  state: string | null;
}

interface LawyerProfileData {
  id: string;
  user_id: string;
  bar_number: string;
  bar_state: string;
  verified: boolean;
  practice_areas: string[];
  states_licensed: string[];
  hourly_rate: number | null;
  years_experience: number | null;
  bio: string | null;
  availability_status: string;
}

export function SettingsClient({
  profile: initialProfile,
  lawyerProfile: initialLawyerProfile,
}: {
  profile: ProfileData;
  lawyerProfile: LawyerProfileData;
}) {
  const [profile, setProfile] = useState(initialProfile);
  const [lawyerProfile, setLawyerProfile] = useState(initialLawyerProfile);
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [notifications, setNotifications] = useState({
    email_new_case: true,
    email_messages: true,
    email_payments: true,
    push_new_case: true,
    push_messages: true,
  });

  async function handleSaveProfile() {
    setSaving(true);
    setSaveSuccess(false);
    try {
      const res = await fetch(`/api/lawyers/${lawyerProfile.user_id}/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile: {
            full_name: profile.full_name,
            phone: profile.phone,
          },
          lawyer_profile: {
            bar_number: lawyerProfile.bar_number,
            bar_state: lawyerProfile.bar_state,
            practice_areas: lawyerProfile.practice_areas,
            states_licensed: lawyerProfile.states_licensed,
            hourly_rate: lawyerProfile.hourly_rate,
            years_experience: lawyerProfile.years_experience,
            bio: lawyerProfile.bio,
            availability_status: lawyerProfile.availability_status,
          },
        }),
      });
      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch {
      // Handle error
    } finally {
      setSaving(false);
    }
  }

  const initials = (profile.full_name || "L")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Settings className="h-6 w-6 text-violet-500" />
          Settings
        </h1>
        <p className="text-slate-600 mt-1">Manage your account settings and preferences</p>
      </div>

      {saveSuccess && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 border border-green-200 text-green-700">
          <CheckCircle2 className="h-4 w-4" />
          <span className="text-sm font-medium">Settings saved successfully</span>
        </div>
      )}

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:w-auto lg:inline-grid">
          <TabsTrigger value="profile" className="gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="practice" className="gap-2">
            <Scale className="h-4 w-4" />
            <span className="hidden sm:inline">Practice</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your personal details and public profile</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <Avatar className="h-20 w-20">
                  <AvatarFallback className="bg-violet-500 text-white text-2xl">{initials}</AvatarFallback>
                </Avatar>
                <div>
                  <Button variant="outline" className="gap-2">
                    <Camera className="h-4 w-4" />
                    Change Photo
                  </Button>
                  <p className="text-xs text-slate-500 mt-2">JPG, PNG or GIF. Max 2MB.</p>
                </div>
              </div>

              <Separator />

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    value={profile.full_name || ""}
                    onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input id="email" value={profile.email || ""} disabled className="pl-10 bg-slate-50" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="phone"
                      className="pl-10"
                      value={profile.phone || ""}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Professional Bio</Label>
                <textarea
                  id="bio"
                  className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={lawyerProfile.bio || ""}
                  onChange={(e) => setLawyerProfile({ ...lawyerProfile, bio: e.target.value })}
                />
              </div>

              <div className="flex justify-end">
                <Button className="gap-2" onClick={handleSaveProfile} disabled={saving}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Practice Tab */}
        <TabsContent value="practice" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Bar Information</CardTitle>
                  <CardDescription>Your bar registration and verification status</CardDescription>
                </div>
                {lawyerProfile.verified ? (
                  <Badge className="bg-green-100 text-green-700 gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Verified
                  </Badge>
                ) : (
                  <Badge className="bg-amber-100 text-amber-700 gap-1">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Pending
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="bar_number">Bar Number</Label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="bar_number"
                      className="pl-10"
                      value={lawyerProfile.bar_number}
                      onChange={(e) => setLawyerProfile({ ...lawyerProfile, bar_number: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bar_state">Bar State</Label>
                  <Select
                    value={lawyerProfile.bar_state}
                    onValueChange={(value) => setLawyerProfile({ ...lawyerProfile, bar_state: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AZ">Arizona</SelectItem>
                      <SelectItem value="NV">Nevada</SelectItem>
                      <SelectItem value="TX">Texas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <Label>States Licensed</Label>
                <div className="flex flex-wrap gap-2">
                  {lawyerProfile.states_licensed.map((state) => (
                    <Badge key={state} variant="secondary" className="px-3 py-1">
                      {state}
                    </Badge>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <Label>Practice Areas</Label>
                <div className="flex flex-wrap gap-2">
                  {lawyerProfile.practice_areas.map((area) => (
                    <Badge key={area} className="bg-violet-100 text-violet-700 px-3 py-1">
                      {area.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                    </Badge>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="hourly_rate">Hourly Rate ($)</Label>
                  <Input
                    id="hourly_rate"
                    type="number"
                    value={lawyerProfile.hourly_rate || ""}
                    onChange={(e) => setLawyerProfile({ ...lawyerProfile, hourly_rate: Number(e.target.value) || null })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="experience">Years of Experience</Label>
                  <Input
                    id="experience"
                    type="number"
                    value={lawyerProfile.years_experience || ""}
                    onChange={(e) => setLawyerProfile({ ...lawyerProfile, years_experience: Number(e.target.value) || null })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="availability">Availability Status</Label>
                <Select
                  value={lawyerProfile.availability_status}
                  onValueChange={(value) => setLawyerProfile({ ...lawyerProfile, availability_status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="busy">Busy</SelectItem>
                    <SelectItem value="unavailable">Unavailable</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end">
                <Button className="gap-2" onClick={handleSaveProfile} disabled={saving}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Email Notifications</CardTitle>
              <CardDescription>Choose what updates you receive via email</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-100">
                    <Scale className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">New Case Assignments</p>
                    <p className="text-sm text-slate-500">Get notified when you receive a new case</p>
                  </div>
                </div>
                <Switch
                  checked={notifications.email_new_case}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, email_new_case: checked })}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-violet-100">
                    <Mail className="h-4 w-4 text-violet-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">Client Messages</p>
                    <p className="text-sm text-slate-500">Get notified when clients send messages</p>
                  </div>
                </div>
                <Switch
                  checked={notifications.email_messages}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, email_messages: checked })}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-100">
                    <CreditCard className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">Payment Updates</p>
                    <p className="text-sm text-slate-500">Get notified about payments and earnings</p>
                  </div>
                </div>
                <Switch
                  checked={notifications.email_payments}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, email_payments: checked })}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Push Notifications</CardTitle>
              <CardDescription>Manage mobile and desktop notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-100">
                    <Smartphone className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">New Case Alerts</p>
                    <p className="text-sm text-slate-500">Push notifications for new cases</p>
                  </div>
                </div>
                <Switch
                  checked={notifications.push_new_case}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, push_new_case: checked })}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-violet-100">
                    <Bell className="h-4 w-4 text-violet-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">Message Alerts</p>
                    <p className="text-sm text-slate-500">Push notifications for new messages</p>
                  </div>
                </div>
                <Switch
                  checked={notifications.push_messages}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, push_messages: checked })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Password</CardTitle>
              <CardDescription>Change your account password</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current_password">Current Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="current_password"
                    type={showPassword ? "text" : "password"}
                    className="pl-10 pr-10"
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="new_password">New Password</Label>
                  <Input id="new_password" type="password" placeholder="Enter new password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm_password">Confirm Password</Label>
                  <Input id="confirm_password" type="password" placeholder="Confirm new password" />
                </div>
              </div>
              <div className="flex justify-end">
                <Button className="gap-2">
                  <Key className="h-4 w-4" />
                  Update Password
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Two-Factor Authentication</CardTitle>
              <CardDescription>Add an extra layer of security to your account</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-100">
                    <Shield className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">Two-Factor Authentication</p>
                    <p className="text-sm text-slate-500">Secure your account with 2FA</p>
                  </div>
                </div>
                <Button variant="outline">Enable 2FA</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
