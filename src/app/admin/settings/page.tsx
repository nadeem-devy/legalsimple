"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  Settings,
  Shield,
  Bell,
  Globe,
  Database,
  Mail,
  CreditCard,
  FileText,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Save,
  RefreshCw,
} from "lucide-react";

export default function AdminSettingsPage() {
  const [mounted, setMounted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // General Settings
  const [generalSettings, setGeneralSettings] = useState({
    siteName: "LegalSimple.ai",
    supportEmail: "support@legalsimple.ai",
    maintenanceMode: false,
    allowNewRegistrations: true,
  });

  // Notification Settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    newCaseAlerts: true,
    lawyerVerificationAlerts: true,
    documentGenerationAlerts: true,
    paymentAlerts: true,
  });

  // Integration Status
  const [integrations, setIntegrations] = useState({
    supabase: { configured: false, status: "checking" },
    docspring: { configured: false, status: "checking" },
    stripe: { configured: false, status: "checking" },
    anthropic: { configured: false, status: "checking" },
  });

  useEffect(() => {
    setMounted(true);
    checkIntegrations();
  }, []);

  const checkIntegrations = async () => {
    // Check Supabase
    const supabaseConfigured = !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_URL !== "your_supabase_project_url";

    // Check other integrations via API
    try {
      const docspringRes = await fetch("/api/admin/docspring?action=config");
      const docspringData = await docspringRes.json();

      setIntegrations({
        supabase: {
          configured: supabaseConfigured,
          status: supabaseConfigured ? "connected" : "not_configured"
        },
        docspring: {
          configured: docspringData.configured && docspringData.hasCredentials,
          status: docspringData.configured ? "connected" : "not_configured"
        },
        stripe: {
          configured: false,
          status: "not_configured"
        },
        anthropic: {
          configured: false,
          status: "not_configured"
        },
      });
    } catch {
      setIntegrations(prev => ({
        ...prev,
        docspring: { configured: false, status: "error" },
      }));
    }
  };

  const handleSaveGeneral = async () => {
    setIsSaving(true);
    // Simulate save
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast.success("General settings saved");
    setIsSaving(false);
  };

  const handleSaveNotifications = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast.success("Notification settings saved");
    setIsSaving(false);
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
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-slate-400">Manage platform configuration and integrations</p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="bg-slate-800 border-slate-700">
          <TabsTrigger value="general" className="data-[state=active]:bg-slate-700">
            <Settings className="h-4 w-4 mr-2" />
            General
          </TabsTrigger>
          <TabsTrigger value="notifications" className="data-[state=active]:bg-slate-700">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="integrations" className="data-[state=active]:bg-slate-700">
            <Database className="h-4 w-4 mr-2" />
            Integrations
          </TabsTrigger>
          <TabsTrigger value="security" className="data-[state=active]:bg-slate-700">
            <Shield className="h-4 w-4 mr-2" />
            Security
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Globe className="h-5 w-5" />
                General Settings
              </CardTitle>
              <CardDescription className="text-slate-400">
                Basic platform configuration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-300">Site Name</Label>
                  <Input
                    value={generalSettings.siteName}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, siteName: e.target.value })}
                    className="bg-slate-900 border-slate-600 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300">Support Email</Label>
                  <Input
                    type="email"
                    value={generalSettings.supportEmail}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, supportEmail: e.target.value })}
                    className="bg-slate-900 border-slate-600 text-white"
                  />
                </div>
              </div>

              <Separator className="bg-slate-700" />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-slate-300">Maintenance Mode</Label>
                    <p className="text-sm text-slate-500">Disable public access during maintenance</p>
                  </div>
                  <Switch
                    checked={generalSettings.maintenanceMode}
                    onCheckedChange={(checked) => setGeneralSettings({ ...generalSettings, maintenanceMode: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-slate-300">Allow New Registrations</Label>
                    <p className="text-sm text-slate-500">Allow new users to register</p>
                  </div>
                  <Switch
                    checked={generalSettings.allowNewRegistrations}
                    onCheckedChange={(checked) => setGeneralSettings({ ...generalSettings, allowNewRegistrations: checked })}
                  />
                </div>
              </div>

              <Button onClick={handleSaveGeneral} disabled={isSaving}>
                {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Settings
              </CardTitle>
              <CardDescription className="text-slate-400">
                Configure admin notification preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-slate-300">Email Notifications</Label>
                    <p className="text-sm text-slate-500">Receive notifications via email</p>
                  </div>
                  <Switch
                    checked={notificationSettings.emailNotifications}
                    onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, emailNotifications: checked })}
                  />
                </div>
                <Separator className="bg-slate-700" />
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-slate-300">New Case Alerts</Label>
                    <p className="text-sm text-slate-500">Get notified when a new case is created</p>
                  </div>
                  <Switch
                    checked={notificationSettings.newCaseAlerts}
                    onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, newCaseAlerts: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-slate-300">Lawyer Verification Alerts</Label>
                    <p className="text-sm text-slate-500">Get notified when a lawyer requests verification</p>
                  </div>
                  <Switch
                    checked={notificationSettings.lawyerVerificationAlerts}
                    onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, lawyerVerificationAlerts: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-slate-300">Document Generation Alerts</Label>
                    <p className="text-sm text-slate-500">Get notified when documents are generated</p>
                  </div>
                  <Switch
                    checked={notificationSettings.documentGenerationAlerts}
                    onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, documentGenerationAlerts: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-slate-300">Payment Alerts</Label>
                    <p className="text-sm text-slate-500">Get notified for payment events</p>
                  </div>
                  <Switch
                    checked={notificationSettings.paymentAlerts}
                    onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, paymentAlerts: checked })}
                  />
                </div>
              </div>

              <Button onClick={handleSaveNotifications} disabled={isSaving}>
                {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integrations */}
        <TabsContent value="integrations">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Integrations
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    Third-party service connections
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={checkIntegrations}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Supabase */}
              <div className="flex items-center justify-between p-4 rounded-lg bg-slate-900 border border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-500/10">
                    <Database className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <h4 className="font-medium text-white">Supabase</h4>
                    <p className="text-sm text-slate-400">Database & Authentication</p>
                  </div>
                </div>
                <Badge variant={integrations.supabase.configured ? "default" : "secondary"} className={integrations.supabase.configured ? "bg-green-600" : ""}>
                  {integrations.supabase.configured ? (
                    <><CheckCircle2 className="h-3 w-3 mr-1" /> Connected</>
                  ) : (
                    <><AlertCircle className="h-3 w-3 mr-1" /> Not Configured</>
                  )}
                </Badge>
              </div>

              {/* DocSpring */}
              <div className="flex items-center justify-between p-4 rounded-lg bg-slate-900 border border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-500/10">
                    <FileText className="h-5 w-5 text-purple-500" />
                  </div>
                  <div>
                    <h4 className="font-medium text-white">DocSpring</h4>
                    <p className="text-sm text-slate-400">PDF Document Generation</p>
                  </div>
                </div>
                <Badge variant={integrations.docspring.configured ? "default" : "secondary"} className={integrations.docspring.configured ? "bg-green-600" : ""}>
                  {integrations.docspring.configured ? (
                    <><CheckCircle2 className="h-3 w-3 mr-1" /> Connected</>
                  ) : (
                    <><AlertCircle className="h-3 w-3 mr-1" /> Not Configured</>
                  )}
                </Badge>
              </div>

              {/* Stripe */}
              <div className="flex items-center justify-between p-4 rounded-lg bg-slate-900 border border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/10">
                    <CreditCard className="h-5 w-5 text-emerald-500" />
                  </div>
                  <div>
                    <h4 className="font-medium text-white">Stripe</h4>
                    <p className="text-sm text-slate-400">Payment Processing</p>
                  </div>
                </div>
                <Badge variant="secondary">
                  <AlertCircle className="h-3 w-3 mr-1" /> Not Configured
                </Badge>
              </div>

              {/* Anthropic */}
              <div className="flex items-center justify-between p-4 rounded-lg bg-slate-900 border border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-orange-500/10">
                    <Globe className="h-5 w-5 text-orange-500" />
                  </div>
                  <div>
                    <h4 className="font-medium text-white">Anthropic Claude</h4>
                    <p className="text-sm text-slate-400">AI Document Analysis</p>
                  </div>
                </div>
                <Badge variant="secondary">
                  <AlertCircle className="h-3 w-3 mr-1" /> Not Configured
                </Badge>
              </div>

              <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <p className="text-sm text-emerald-400">
                  Configure integrations in your <code className="px-1 py-0.5 rounded bg-slate-800">.env.local</code> file.
                  See documentation for required environment variables.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Settings
              </CardTitle>
              <CardDescription className="text-slate-400">
                Platform security configuration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-slate-300">Two-Factor Authentication</Label>
                    <p className="text-sm text-slate-500">Require 2FA for admin accounts</p>
                  </div>
                  <Switch defaultChecked={false} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-slate-300">Session Timeout</Label>
                    <p className="text-sm text-slate-500">Auto-logout after inactivity (hours)</p>
                  </div>
                  <Input
                    type="number"
                    defaultValue={24}
                    className="w-24 bg-slate-900 border-slate-600 text-white"
                  />
                </div>
                <Separator className="bg-slate-700" />
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-slate-300">IP Whitelist</Label>
                    <p className="text-sm text-slate-500">Restrict admin access to specific IPs</p>
                  </div>
                  <Switch defaultChecked={false} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-slate-300">Audit Logging</Label>
                    <p className="text-sm text-slate-500">Log all admin actions</p>
                  </div>
                  <Switch defaultChecked={true} />
                </div>
              </div>

              <Button>
                <Save className="h-4 w-4 mr-2" />
                Save Security Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
