"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Save, DollarSign, Calendar, Globe, Shield } from "lucide-react";

export function PlatformSettings() {
  const [settings, setSettings] = useState({
    commissionRate: 5,
    paymentProcessingFee: 2.9,
    payoutSchedule: "weekly",
    minPayoutAmount: 50,
    taxRate: 0,
    currency: "USD",
    timezone: "UTC",
    maintenanceMode: false,
    allowPublicEvents: true,
    requireEventApproval: true,
    autoApproveVerifiedOrganizers: false,
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // TODO: Implement API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Settings saved successfully");
    } catch (error) {
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Platform Settings</h2>
          <p className="text-muted-foreground">Core platform configuration and preferences</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <Tabs defaultValue="financial" className="w-full">
        <TabsList>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="regional">Regional</TabsTrigger>
          <TabsTrigger value="moderation">Moderation</TabsTrigger>
          <TabsTrigger value="general">General</TabsTrigger>
        </TabsList>

        {/* Financial Settings */}
        <TabsContent value="financial" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Commission & Fees
              </CardTitle>
              <CardDescription>Configure platform revenue and payment processing</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label>Platform Commission Rate: {settings.commissionRate}%</Label>
                <Slider
                  value={[settings.commissionRate]}
                  onValueChange={([value]) => setSettings({ ...settings, commissionRate: value })}
                  min={3}
                  max={15}
                  step={0.5}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Percentage charged on each ticket sale (Range: 3% - 15%)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="processingFee">Payment Processing Fee (%)</Label>
                <Input
                  id="processingFee"
                  type="number"
                  value={settings.paymentProcessingFee}
                  onChange={(e) => setSettings({ ...settings, paymentProcessingFee: parseFloat(e.target.value) })}
                  step="0.1"
                />
                <p className="text-xs text-muted-foreground">
                  Additional fee for payment processing (e.g., Stripe fees)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="taxRate">Tax/VAT Rate (%)</Label>
                <Input
                  id="taxRate"
                  type="number"
                  value={settings.taxRate}
                  onChange={(e) => setSettings({ ...settings, taxRate: parseFloat(e.target.value) })}
                  step="0.1"
                />
                <p className="text-xs text-muted-foreground">Tax rate applied to transactions</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payout Configuration</CardTitle>
              <CardDescription>Organizer payout schedule and limits</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="payoutSchedule">Payout Schedule</Label>
                <Select
                  value={settings.payoutSchedule}
                  onValueChange={(value) => setSettings({ ...settings, payoutSchedule: value })}
                >
                  <SelectTrigger id="payoutSchedule">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="biweekly">Bi-weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="minPayout">Minimum Payout Amount ($)</Label>
                <Input
                  id="minPayout"
                  type="number"
                  value={settings.minPayoutAmount}
                  onChange={(e) => setSettings({ ...settings, minPayoutAmount: parseInt(e.target.value) })}
                />
                <p className="text-xs text-muted-foreground">Minimum balance required before payout is processed</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Regional Settings */}
        <TabsContent value="regional" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Regional Configuration
              </CardTitle>
              <CardDescription>Currency, timezone, and regional preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currency">Default Currency</Label>
                <Select
                  value={settings.currency}
                  onValueChange={(value) => setSettings({ ...settings, currency: value })}
                >
                  <SelectTrigger id="currency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD - US Dollar</SelectItem>
                    <SelectItem value="EUR">EUR - Euro</SelectItem>
                    <SelectItem value="GBP">GBP - British Pound</SelectItem>
                    <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                    <SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timezone">Default Timezone</Label>
                <Select
                  value={settings.timezone}
                  onValueChange={(value) => setSettings({ ...settings, timezone: value })}
                >
                  <SelectTrigger id="timezone">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UTC">UTC</SelectItem>
                    <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                    <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                    <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                    <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                    <SelectItem value="Europe/London">London (GMT)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Moderation Settings */}
        <TabsContent value="moderation" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Content Moderation
              </CardTitle>
              <CardDescription>Event approval and content moderation settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Require Event Approval</Label>
                  <p className="text-sm text-muted-foreground">All events must be approved before going live</p>
                </div>
                <Switch
                  checked={settings.requireEventApproval}
                  onCheckedChange={(checked) => setSettings({ ...settings, requireEventApproval: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto-Approve Verified Organizers</Label>
                  <p className="text-sm text-muted-foreground">Skip approval for organizers with good track record</p>
                </div>
                <Switch
                  checked={settings.autoApproveVerifiedOrganizers}
                  onCheckedChange={(checked) => setSettings({ ...settings, autoApproveVerifiedOrganizers: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Allow Public Events</Label>
                  <p className="text-sm text-muted-foreground">Users can create publicly visible events</p>
                </div>
                <Switch
                  checked={settings.allowPublicEvents}
                  onCheckedChange={(checked) => setSettings({ ...settings, allowPublicEvents: checked })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>General Configuration</CardTitle>
              <CardDescription>Platform-wide settings and features</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Maintenance Mode</Label>
                  <p className="text-sm text-muted-foreground">Temporarily disable platform for maintenance</p>
                </div>
                <Switch
                  checked={settings.maintenanceMode}
                  onCheckedChange={(checked) => setSettings({ ...settings, maintenanceMode: checked })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
