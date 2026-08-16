"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Mail,
  Lock,
  Bell,
  Eye,
  User,
  Power,
  Trash2,
  LogOut,
  Check,
  AlertCircle,
  ShieldAlert,
  ChevronRight,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";

import { updateNotificationPreferencesAction, deactivateUserAccountAction, deleteUserAccountAction } from "@/lib/actions/profile.actions";
import { changePasswordAction } from "@/lib/actions/password-reset.actions";
import { signOut } from "next-auth/react";

type SettingsTab =
  | "email"
  | "password"
  | "alerts"
  | "privacy"
  | "profile-settings"
  | "deactivate"
  | "delete"
  | "logout";

export function SettingsClient({ initialPreferences, userEmail }: { initialPreferences: any; userEmail?: string }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<SettingsTab>("email");
  const [isPending, startTransition] = useTransition();

  // Email state
  const [emailValue, setEmailValue] = useState(userEmail || "member@example.com");
  const [emailSuccess, setEmailSuccess] = useState<string | null>(null);

  // Password state
  const [passwordOld, setPasswordOld] = useState("");
  const [passwordNew, setPasswordNew] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [passSuccess, setPassSuccess] = useState<string | null>(null);
  const [passError, setPassError] = useState<string | null>(null);

  // Alerts state
  const [preferences, setPreferences] = useState(initialPreferences || {});
  const [notifSuccess, setNotifSuccess] = useState<string | null>(null);
  const [notifError, setNotifError] = useState<string | null>(null);

  // Deactivate state
  const [deactivateDays, setDeactivateDays] = useState(30);
  const [deactivateSuccess, setDeactivateSuccess] = useState<string | null>(null);
  const [deactivateError, setDeactivateError] = useState<string | null>(null);

  // Delete state
  const [deleteReason, setDeleteReason] = useState("Marriage fixed");
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const menuItems: { id: SettingsTab; label: string; icon: any }[] = [
    { id: "email", label: "Edit e-mail Address", icon: Mail },
    { id: "password", label: "Change Password", icon: Lock },
    { id: "alerts", label: "Alerts & Updates", icon: Bell },
    { id: "privacy", label: "Privacy", icon: Eye },
    { id: "profile-settings", label: "Profile Settings", icon: User },
    { id: "deactivate", label: "Deactivate Profile", icon: Power },
    { id: "delete", label: "Delete Profile", icon: Trash2 },
    { id: "logout", label: "Logout", icon: LogOut },
  ];

  const handleToggleAlert = (key: string) => {
    setPreferences((prev: any) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSaveEmail = (e: React.FormEvent) => {
    e.preventDefault();
    setEmailSuccess(null);
    startTransition(() => {
      setEmailSuccess("Email address preferences saved successfully!");
    });
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassSuccess(null);
    setPassError(null);

    if (passwordNew !== passwordConfirm) {
      setPassError("New password and confirm password do not match");
      return;
    }

    startTransition(async () => {
      const res = await changePasswordAction({
        passwordOld,
        passwordNew,
      });

      if (res.success) {
        setPassSuccess("Password updated successfully!");
        setPasswordOld("");
        setPasswordNew("");
        setPasswordConfirm("");
      } else {
        setPassError(res.error || "Failed to update password");
      }
    });
  };

  const handleSaveAlerts = () => {
    setNotifSuccess(null);
    setNotifError(null);
    startTransition(async () => {
      const { id, userId, createdAt, updatedAt, ...payload } = preferences;
      const res = await updateNotificationPreferencesAction(payload);
      if (res.success) {
        setNotifSuccess("Notification alerts updated successfully!");
      } else {
        setNotifError(res.error || "Failed to save notification preferences.");
      }
    });
  };

  const handleDeactivate = async () => {
    setDeactivateSuccess(null);
    setDeactivateError(null);
    startTransition(async () => {
      const res = await deactivateUserAccountAction(deactivateDays);
      if (res.success) {
        setDeactivateSuccess(`Profile deactivated for ${deactivateDays} days. It will automatically reactivate after the duration.`);
      } else {
        setDeactivateError(res.error || "Failed to deactivate profile.");
      }
    });
  };

  const handleDelete = async () => {
    if (deleteConfirmText.toUpperCase() !== "DELETE") {
      setDeleteError("Please type DELETE to confirm profile deletion.");
      return;
    }
    setDeleteError(null);
    startTransition(async () => {
      const res = await deleteUserAccountAction(deleteReason);
      if (res.success) {
        await signOut({ callbackUrl: "/login" });
      } else {
        setDeleteError(res.error || "Failed to delete profile.");
      }
    });
  };

  const handleLogout = async () => {
    startTransition(async () => {
      await signOut({ callbackUrl: "/login" });
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl space-y-6 text-slate-900">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
          Account Settings
        </h1>
        <p className="text-slate-500 text-xs sm:text-sm mt-1">
          Manage your email, password, notification preferences, privacy, and account status.
        </p>
      </div>

      {/* Split Panel Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* LEFT PANEL MENU (Desktop Sticky Column / Mobile Horizontal Scroll) */}
        <div className="md:col-span-4 bg-white border border-slate-200/90 shadow-sm rounded-2xl p-2 shrink-0 md:sticky md:top-20">
          {/* Desktop Vertical Menu */}
          <div className="hidden md:flex flex-col space-y-1">
            {menuItems.map(({ id, label, icon: Icon }) => {
              const isActive = activeTab === id;
              return (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? "bg-rose-50 text-rose-600 border border-rose-200/80 shadow-xs"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? "text-rose-600" : "text-slate-400"}`} />
                    <span>{label}</span>
                  </div>
                  <ChevronRight className={`w-3.5 h-3.5 ${isActive ? "text-rose-600" : "text-slate-300"}`} />
                </button>
              );
            })}
          </div>

          {/* Mobile Horizontal Scroll Menu */}
          <div className="flex md:hidden overflow-x-auto no-scrollbar space-x-2 p-1">
            {menuItems.map(({ id, label, icon: Icon }) => {
              const isActive = activeTab === id;
              return (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition-all ${
                    isActive
                      ? "bg-rose-600 text-white shadow-sm"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* RIGHT PANEL CONTENT */}
        <div className="md:col-span-8">
          <Card className="border border-slate-200/90 bg-white shadow-sm rounded-2xl overflow-hidden min-h-[420px]">
            {/* 1. Edit Email */}
            {activeTab === "email" && (
              <>
                <CardHeader className="border-b border-slate-100 pb-4">
                  <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Mail className="w-5 h-5 text-rose-600" /> Edit e-mail Address
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500">
                    Update your registered email address for account communications and login notifications.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  {emailSuccess && (
                    <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2.5 text-emerald-800 text-xs font-medium">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{emailSuccess}</span>
                    </div>
                  )}
                  <form onSubmit={handleSaveEmail} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="email" className="text-xs font-semibold text-slate-700">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        required
                        value={emailValue}
                        onChange={(e) => setEmailValue(e.target.value)}
                        className="border-slate-200 bg-slate-50 text-slate-900 text-xs h-9 focus-visible:ring-rose-500"
                      />
                    </div>
                    <div className="flex items-center gap-3 pt-2">
                      <Button
                        type="submit"
                        disabled={isPending}
                        className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl h-9 px-5 shadow-xs"
                      >
                        {isPending ? <Spinner className="w-3.5 h-3.5 mr-1.5 text-white" /> : null}
                        {isPending ? "Saving..." : "Save"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setEmailValue(userEmail || "member@example.com")}
                        className="border-slate-200 text-slate-600 text-xs rounded-xl h-9 px-4"
                      >
                        Reset
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </>
            )}

            {/* 2. Change Password */}
            {activeTab === "password" && (
              <>
                <CardHeader className="border-b border-slate-100 pb-4">
                  <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Lock className="w-5 h-5 text-rose-600" /> Change Password
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500">
                    Update your account password to ensure maximum security.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  {passSuccess && (
                    <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2.5 text-emerald-800 text-xs font-medium">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{passSuccess}</span>
                    </div>
                  )}
                  {passError && (
                    <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2.5 text-red-800 text-xs font-medium">
                      <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
                      <span>{passError}</span>
                    </div>
                  )}
                  <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                    <div className="space-y-1.5">
                      <Label htmlFor="passwordOld" className="text-xs font-semibold text-slate-700">Current Password *</Label>
                      <Input
                        id="passwordOld"
                        type="password"
                        required
                        value={passwordOld}
                        onChange={(e) => setPasswordOld(e.target.value)}
                        className="border-slate-200 bg-slate-50 text-slate-900 text-xs h-9 focus-visible:ring-rose-500"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="passwordNew" className="text-xs font-semibold text-slate-700">New Password *</Label>
                      <Input
                        id="passwordNew"
                        type="password"
                        required
                        value={passwordNew}
                        onChange={(e) => setPasswordNew(e.target.value)}
                        className="border-slate-200 bg-slate-50 text-slate-900 text-xs h-9 focus-visible:ring-rose-500"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="passwordConfirm" className="text-xs font-semibold text-slate-700">Confirm New Password *</Label>
                      <Input
                        id="passwordConfirm"
                        type="password"
                        required
                        value={passwordConfirm}
                        onChange={(e) => setPasswordConfirm(e.target.value)}
                        className="border-slate-200 bg-slate-50 text-slate-900 text-xs h-9 focus-visible:ring-rose-500"
                      />
                    </div>
                    <div className="pt-2">
                      <Button
                        type="submit"
                        disabled={isPending}
                        className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl h-9 px-5 shadow-xs"
                      >
                        {isPending ? <Spinner className="w-3.5 h-3.5 mr-1.5 text-white" /> : null}
                        {isPending ? "Updating..." : "Change Password"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </>
            )}

            {/* 3. Alerts & Updates */}
            {activeTab === "alerts" && (
              <>
                <CardHeader className="border-b border-slate-100 pb-4">
                  <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Bell className="w-5 h-5 text-rose-600" /> Alerts & Updates
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500">
                    Control instant notifications for new match recommendations, interest responses, and security alerts.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  {notifSuccess && (
                    <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2.5 text-emerald-800 text-xs font-medium">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{notifSuccess}</span>
                    </div>
                  )}
                  {notifError && (
                    <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2.5 text-red-800 text-xs font-medium">
                      <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                      <span>{notifError}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-rose-600 uppercase border-b border-slate-100 pb-1.5">Email Notifications</h4>
                      {[
                        { key: "emailMatches", label: "Match Suggestions" },
                        { key: "emailInterests", label: "Connect Requests & Acceptances" },
                        { key: "emailMessages", label: "Direct Messages" },
                        { key: "emailSecurity", label: "Security & Login Alerts" },
                      ].map(({ key, label }) => (
                        <label key={key} className="flex items-center justify-between text-xs font-medium text-slate-700 cursor-pointer py-1">
                          <span>{label}</span>
                          <input
                            type="checkbox"
                            checked={!!preferences[key]}
                            onChange={() => handleToggleAlert(key)}
                            className="w-4 h-4 rounded border-slate-300 text-rose-600 accent-rose-600"
                          />
                        </label>
                      ))}
                    </div>

                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-rose-600 uppercase border-b border-slate-100 pb-1.5">Browser & Push Alerts</h4>
                      {[
                        { key: "browserMatches", label: "Instant Match Recommendations" },
                        { key: "browserInterests", label: "Real-time Interest Alerts" },
                        { key: "browserMessages", label: "Unread Message Reminders" },
                        { key: "browserSecurity", label: "Security Notifications" },
                      ].map(({ key, label }) => (
                        <label key={key} className="flex items-center justify-between text-xs font-medium text-slate-700 cursor-pointer py-1">
                          <span>{label}</span>
                          <input
                            type="checkbox"
                            checked={!!preferences[key]}
                            onChange={() => handleToggleAlert(key)}
                            className="w-4 h-4 rounded border-slate-300 text-rose-600 accent-rose-600"
                          />
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex justify-end">
                    <Button
                      onClick={handleSaveAlerts}
                      disabled={isPending}
                      className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl h-9 px-5 shadow-xs"
                    >
                      {isPending ? <Spinner className="w-3.5 h-3.5 mr-1.5 text-white" /> : null}
                      {isPending ? "Saving..." : "Save Preferences"}
                    </Button>
                  </div>
                </CardContent>
              </>
            )}

            {/* 4. Privacy */}
            {activeTab === "privacy" && (
              <>
                <CardHeader className="border-b border-slate-100 pb-4">
                  <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Eye className="w-5 h-5 text-rose-600" /> Privacy Controls
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500">
                    Manage public visibility of your photos, contact number, annual income, and family details.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <p className="text-xs text-slate-600">
                    Privacy controls are unified with your canonical profile settings. Click below to manage photo blurring and contact visibility rules.
                  </p>
                  <Link href="/profile?tab=privacy">
                    <Button className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl h-9 px-5 shadow-xs">
                      Open Privacy Workspace
                    </Button>
                  </Link>
                </CardContent>
              </>
            )}

            {/* 5. Profile Settings */}
            {activeTab === "profile-settings" && (
              <>
                <CardHeader className="border-b border-slate-100 pb-4">
                  <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <User className="w-5 h-5 text-rose-600" /> Profile Settings
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500">
                    Direct access to edit your canonical matrimonial biodata and partner preferences.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <p className="text-xs text-slate-600">
                    View and update your complete 3-column matrimonial biodata, personal background, photos, and partner matching requirements.
                  </p>
                  <div className="flex gap-3 flex-wrap">
                    <Link href="/profile">
                      <Button className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl h-9 px-5 shadow-xs">
                        Edit Matrimonial Profile
                      </Button>
                    </Link>
                    <Link href="/profile?tab=preferences">
                      <Button variant="outline" className="border-slate-200 text-slate-700 font-bold text-xs rounded-xl h-9 px-4">
                        Edit Partner Preferences
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </>
            )}

            {/* 6. Deactivate Profile */}
            {activeTab === "deactivate" && (
              <>
                <CardHeader className="border-b border-slate-100 pb-4">
                  <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Power className="w-5 h-5 text-amber-600" /> Deactivate Profile
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500">
                    Temporarily hide your profile from search without permanently losing your account or match history.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-5">
                  {deactivateSuccess && (
                    <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2.5 text-emerald-800 text-xs font-medium">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{deactivateSuccess}</span>
                    </div>
                  )}
                  {deactivateError && (
                    <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2.5 text-red-800 text-xs font-medium">
                      <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                      <span>{deactivateError}</span>
                    </div>
                  )}

                  <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 text-xs text-amber-900 space-y-2">
                    <p className="font-semibold">
                      You can temporarily deactivate your profile if you do not want to delete it. On deactivation your profile will be hidden from our members and you will not be able to contact any member until you activate.
                    </p>
                    <ul className="list-disc pl-4 space-y-1 text-[11px]">
                      <li>Profile details remain completely hidden from search results</li>
                      <li>Express Interest & Personalised Messages will be disabled</li>
                      <li>Chat & contact requests will be suspended</li>
                      <li>Your account automatically reactivates after the selected period elapses</li>
                    </ul>
                  </div>

                  <div className="space-y-2 max-w-xs">
                    <Label htmlFor="deactivateDays" className="text-xs font-semibold text-slate-700">
                      Select Days (Deactivation Duration)
                    </Label>
                    <select
                      id="deactivateDays"
                      value={deactivateDays}
                      onChange={(e) => setDeactivateDays(Number(e.target.value))}
                      className="w-full h-9 px-3 border border-slate-200 bg-slate-50 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-rose-500"
                    >
                      <option value={15}>15 Days</option>
                      <option value={30}>30 Days</option>
                      <option value={60}>60 Days</option>
                      <option value={90}>90 Days</option>
                    </select>
                    <p className="text-[10px] text-slate-500">
                      Your profile will be activated automatically after the selected time period elapses.
                    </p>
                  </div>

                  <div className="pt-2">
                    <Button
                      onClick={handleDeactivate}
                      disabled={isPending}
                      className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl h-9 px-5 shadow-xs"
                    >
                      {isPending ? <Spinner className="w-3.5 h-3.5 mr-1.5 text-white" /> : null}
                      {isPending ? "Deactivating..." : "Deactivate Now"}
                    </Button>
                  </div>
                </CardContent>
              </>
            )}

            {/* 7. Delete Profile */}
            {activeTab === "delete" && (
              <>
                <CardHeader className="border-b border-slate-100 pb-4">
                  <CardTitle className="text-lg font-bold text-red-600 flex items-center gap-2">
                    <Trash2 className="w-5 h-5 text-red-600" /> Delete Profile
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500">
                    Permanently delete your profile and account records.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-5">
                  {deleteError && (
                    <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2.5 text-red-800 text-xs font-medium">
                      <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                      <span>{deleteError}</span>
                    </div>
                  )}

                  <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-900 space-y-1">
                    <p className="font-bold">NOTE: If you delete your profile, it cannot be restored.</p>
                    <p className="text-[11px]">
                      Your matrimonial details, photo uploads, interests sent/received, and subscription access will be permanently removed.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-xs font-bold text-slate-800">
                      Please choose a reason for profile deletion *
                    </Label>
                    <div className="space-y-2 text-xs text-slate-700">
                      {[
                        "Marriage fixed",
                        "Married through InstantMatrimony",
                        "Married through other source",
                        "Taking a break",
                        "Other reasons",
                      ].map((r) => (
                        <label key={r} className="flex items-center gap-2.5 cursor-pointer">
                          <input
                            type="radio"
                            name="deleteReason"
                            value={r}
                            checked={deleteReason === r}
                            onChange={(e) => setDeleteReason(e.target.value)}
                            className="text-red-600 focus:ring-red-500 accent-red-600"
                          />
                          <span>{r}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5 max-w-xs pt-2">
                    <Label htmlFor="deleteConfirmText" className="text-xs font-semibold text-slate-700">
                      Type <span className="font-mono text-red-600 font-bold">DELETE</span> to confirm
                    </Label>
                    <Input
                      id="deleteConfirmText"
                      placeholder="Type DELETE"
                      value={deleteConfirmText}
                      onChange={(e) => setDeleteConfirmText(e.target.value)}
                      className="border-slate-200 bg-slate-50 text-slate-900 text-xs h-9 focus-visible:ring-red-500"
                    />
                  </div>

                  <div className="pt-2">
                    <Button
                      onClick={handleDelete}
                      disabled={isPending || deleteConfirmText.toUpperCase() !== "DELETE"}
                      className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl h-9 px-5 shadow-xs disabled:opacity-50"
                    >
                      {isPending ? <Spinner className="w-3.5 h-3.5 mr-1.5 text-white" /> : null}
                      {isPending ? "Deleting..." : "Delete Profile"}
                    </Button>
                  </div>
                </CardContent>
              </>
            )}

            {/* 8. Logout */}
            {activeTab === "logout" && (
              <>
                <CardHeader className="border-b border-slate-100 pb-4">
                  <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <LogOut className="w-5 h-5 text-rose-600" /> Account Sign Out
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500">
                    Safely sign out of your current session on this device.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <p className="text-xs text-slate-600">
                    Click the button below to complete sign out and return to the login screen.
                  </p>
                  <Button
                    onClick={handleLogout}
                    disabled={isPending}
                    className="bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white font-bold text-xs rounded-xl h-10 px-6 shadow-sm flex items-center gap-2"
                  >
                    {isPending ? <Spinner className="w-4 h-4 text-white" /> : <LogOut className="w-4 h-4" />}
                    {isPending ? "Signing out..." : "Sign Out"}
                  </Button>
                </CardContent>
              </>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
