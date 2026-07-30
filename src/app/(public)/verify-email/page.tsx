"use client";

import { Suspense, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter, useSearchParams } from "next/navigation";
import { verifyOtpAction, requestOtpAction, verifyTokenAction } from "@/lib/actions/verification.actions";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import Link from "next/link";
import { motion } from "framer-motion";

const verifyFormSchema = z.object({
  code: z.string().length(6, "Code must be exactly 6 digits").regex(/^\d+$/, "Code must contain only numbers"),
});

function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams?.get("email") || "";
  const token = searchParams?.get("token") || "";

  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(verifyFormSchema),
    defaultValues: {
      code: "",
    },
  });

  // Auto-verify token from URL parameter if present
  useEffect(() => {
    if (token && email) {
      setLoading(true);
      setError(null);
      setSuccessMsg("Verifying your email link...");
      verifyTokenAction({ email, token }).then((res) => {
        setLoading(false);
        if (res.success) {
          setSuccessMsg("Email verified successfully! Redirecting to login...");
          setTimeout(() => {
            router.push(`/login?verified=true&email=${encodeURIComponent(email)}`);
          }, 2000);
        } else {
          setError(res.error || "Verification link is invalid or expired.");
        }
      }).catch(() => {
        setLoading(false);
        setError("An error occurred while verifying token link.");
      });
    } else if (!email) {
      router.push("/register");
    }
  }, [token, email, router]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const onSubmit = async (data: any) => {
    setLoading(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await verifyOtpAction({
        target: email,
        code: data.code,
        purpose: "EMAIL_VERIFICATION",
      });

      if (!res.success) {
        setError(res.error || "Verification failed");
      } else {
        setSuccessMsg("Email verified successfully! Redirecting to login...");
        setTimeout(() => {
          router.push(`/login?verified=true&email=${encodeURIComponent(email)}`);
        }, 2000);
      }
    } catch (e: any) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const onResend = async () => {
    setResending(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await requestOtpAction({
        target: email,
        purpose: "EMAIL_VERIFICATION",
        type: "email",
      });

      if (!res.success) {
        setError(res.error || "Resending OTP failed");
      } else {
        setSuccessMsg("A new verification code has been sent to your email.");
        setCountdown(60); // 60 seconds rate limit resend countdown
      }
    } catch (e: any) {
      setError("Failed to resend code");
    } finally {
      setResending(false);
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
              Verify Your Email
            </CardTitle>
            <CardDescription className="text-slate-400">
              We sent a 6-digit verification code to <span className="text-slate-200 font-semibold">{email}</span>
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
                <Label htmlFor="code" className="text-slate-300">6-Digit Code</Label>
                <Input
                  id="code"
                  type="text"
                  maxLength={6}
                  placeholder="123456"
                  className="border-slate-800 bg-slate-950/50 text-white placeholder-slate-500 focus:border-rose-500 focus:ring-rose-500 text-center text-2xl tracking-widest font-bold"
                  {...register("code")}
                />
                {errors.code && (
                  <p className="text-xs text-red-400 text-center">{errors.code.message as string}</p>
                )}
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-semibold transition-all shadow-lg shadow-rose-600/30"
              >
                {loading ? <Spinner className="w-5 h-5 mr-2" /> : null}
                Verify Code
              </Button>
            </form>
            <div className="flex flex-col items-center justify-between text-sm text-slate-400 space-y-2 mt-4">
              <button
                onClick={onResend}
                disabled={resending || countdown > 0}
                className="text-rose-500 hover:underline disabled:text-slate-600 disabled:no-underline font-medium"
              >
                {countdown > 0 ? `Resend Code in ${countdown}s` : "Resend Verification Code"}
              </button>
              <Link href="/register" className="text-slate-500 hover:underline">
                Back to Register
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="flex-grow flex items-center justify-center bg-radial from-slate-900 via-slate-950 to-black px-4 py-20">
        <Spinner className="w-8 h-8 text-rose-500" />
      </div>
    }>
      <VerifyEmailForm />
    </Suspense>
  );
}
