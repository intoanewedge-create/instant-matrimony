"use client";

import { Suspense, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@/lib/validators/auth.validator";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Spinner } from "@/components/ui/spinner";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const emailParam = searchParams?.get("email") || "";
  const verifiedParam = searchParams?.get("verified") === "true";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<React.ReactNode | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  useEffect(() => {
    if (emailParam) {
      setValue("email", emailParam);
    }

    if (verifiedParam) {
      setSuccessMsg("Email verified successfully! You can now log in.");
    }
  }, [emailParam, verifiedParam, setValue]);

  const onSubmit = async (data: any) => {
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password,
        rememberMe: data.rememberMe ? "true" : "false",
      });

      if (res?.error) {
        const isUnverified =
          res.error.includes("EMAIL_UNVERIFIED") ||
          res.error.includes("unverified") ||
          res.error === "CallbackRouteError" ||
          res.error.includes("CallbackRoute") ||
          (res as any).code === "EMAIL_UNVERIFIED";

        const isUnavailable =
          res.error.includes("ACCOUNT_UNAVAILABLE") ||
          (res as any).code === "ACCOUNT_UNAVAILABLE";

        if (isUnverified) {
          setError(
            <span>
              Please verify your email before signing in. Check your inbox for the verification code.{" "}
              <Link
                href={`/verify-email?email=${encodeURIComponent(data.email)}`}
                className="text-rose-400 underline font-semibold ml-1"
              >
                Click here to verify.
              </Link>
            </span>,
          );
        } else if (isUnavailable) {
          setError("Your account is currently unavailable. Please contact support.");
        } else {
          setError("Invalid email or password. Please check your credentials and try again.");
        }
      } else {
        window.location.href = res?.url || "/dashboard";
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-grow flex items-center justify-center bg-gradient-to-b from-rose-50/50 via-slate-50 to-white px-4 py-16 sm:py-24">
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
              Welcome Back
            </CardTitle>

            <CardDescription className="text-slate-500 text-sm">
              Sign in to find your perfect partner
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 pt-2">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl text-center">
                {error}
              </div>
            )}

            {successMsg && (
              <div className="p-3 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
                {successMsg}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-700 font-medium text-xs">
                  Email Address
                </Label>

                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  className="border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:border-rose-500 focus:ring-rose-500 rounded-xl text-sm"
                  {...register("email")}
                />

                {errors.email && (
                  <p className="text-xs text-red-500">
                    {errors.email.message as string}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password" className="text-slate-700 font-medium text-xs">
                    Password
                  </Label>

                  <Link
                    href="/forgot-password"
                    className="text-xs text-rose-600 hover:text-rose-700 hover:underline font-medium"
                  >
                    Forgot Password?
                  </Link>
                </div>

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
                  <p className="text-xs text-red-500">
                    {errors.password.message as string}
                  </p>
                )}
              </div>

              {/* Remember Me */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="rememberMe"
                  checked={!!watch("rememberMe")}
                  onChange={(e) =>
                    setValue("rememberMe", e.target.checked)
                  }
                  className="border-slate-300"
                />

                <Label
                  htmlFor="rememberMe"
                  className="text-xs text-slate-600 cursor-pointer select-none"
                >
                  Remember me for 30 days
                </Label>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-semibold transition-all shadow-md shadow-rose-600/20 rounded-xl h-11"
              >
                {loading ? <Spinner className="w-5 h-5 mr-2" /> : null}
                Sign In
              </Button>
            </form>

            <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-rose-600 hover:text-rose-700 font-semibold hover:underline">
                Create account
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-grow flex items-center justify-center bg-slate-50 px-4 py-20">
          <Spinner className="w-8 h-8 text-rose-500" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
