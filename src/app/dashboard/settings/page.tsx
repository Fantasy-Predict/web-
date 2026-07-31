"use client";

import { useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Switch } from "../../../components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { useTheme, type ThemeChoice } from "@/components/theme-provider";
import { currentUser } from "../../lib/mock-data";

const THEMES: { value: ThemeChoice; label: string; hint: string }[] = [
  { value: "system", label: "System default", hint: "Follows your device appearance" },
  { value: "light", label: "Light", hint: "Bright surfaces, high contrast text" },
  { value: "dark", label: "Dark", hint: "Navy surfaces for low-light use" },
];

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [notifications, setNotifications] = useState({
    deadlines: true,
    leagues: true,
    payments: true,
    marketing: false,
  });

  return (
    <AppShell title="Settings" description="Manage your account, preferences and appearance.">
      <Tabs defaultValue="profile">
        <TabsList className="flex-wrap">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <Card className="gap-0 p-6 shadow-[var(--shadow-card)]">
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" defaultValue={currentUser.username} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="country">Country</Label>
                <Input id="country" defaultValue={currentUser.country} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="team">Favourite team</Label>
                <Input id="team" defaultValue={currentUser.favouriteTeam} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="language">Language</Label>
                <Select defaultValue="en">
                  <SelectTrigger id="language" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="pt">Portuguese</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button className="mt-6 justify-self-start" onClick={() => toast.success("Profile updated")}>
              Save changes
            </Button>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="mt-6">
          <Card className="gap-0 p-6 shadow-[var(--shadow-card)]">
            <div className="grid max-w-md gap-5">
              <div className="grid gap-2">
                <Label htmlFor="current">Current password</Label>
                <Input id="current" type="password" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="new">New password</Label>
                <Input id="new" type="password" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirm">Confirm new password</Label>
                <Input id="confirm" type="password" />
              </div>
              <Button className="justify-self-start" onClick={() => toast.success("Password updated")}>
                Update password
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="mt-6">
          <Card className="gap-0 p-6 shadow-[var(--shadow-card)]">
            <h2 className="text-base font-semibold">Payout account</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Withdrawals are paid to this account through Paystack.
            </p>
            <div className="mt-6 grid max-w-md gap-5">
              <div className="grid gap-2">
                <Label htmlFor="bank">Bank</Label>
                <Input id="bank" placeholder="Bank name" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="account">Account number</Label>
                <Input id="account" inputMode="numeric" placeholder="0123456789" />
              </div>
              <Button className="justify-self-start" onClick={() => toast.success("Payout account saved")}>
                Save account
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-6">
          <Card className="gap-0 divide-y divide-border p-0 shadow-[var(--shadow-card)]">
            {[
              ["deadlines", "Prediction deadlines", "Reminders before each matchweek locks"],
              ["leagues", "League updates", "New members, standings and league changes"],
              ["payments", "Payment confirmations", "Deposits, entry fees and payouts"],
              ["marketing", "Product updates", "Occasional news about new features"],
            ].map(([key, title, body]) => (
              <div key={key} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-6 py-5">
                <div className="min-w-0">
                  <p className="text-sm font-semibold">{title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{body}</p>
                </div>
                <Switch
                  checked={notifications[key as keyof typeof notifications]}
                  onCheckedChange={(checked) =>
                    setNotifications((prev) => ({ ...prev, [key]: checked }))
                  }
                />
              </div>
            ))}
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="mt-6">
          <Card className="gap-0 p-6 shadow-[var(--shadow-card)]">
            <h2 className="text-base font-semibold">Theme</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              System default follows your device. A manual choice overrides it on this browser.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {THEMES.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setTheme(option.value)}
                  aria-pressed={theme === option.value}
                  className={
                    theme === option.value
                      ? "rounded-xl border-2 border-primary bg-primary/5 p-4 text-left"
                      : "rounded-xl border border-border p-4 text-left transition-colors hover:bg-accent"
                  }
                >
                  <p className="text-sm font-semibold">{option.label}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{option.hint}</p>
                </button>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}