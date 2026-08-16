"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema } from "@/lib/validators/auth.validator";
import { registerAction } from "@/lib/actions/auth.actions";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { CaptchaWidget } from "@/components/ui/captcha-widget";

const COUNTRY_CODES = [
  { code: "+91", country: "India (+91)", flag: "🇮🇳" },
  { code: "+1", country: "USA / Canada (+1)", flag: "🇺🇸" },
  { code: "+44", country: "UK (+44)", flag: "🇬🇧" },
  { code: "+61", country: "Australia (+61)", flag: "🇦🇺" },
  { code: "+971", country: "UAE (+971)", flag: "🇦🇪" },
  { code: "+65", country: "Singapore (+65)", flag: "🇸🇬" },
  { code: "+60", country: "Malaysia (+60)", flag: "🇲🇾" },
];

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [countryCode, setCountryCode] = useState("+91");
  const [rawPhone, setRawPhone] = useState("");
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaCode, setCaptchaCode] = useState<string>("");
  const [captchaRefreshKey, setCaptchaRefreshKey] = useState<number>(0);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "+91",
      password: "",
      confirmPassword: "",
      acceptTerms: false,
    },
  });

  const handlePhoneChange = (val: string) => {
    const cleanedDigits = val.replace(/\D/g, "");
    setRawPhone(cleanedDigits);
    const fullPhone = cleanedDigits ? `${countryCode}${cleanedDigits}` : "";
    setValue("phone", fullPhone, { shouldValidate: true });
  };

  const handleCountryCodeChange = (code: string) => {
    setCountryCode(code);
    const fullPhone = rawPhone ? `${code}${rawPhone}` : "";
    setValue("phone", fullPhone, { shouldValidate: true });
  };

  const triggerCaptchaRefresh = () => {
    setCaptchaToken(null);
    setCaptchaCode("");
    setCaptchaRefreshKey((prev) => prev + 1);
  };

  const onSubmit = async (data: any) => {
    if (!captchaToken || !captchaCode) {
      setError("Please enter the 6-character CAPTCHA security code.");
      triggerCaptchaRefresh();
      return;
    }
    setLoading(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const payload = { ...data, captchaToken, captchaCode };
      const res = await registerAction(payload);
      if (!res.success) {
        setError(res.error || "Registration failed. Please check your details.");
        triggerCaptchaRefresh();
      } else {
        setSuccessMsg("Registration successful! Redirecting to email verification...");
        router.push(`/verify-email?email=${encodeURIComponent(data.email)}`);
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
      triggerCaptchaRefresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-grow flex items-center justify-center bg-gradient-to-b from-rose-50/50 via-slate-50 to-white px-4 py-12 sm:py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="border border-slate-200/80 bg-white shadow-xl shadow-slate-200/60 rounded-2xl">
          <CardHeader className="space-y-3 text-center pb-4">
            <div className="flex justify-center">
              <div className="relative h-14 w-14 overflow-hidden rounded-2xl border border-rose-200 bg-white p-0.5 shadow-md shadow-rose-500/10">
                <Image
                  src="/InstantMatrimony-Logo.jpeg"
                  alt="InstantMatrimony Logo"
                  width={56}
                  height={56}
                  className="h-full w-full object-cover rounded-xl"
                  priority
                />
              </div>
            </div>
            <CardTitle className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Create Account
            </CardTitle>
            <CardDescription className="text-slate-500 text-sm">
              Start your journey to find your life partner today
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl text-center font-medium">
                {error}
              </div>
            )}
            {successMsg && (
              <div className="p-3 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl text-center font-medium">
                {successMsg}
              </div>
            )}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-slate-700 font-medium text-xs">Full Name *</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  className="border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:border-rose-500 focus:ring-rose-500 rounded-xl text-sm"
                  {...register("name")}
                />
                {errors.name && (
                  <p className="text-xs text-red-500 font-medium">{errors.name.message as string}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-slate-700 font-medium text-xs">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  className="border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:border-rose-500 focus:ring-rose-500 rounded-xl text-sm"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-xs text-red-500 font-medium">{errors.email.message as string}</p>
                )}
              </div>

              {/* Required Phone Number Input with Country Code Selector */}
              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-slate-700 font-medium text-xs">Phone Number *</Label>
                <div className="flex gap-2">
                  <select
                    id="countryCode"
                    aria-label="Country Code"
                    value={countryCode}
                    onChange={(e) => handleCountryCodeChange(e.target.value)}
                    className="h-10 px-2.5 border border-slate-300 bg-slate-50 text-slate-900 text-xs font-semibold rounded-xl focus:border-rose-500 focus:ring-rose-500 focus:outline-none shrink-0"
                  >
                    {COUNTRY_CODES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.flag} {c.code}
                      </option>
                    ))}
                  </select>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="9876543210"
                    value={rawPhone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    className="border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:border-rose-500 focus:ring-rose-500 rounded-xl text-sm flex-1"
                  />
                </div>
                {errors.phone && (
                  <p className="text-xs text-red-500 font-medium" id="phone-error">
                    {errors.phone.message as string === "Required" || !rawPhone
                      ? "Phone number is required for account verification."
                      : (errors.phone.message as string)}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-slate-700 font-medium text-xs">Password *</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:border-rose-500 focus:ring-rose-500 pr-10 rounded-xl text-sm"
                    {...register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-red-500 font-medium">{errors.password.message as string}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword" className="text-slate-700 font-medium text-xs">Confirm Password *</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:border-rose-500 focus:ring-rose-500 pr-10 rounded-xl text-sm"
                    {...register("confirmPassword")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-red-500 font-medium">{errors.confirmPassword.message as string}</p>
                )}
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  id="acceptTerms"
                  type="checkbox"
                  className="w-4 h-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                  {...register("acceptTerms")}
                />
                <label htmlFor="acceptTerms" className="text-xs text-slate-600">
                  I accept the{" "}
                  <Link href="/terms" className="text-rose-600 hover:underline font-medium">
                    Terms & Conditions
                  </Link>{" "}
                  and Privacy Policy
                </label>
              </div>
              {errors.acceptTerms && (
                <p className="text-xs text-red-500 font-medium">{errors.acceptTerms.message as string}</p>
              )}

              {/* CAPTCHA Protection Component immediately before Submit */}
              <div className="pt-2">
                <CaptchaWidget
                  refreshKey={captchaRefreshKey}
                  onVerify={(token, code) => {
                    setCaptchaToken(token);
                    setCaptchaCode(code || "");
                    if (code && code.length === 6) setError(null);
                  }}
                  onExpire={() => {
                    setCaptchaToken(null);
                    setCaptchaCode("");
                  }}
                />
              </div>

              <Button
                type="submit"
                disabled={loading || !captchaToken || captchaCode.length < 6}
                className="w-full bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-semibold transition-all shadow-md shadow-rose-600/20 rounded-xl h-11 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? <Spinner className="w-5 h-5 mr-2 text-white" /> : null}
                {loading ? "Creating account..." : "Register / Create Account"}
              </Button>
            </form>
            <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
              Already have an account?{" "}
              <Link href="/login" className="text-rose-600 hover:text-rose-700 font-semibold hover:underline">
                Sign In
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
