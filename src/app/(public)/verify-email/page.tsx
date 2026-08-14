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
import Image from "next/image";
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
    } catch {
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
        setError(res.error || "We couldn't send the verification email right now. Please try again later.");
      } else {
        const [userPart, domainPart] = email.split("@");
        const maskedEmail = userPart && domainPart && userPart.length > 0
          ? `${userPart[0]}***@${domainPart}`
          : email;
        setSuccessMsg(`Verification email sent to ${maskedEmail}. Please check your inbox and spam folder.`);
        setCountdown(60); // 60 seconds rate limit resend countdown
      }
    } catch {
      setError("We couldn't send the verification email right now. Please try again later.");
    } finally {
      setResending(false);
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
              Verify Your Email
            </CardTitle>
            <CardDescription className="text-slate-500 text-sm">
              We sent a 6-digit verification code to <span className="text-slate-800 font-semibold">{email}</span>
            </CardDescription>
            <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 text-center">
              Please check your inbox and spam/junk folder. Codes typically arrive within a few seconds.
            </div>
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
                <Label htmlFor="code" className="text-slate-700 font-medium text-xs text-center block">Enter 6-Digit Code</Label>
                <Input
                  id="code"
                  type="text"
                  maxLength={6}
                  placeholder="123456"
                  className="border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:border-rose-500 focus:ring-rose-500 text-center text-2xl tracking-widest font-bold rounded-xl h-12"
                  {...register("code")}
                />
                {errors.code && (
                  <p className="text-xs text-red-500 text-center">{errors.code.message as string}</p>
                )}
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-semibold transition-all shadow-md shadow-rose-600/20 rounded-xl h-11"
              >
                {loading ? <Spinner className="w-5 h-5 mr-2" /> : null}
                Verify Code
              </Button>
            </form>
            <div className="flex flex-col items-center justify-between text-xs text-slate-500 space-y-2 pt-2 border-t border-slate-100">
              <button
                onClick={onResend}
                disabled={resending || countdown > 0}
                className="text-rose-600 hover:underline disabled:text-slate-400 disabled:no-underline font-medium cursor-pointer"
              >
                {countdown > 0 ? `Resend Code in ${countdown}s` : "Resend Verification Code"}
              </button>
              <Link href="/register" className="text-slate-500 hover:text-slate-700 hover:underline">
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
      <div className="flex-grow flex items-center justify-center bg-slate-50 px-4 py-20">
        <Spinner className="w-8 h-8 text-rose-500" />
      </div>
    }>
      <VerifyEmailForm />
    </Suspense>
  );
}
