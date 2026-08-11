"use client";

import { Suspense, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPasswordSchema } from "@/lib/validators/auth.validator";
import { resetPasswordAction } from "@/lib/actions/password-reset.actions";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams?.get("email") || "";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: "",
      code: "",
      password: "",
    },
  });

  useEffect(() => {
    if (emailParam) {
      setValue("email", emailParam);
    }
  }, [emailParam, setValue]);

  const onSubmit = async (data: any) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await resetPasswordAction(data);
      if (!res.success) {
        setError(res.error || "Failed to reset password");
      } else {
        setSuccess("Password reset successfully! Redirecting to login...");
        setTimeout(() => {
          router.push(`/login?email=${encodeURIComponent(data.email)}`);
        }, 2000);
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
          <CardHeader className="space-y-3 text-center">
            <div className="flex justify-center">
              <div className="relative h-14 w-14 overflow-hidden rounded-2xl border border-rose-500/30 bg-slate-800/80 p-0.5 shadow-lg shadow-rose-500/10">
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
            <CardTitle className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-rose-500 via-pink-500 to-violet-500 bg-clip-text text-transparent">
              Reset Password
            </CardTitle>
            <CardDescription className="text-slate-400">
              Enter the verification code and your new password
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-400 bg-red-950/30 border border-red-900/50 rounded-lg text-center">
                {error}
              </div>
            )}
            {success && (
              <div className="p-3 text-sm text-emerald-400 bg-emerald-950/30 border border-emerald-900/50 rounded-lg text-center">
                {success}
              </div>
            )}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-300">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  className="border-slate-800 bg-slate-950/50 text-white placeholder-slate-500 focus:border-rose-500 focus:ring-rose-500"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-xs text-red-400">{errors.email.message as string}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="code" className="text-slate-300">6-Digit Verification Code</Label>
                <Input
                  id="code"
                  type="text"
                  maxLength={6}
                  placeholder="123456"
                  className="border-slate-800 bg-slate-950/50 text-white placeholder-slate-500 focus:border-rose-500 focus:ring-rose-500 text-center tracking-widest font-bold"
                  {...register("code")}
                />
                {errors.code && (
                  <p className="text-xs text-red-400">{errors.code.message as string}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-300">New Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="border-slate-800 bg-slate-950/50 text-white placeholder-slate-500 focus:border-rose-500 focus:ring-rose-500"
                  {...register("password")}
                />
                {errors.password && (
                  <p className="text-xs text-red-400">{errors.password.message as string}</p>
                )}
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-semibold transition-all shadow-lg shadow-rose-600/30"
              >
                {loading ? <Spinner className="w-5 h-5 mr-2" /> : null}
                Reset Password
              </Button>
            </form>
            <div className="text-center text-sm text-slate-400 mt-4">
              Remembered your password?{" "}
              <Link href="/login" className="text-rose-500 hover:underline font-medium">
                Sign In
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="flex-grow flex items-center justify-center bg-radial from-slate-900 via-slate-950 to-black px-4 py-20">
        <Spinner className="w-8 h-8 text-rose-500" />
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
