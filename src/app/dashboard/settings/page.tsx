"use client";

import { useEffect, useState } from "react";
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
import {
  changePassword,
  getBanks,
  getBankAccount,
  verifyBankAccount,
  getProfile,
  sendNotification,
  setPin,
  updateProfile,
  type UserProfile,
  type Bank,
  type BankAccount,
} from "../../lib/api/endpoints";
import { setHasPin } from "../../lib/api/session";
import { Skeleton } from "../../../components/ui/skeleton";

const THEMES: { value: ThemeChoice; label: string; hint: string }[] = [
  { value: "system", label: "System default", hint: "Follows your device appearance" },
  { value: "light", label: "Light", hint: "Bright surfaces, high contrast text" },
  { value: "dark", label: "Dark", hint: "Navy surfaces for low-light use" },
];

const GENDERS = ["Male", "Female", "Other"] as const;

const COUNTRY_NAMES: Record<string, string> = {
  NG: "Nigeria",
  GH: "Ghana",
  KE: "Kenya",
  EG: "Egypt",
  ZA: "South Africa",
  GB: "United Kingdom",
  US: "United States",
};

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const [profileForm, setProfileForm] = useState({
    firstName: "",
    lastName: "",
    username: "",
    gender: "",
    phoneNumber: "",
    favouriteTeam: "",
  });
  const [savingProfile, setSavingProfile] = useState(false);

  const [passwords, setPasswords] = useState({ current: "", next: "", confirm: "" });
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [savingPassword, setSavingPassword] = useState(false);

  const [hasPin, setHasPinState] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem("fp_has_pin") === "true";
  });
  const [pinValue, setPinValue] = useState("");
  const [pinError, setPinError] = useState<string | null>(null);
  const [savingPin, setSavingPin] = useState(false);

  const [banks, setBanks] = useState<Bank[]>([]);
  const [linkedAccount, setLinkedAccount] = useState<BankAccount | null>(null);
  const [loadingBank, setLoadingBank] = useState(true);
  const [bankCode, setBankCode] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [verifiedName, setVerifiedName] = useState<string | null>(null);
  const [bankError, setBankError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [autoVerifying, setAutoVerifying] = useState(false);

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [savingNotifications, setSavingNotifications] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.all([
      getProfile(),
      getBanks().catch(() => []),
      getBankAccount().catch(() => null),
    ])
      .then(([profileData, bankList, account]) => {
        if (!active) return;
        setProfile(profileData ?? null);
        setProfileForm({
          firstName: profileData?.firstName ?? "",
          lastName: profileData?.lastName ?? "",
          username: profileData?.username ?? "",
          gender: profileData?.gender ?? "",
          phoneNumber: profileData?.phoneNumber ?? "",
          favouriteTeam: profileData?.favouriteTeam ?? "",
        });
        if (profileData?.sendNotification === false) {
          setNotificationsEnabled(false);
        }
        setBanks(bankList);
        setLinkedAccount(account);
      })
      .catch((error) => {
        toast.error(error instanceof Error ? error.message : "Unable to load your profile");
      })
      .finally(() => {
        if (active) {
          setLoadingProfile(false);
          setLoadingBank(false);
        }
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!bankCode || accountNumber.length < 10 || linkedAccount) {
      return;
    }
    let active = true;
    setAutoVerifying(true);
    setVerifiedName(null);
    setBankError(null);
    verifyBankAccount({ bankCode, accountNumber })
      .then((result) => {
        if (!active) return;
        const name = result?.accountName ?? result?.account_name;
        if (name) {
          setVerifiedName(name);
          const bankName = banks.find((b) => b.code === bankCode)?.name ?? "";
          setLinkedAccount({ bankCode, accountNumber, accountName: name, bankName });
        } else {
          setBankError("Could not verify account — check details and try again");
        }
      })
      .catch((error) => {
        if (!active) return;
        setBankError(error instanceof Error ? error.message : "Verification failed");
      })
      .finally(() => {
        if (active) setAutoVerifying(false);
      });
    return () => {
      active = false;
    };
  }, [bankCode, accountNumber, linkedAccount]);

  async function saveProfile() {
    setSavingProfile(true);
    try {
      const updated = await updateProfile({
        firstName: profileForm.firstName.trim() || undefined,
        lastName: profileForm.lastName.trim() || undefined,
        username: profileForm.username.trim() || undefined,
        gender: profileForm.gender || undefined,
        phoneNumber: profileForm.phoneNumber.trim() || undefined,
        favouriteTeam: profileForm.favouriteTeam.trim() || undefined,
      });
      setProfile(updated ?? { ...profile, ...profileForm });
      toast.success("Profile updated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update your profile");
    } finally {
      setSavingProfile(false);
    }
  }

  async function savePassword() {
    setPasswordError(null);
    if (!passwords.current) {
      setPasswordError("Enter your current password");
      return;
    }
    if (passwords.next.length < 8) {
      setPasswordError("New password must be at least 8 characters");
      return;
    }
    if (passwords.next !== passwords.confirm) {
      setPasswordError("New passwords do not match");
      return;
    }
    setSavingPassword(true);
    try {
      await changePassword({ oldPassword: passwords.current, password: passwords.next });
      setPasswords({ current: "", next: "", confirm: "" });
      toast.success("Password updated");
    } catch (error) {
      setPasswordError(error instanceof Error ? error.message : "Unable to update your password");
    } finally {
      setSavingPassword(false);
    }
  }

  async function savePin() {
    setPinError(null);
    if (pinValue.length !== 4) {
      setPinError("PIN must be exactly 4 digits");
      return;
    }
    setSavingPin(true);
    try {
      await setPin({ pin: pinValue });
      setHasPin(true);
      setHasPinState(true);
      setPinValue("");
      toast.success("Transaction PIN set");
    } catch (error) {
      setPinError(error instanceof Error ? error.message : "Unable to set PIN");
    } finally {
      setSavingPin(false);
    }
  }

  async function verifyBank() {
    setBankError(null);
    setVerifiedName(null);
    setVerifying(true);
    try {
      const result = await verifyBankAccount({ bankCode, accountNumber });
      const name = result?.accountName ?? result?.account_name;
      if (name) {
        setVerifiedName(name);
        const bankName = banks.find((b) => b.code === bankCode)?.name ?? "";
        setLinkedAccount({ bankCode, accountNumber, accountName: name, bankName });
        toast.success("Bank account linked");
      } else {
        setBankError("Could not verify account — check details and try again");
      }
    } catch (error) {
      setBankError(error instanceof Error ? error.message : "Verification failed");
    } finally {
      setVerifying(false);
    }
  }

  async function toggleNotifications(checked: boolean) {
    setNotificationsEnabled(checked);
    setSavingNotifications(true);
    try {
      await sendNotification({ sendNotification: checked });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update notification settings");
      setNotificationsEnabled(!checked);
    } finally {
      setSavingNotifications(false);
    }
  }

  const country = profile?.countryCode
    ? COUNTRY_NAMES[profile.countryCode] ?? profile.countryCode
    : "";

  const profileChanged = !!profile && (
    profileForm.firstName !== (profile.firstName ?? "") ||
    profileForm.lastName !== (profile.lastName ?? "") ||
    profileForm.username !== (profile.username ?? "") ||
    profileForm.gender !== (profile.gender ?? "") ||
    profileForm.phoneNumber !== (profile.phoneNumber ?? "") ||
    profileForm.favouriteTeam !== (profile.favouriteTeam ?? "")
  );

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
                <Label htmlFor="firstName">First name</Label>
                <Input
                  id="firstName"
                  autoComplete="given-name"
                  value={profileForm.firstName}
                  onChange={(e) => setProfileForm((p) => ({ ...p, firstName: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="lastName">Last name</Label>
                <Input
                  id="lastName"
                  autoComplete="family-name"
                  value={profileForm.lastName}
                  onChange={(e) => setProfileForm((p) => ({ ...p, lastName: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  autoComplete="nickname"
                  value={profileForm.username}
                  onChange={(e) => setProfileForm((p) => ({ ...p, username: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phoneNumber">Phone number</Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  value={profileForm.phoneNumber}
                  onChange={(e) => setProfileForm((p) => ({ ...p, phoneNumber: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="gender">Gender</Label>
                <Select
                  value={profileForm.gender || undefined}
                  onValueChange={(value) => setProfileForm((p) => ({ ...p, gender: value }))}
                >
                  <SelectTrigger id="gender" className="w-full">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {GENDERS.map((gender) => (
                      <SelectItem key={gender} value={gender}>
                        {gender}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={country || "—"}
                  disabled
                  className="text-muted-foreground"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="team">Favourite team</Label>
                <Input
                  id="team"
                  autoComplete="off"
                  placeholder="e.g. Arsenal"
                  value={profileForm.favouriteTeam}
                  onChange={(e) => setProfileForm((p) => ({ ...p, favouriteTeam: e.target.value }))}
                />
              </div>
            </div>
            <Button
              className="mt-6 justify-self-start"
              onClick={saveProfile}
              disabled={savingProfile || loadingProfile || !profileChanged}
            >
              {savingProfile ? "Saving…" : "Save changes"}
            </Button>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="mt-6">
          <Card className="gap-0 p-6 shadow-[var(--shadow-card)]">
            <div className="grid max-w-md gap-5">
              <div className="grid gap-2">
                <Label htmlFor="current">Current password</Label>
                <Input
                  id="current"
                  type="password"
                  autoComplete="current-password"
                  value={passwords.current}
                  onChange={(e) => setPasswords((p) => ({ ...p, current: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="new">New password</Label>
                <Input
                  id="new"
                  type="password"
                  autoComplete="new-password"
                  value={passwords.next}
                  onChange={(e) => setPasswords((p) => ({ ...p, next: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirm">Confirm new password</Label>
                <Input
                  id="confirm"
                  type="password"
                  autoComplete="new-password"
                  value={passwords.confirm}
                  onChange={(e) => setPasswords((p) => ({ ...p, confirm: e.target.value }))}
                />
              </div>
              {passwordError && <p className="text-xs text-destructive">{passwordError}</p>}
              <Button
                className="justify-self-start"
                onClick={savePassword}
                disabled={savingPassword || !passwords.current || !passwords.next || !passwords.confirm}
              >
                {savingPassword ? "Updating…" : "Update password"}
              </Button>
            </div>
          </Card>

          <Card className="mt-6 gap-0 p-6 shadow-[var(--shadow-card)]">
            <h2 className="text-base font-semibold">Transaction PIN</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              A 4-digit PIN secures your withdrawals and sensitive actions.
            </p>
            {hasPin ? (
              <p className="mt-4 text-sm font-medium text-success">Transaction PIN is set. Contact support to change it.</p>
            ) : (
              <div className="mt-6 grid max-w-md gap-5">
                <div className="grid gap-2">
                  <Label htmlFor="pin">Set a 4-digit PIN</Label>
                  <Input
                    id="pin"
                    type="password"
                    inputMode="numeric"
                    maxLength={4}
                    value={pinValue}
                    onChange={(e) => setPinValue(e.target.value.replace(/\D/g, "").slice(0, 4))}
                    placeholder="****"
                  />
                </div>
                {pinError && <p className="text-xs text-destructive">{pinError}</p>}
                <Button
                  className="justify-self-start"
                  onClick={savePin}
                  disabled={savingPin || pinValue.length !== 4}
                >
                  {savingPin ? "Setting…" : "Set PIN"}
                </Button>
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="mt-6">
          <Card className="gap-0 p-6 shadow-[var(--shadow-card)]">
            <h2 className="text-base font-semibold">Payout account</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Link a bank account to receive withdrawals via Paystack.
            </p>
            {loadingBank ? (
              <div className="mt-6 grid max-w-md gap-5">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : linkedAccount ? (
              <div className="mt-6 grid max-w-md gap-5">
                <div className="rounded-lg border border-border bg-muted/30 p-4">
                  <p className="text-sm font-medium">{linkedAccount.bankName}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {linkedAccount.accountNumber} — {linkedAccount.accountName}
                  </p>
                </div>
              </div>
            ) : (
              <div className="mt-6 grid max-w-md gap-5">
                <div className="grid gap-2">
                  <Label htmlFor="bank">Bank</Label>
                  <Select value={bankCode} onValueChange={setBankCode}>
                    <SelectTrigger id="bank">
                      <SelectValue placeholder="Select your bank" />
                    </SelectTrigger>
                    <SelectContent>
                      {banks.map((b) => (
                        <SelectItem key={b.code} value={b.code}>
                          {b.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="account">Account number</Label>
                  <Input
                    id="account"
                    inputMode="numeric"
                    maxLength={10}
                    placeholder="0123456789"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  />
                </div>
                {verifiedName && (
                  <p className="text-sm font-medium text-success">{verifiedName}</p>
                )}
                {bankError && <p className="text-xs text-destructive">{bankError}</p>}
                {autoVerifying && (
                  <p className="text-xs text-muted-foreground">Verifying account...</p>
                )}
                <div className="flex gap-3">
                  <Button
                    className="justify-self-start"
                    variant="outline"
                    onClick={verifyBank}
                    disabled={!bankCode || accountNumber.length < 10 || verifying || autoVerifying}
                  >
                    {verifying ? "Verifying…" : autoVerifying ? "Auto-verifying…" : "Verify account"}
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-6">
          <Card className="gap-0 p-6 shadow-[var(--shadow-card)]">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
              <div className="min-w-0">
                <p className="text-sm font-semibold">Enable notifications</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Receive updates about predictions, pools, payments, and new features.
                </p>
              </div>
              <Switch
                checked={notificationsEnabled}
                disabled={savingNotifications}
                onCheckedChange={toggleNotifications}
              />
            </div>
          </Card>
          <p className="mt-3 text-xs text-muted-foreground">
            Per-channel notification preferences will be available in a future update.
          </p>
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
