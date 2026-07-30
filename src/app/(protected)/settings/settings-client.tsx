"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Bell, Lock, Check, AlertCircle, ShieldAlert } from "lucide-react";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateNotificationPreferencesAction } from "@/lib/actions/profile.actions";
import { changePasswordAction } from "@/lib/actions/password-reset.actions";

export function SettingsClient({ initialPreferences }: { initialPreferences: any }) {
  const router = useRouter();
  const [preferences, setPreferences] = useState(initialPreferences);
  const [isPending, startTransition] = useTransition();

  // Settings feedback
  const [notifSuccess, setNotifSuccess] = useState<string | null>(null);
  const [notifError, setNotifError] = useState<string | null>(null);

  const [passSuccess, setPassSuccess] = useState<string | null>(null);
  const [passError, setPassError] = useState<string | null>(null);

  // Password fields
  const [passwordOld, setPasswordOld] = useState("");
  const [passwordNew, setPasswordNew] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  const handleToggle = (key: string) => {
    setPreferences((prev: any) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSavePreferences = () => {
    setNotifSuccess(null);
    setNotifError(null);

    startTransition(async () => {
      // Exclude id, userId, createdAt, updatedAt from request payload
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, userId, createdAt, updatedAt, ...payload } = preferences;

      const res = await updateNotificationPreferencesAction(payload);
      if (res.success) {
        setNotifSuccess("Notification channels updated successfully!");
        router.refresh();
      } else {
        setNotifError(res.error || "Failed to save preferences.");
      }
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
        router.refresh();
      } else {
        setPassError(res.error || "Failed to update password");
      }
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl space-y-8 text-slate-200">
      
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-rose-400 to-pink-500 bg-clip-text text-transparent">
          Account Settings
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Manage alert notifications, security settings, and matching visibility limits.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        
        {/* Notification preferences card */}
        <Card className="border border-slate-800 bg-slate-900/30 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <Bell className="w-5 h-5 text-rose-500" /> Notification Channels
            </CardTitle>
            <CardDescription className="text-slate-400">
              Customize how and when you receive matches, message requests, and security alerts.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            
            {notifSuccess && (
              <div className="p-4 rounded-xl bg-green-950/30 border border-green-800/30 flex items-center gap-3 text-green-400 text-sm">
                <Check className="w-5 h-5 shrink-0" />
                <span>{notifSuccess}</span>
              </div>
            )}
            {notifError && (
              <div className="p-4 rounded-xl bg-red-950/30 border border-red-800/30 flex items-center gap-3 text-red-400 text-sm">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{notifError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Email Alerts column */}
              <div className="space-y-4">
                <h3 className="font-bold text-sm text-rose-400 border-b border-slate-850 pb-2">Email Notifications</h3>
                
                <div className="flex items-center justify-between py-1">
                  <div className="space-y-0.5">
                    <Label className="text-xs font-semibold">Match Suggestions</Label>
                    <p className="text-[10px] text-slate-500">Daily premium compatibilities delivered to your inbox</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.emailMatches}
                    onChange={() => handleToggle("emailMatches")}
                    className="h-4 w-4 rounded border-slate-800 bg-slate-950 text-rose-600 focus:ring-rose-500 accent-rose-600"
                  />
                </div>

                <div className="flex items-center justify-between py-1">
                  <div className="space-y-0.5">
                    <Label className="text-xs font-semibold">Connect Requests (Interests)</Label>
                    <p className="text-[10px] text-slate-500">Alerts when someone expresses interest or accepts yours</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.emailInterests}
                    onChange={() => handleToggle("emailInterests")}
                    className="h-4 w-4 rounded border-slate-800 bg-slate-950 text-rose-600 focus:ring-rose-500 accent-rose-600"
                  />
                </div>

                <div className="flex items-center justify-between py-1">
                  <div className="space-y-0.5">
                    <Label className="text-xs font-semibold">Direct Messages</Label>
                    <p className="text-[10px] text-slate-500">Emails notifying you of unread message requests</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.emailMessages}
                    onChange={() => handleToggle("emailMessages")}
                    className="h-4 w-4 rounded border-slate-800 bg-slate-950 text-rose-600 focus:ring-rose-500 accent-rose-600"
                  />
                </div>

                <div className="flex items-center justify-between py-1">
                  <div className="space-y-0.5">
                    <Label className="text-xs font-semibold">Security Alerts</Label>
                    <p className="text-[10px] text-slate-500">Alerts on password changes, login sessions, and MFA status</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.emailSecurity}
                    onChange={() => handleToggle("emailSecurity")}
                    className="h-4 w-4 rounded border-slate-800 bg-slate-950 text-rose-600 focus:ring-rose-500 accent-rose-600"
                  />
                </div>
              </div>

              {/* Browser Push alerts column */}
              <div className="space-y-4">
                <h3 className="font-bold text-sm text-rose-400 border-b border-slate-850 pb-2">Browser Alerts</h3>

                <div className="flex items-center justify-between py-1">
                  <div className="space-y-0.5">
                    <Label className="text-xs font-semibold">Match Suggestions</Label>
                    <p className="text-[10px] text-slate-500">Real-time push notifications of match findings</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.browserMatches}
                    onChange={() => handleToggle("browserMatches")}
                    className="h-4 w-4 rounded border-slate-800 bg-slate-950 text-rose-600 focus:ring-rose-500 accent-rose-600"
                  />
                </div>

                <div className="flex items-center justify-between py-1">
                  <div className="space-y-0.5">
                    <Label className="text-xs font-semibold">Connect Requests (Interests)</Label>
                    <p className="text-[10px] text-slate-500">Push notices when matches connect with you</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.browserInterests}
                    onChange={() => handleToggle("browserInterests")}
                    className="h-4 w-4 rounded border-slate-800 bg-slate-950 text-rose-600 focus:ring-rose-500 accent-rose-600"
                  />
                </div>

                <div className="flex items-center justify-between py-1">
                  <div className="space-y-0.5">
                    <Label className="text-xs font-semibold">Direct Messages</Label>
                    <p className="text-[10px] text-slate-500">Instant browser sound/banner when you receive a message</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.browserMessages}
                    onChange={() => handleToggle("browserMessages")}
                    className="h-4 w-4 rounded border-slate-800 bg-slate-950 text-rose-600 focus:ring-rose-500 accent-rose-600"
                  />
                </div>

                <div className="flex items-center justify-between py-1">
                  <div className="space-y-0.5">
                    <Label className="text-xs font-semibold">Security Alerts</Label>
                    <p className="text-[10px] text-slate-500">Real-time alerts for suspicious actions or device locks</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.browserSecurity}
                    onChange={() => handleToggle("browserSecurity")}
                    className="h-4 w-4 rounded border-slate-800 bg-slate-950 text-rose-600 focus:ring-rose-500 accent-rose-600"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-850">
              <Button onClick={handleSavePreferences} disabled={isPending} className="bg-rose-600 hover:bg-rose-500 font-semibold px-6">
                {isPending ? "Saving..." : "Save Preferences"}
              </Button>
            </div>

          </CardContent>
        </Card>

        {/* Change password card */}
        <Card className="border border-slate-800 bg-slate-900/30 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <Lock className="w-5 h-5 text-rose-500" /> Security & Password
            </CardTitle>
            <CardDescription className="text-slate-400">
              Update your account password to maintain security.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            
            <form onSubmit={handleChangePassword} className="space-y-4">
              
              {passSuccess && (
                <div className="p-4 rounded-xl bg-green-950/30 border border-green-800/30 flex items-center gap-3 text-green-400 text-sm">
                  <Check className="w-5 h-5 shrink-0" />
                  <span>{passSuccess}</span>
                </div>
              )}
              {passError && (
                <div className="p-4 rounded-xl bg-red-950/30 border border-red-800/30 flex items-center gap-3 text-red-400 text-sm">
                  <ShieldAlert className="w-5 h-5 shrink-0" />
                  <span>{passError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="old-pass">Current Password</Label>
                  <Input
                    id="old-pass"
                    type="password"
                    required
                    value={passwordOld}
                    onChange={(e) => setPasswordOld(e.target.value)}
                    className="border-slate-800 bg-slate-950/60"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-pass">New Password</Label>
                  <Input
                    id="new-pass"
                    type="password"
                    required
                    value={passwordNew}
                    onChange={(e) => setPasswordNew(e.target.value)}
                    className="border-slate-800 bg-slate-950/60"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-pass">Confirm Password</Label>
                  <Input
                    id="confirm-pass"
                    type="password"
                    required
                    value={passwordConfirm}
                    onChange={(e) => setPasswordConfirm(e.target.value)}
                    className="border-slate-800 bg-slate-950/60"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button type="submit" disabled={isPending} className="bg-rose-600 hover:bg-rose-500 font-semibold px-6">
                  {isPending ? "Updating..." : "Update Password"}
                </Button>
              </div>

            </form>

          </CardContent>
        </Card>

      </div>

    </div>
  );
}
