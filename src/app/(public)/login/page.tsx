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
import { motion } from "framer-motion";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const emailParam = searchParams?.get("email") || "";
  const verifiedParam = searchParams?.get("verified") === "true";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<React.ReactNode | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

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
        } else {
          setError("Invalid email or password.");
        }
      } else {
        window.location.href = "/dashboard";
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-grow flex items-center justify-center bg-gradient-to-b from-slate-900 via-slate-950 to-black px-4 py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="border border-slate-800 bg-slate-900/60 backdrop-blur-xl shadow-2xl shadow-rose-950/20">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-rose-500 via-pink-500 to-violet-500 bg-clip-text text-transparent">
              Welcome Back
            </CardTitle>

            <CardDescription className="text-slate-400">
              Sign in to find your perfect partner
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-400 bg-red-950/30 border border-red-900/50 rounded-lg text-center">
                {error}
              </div>
            )}

            {successMsg && (
              <div className="p-3 text-sm text-emerald-400 bg-emerald-950/30 border border-emerald-900/50 rounded-lg text-center">
                {successMsg}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-300">
                  Email Address
                </Label>

                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  className="border-slate-800 bg-slate-950/50 text-white placeholder-slate-500 focus:border-rose-500 focus:ring-rose-500"
                  {...register("email")}
                />

                {errors.email && (
                  <p className="text-xs text-red-400">
                    {errors.email.message as string}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password" className="text-slate-300">
                    Password
                  </Label>

                  <Link
                    href="/forgot-password"
                    className="text-xs text-rose-500 hover:underline"
                  >
                    Forgot Password?
                  </Link>
                </div>

                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="border-slate-800 bg-slate-950/50 text-white placeholder-slate-500 focus:border-rose-500 focus:ring-rose-500"
                  {...register("password")}
                />

                {errors.password && (
                  <p className="text-xs text-red-400">
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
                  className="border-slate-700"
                />

                <Label
                  htmlFor="rememberMe"
                  className="text-sm text-slate-300 cursor-pointer select-none"
                >
                  Remember me for 30 days
                </Label>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-semibold transition-all shadow-lg shadow-rose-600/30"
              >
                {loading ? <Spinner className="w-5 h-5 mr-2" /> : null}
                Sign In
              </Button>
            </form>

            <div className="text-center text-sm text-slate-400">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-rose-500 hover:underline">
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
        <div className="flex-grow flex items-center justify-center bg-gradient-to-b from-slate-900 via-slate-950 to-black px-4 py-20">
          <Spinner className="w-8 h-8 text-rose-500" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
