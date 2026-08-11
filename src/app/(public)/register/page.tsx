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

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      acceptTerms: false,
    },
  });

  const onSubmit = async (data: any) => {
    setLoading(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await registerAction(data);
      if (!res.success) {
        setError(res.error || "Registration failed. Please check your details.");
      } else {
        setSuccessMsg("Registration successful! Redirecting to email verification...");
        router.push(`/verify-email?email=${encodeURIComponent(data.email)}`);
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-grow flex items-center justify-center bg-gradient-to-b from-slate-900 via-slate-950 to-black px-4 py-12">
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
              Create Account
            </CardTitle>
            <CardDescription className="text-slate-400">
              Start your journey to find your life partner today
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
                <Label htmlFor="name" className="text-slate-300">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  className="border-slate-800 bg-slate-950/50 text-white placeholder-slate-500 focus:border-rose-500 focus:ring-rose-500"
                  {...register("name")}
                />
                {errors.name && (
                  <p className="text-xs text-red-400">{errors.name.message as string}</p>
                )}
              </div>
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
                <Label htmlFor="phone" className="text-slate-300">Phone Number (Optional)</Label>
                <Input
                  id="phone"
                  type="text"
                  placeholder="+919876543210"
                  className="border-slate-800 bg-slate-950/50 text-white placeholder-slate-500 focus:border-rose-500 focus:ring-rose-500"
                  {...register("phone")}
                />
                {errors.phone && (
                  <p className="text-xs text-red-400">{errors.phone.message as string}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-300">Password</Label>
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
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-slate-300">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  className="border-slate-800 bg-slate-950/50 text-white placeholder-slate-500 focus:border-rose-500 focus:ring-rose-500"
                  {...register("confirmPassword")}
                />
                {errors.confirmPassword && (
                  <p className="text-xs text-red-400">{errors.confirmPassword.message as string}</p>
                )}
              </div>
              <div className="flex items-center space-x-2 pt-2">
                <input
                  id="acceptTerms"
                  type="checkbox"
                  className="w-4 h-4 rounded border-slate-800 bg-slate-950/50 text-rose-600 focus:ring-rose-500"
                  {...register("acceptTerms")}
                />
                <label htmlFor="acceptTerms" className="text-xs text-slate-400">
                  I accept the{" "}
                  <Link href="/terms" className="text-rose-500 hover:underline">
                    Terms & Conditions
                  </Link>{" "}
                  and Privacy Policy
                </label>
              </div>
              {errors.acceptTerms && (
                <p className="text-xs text-red-400">{errors.acceptTerms.message as string}</p>
              )}
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-semibold transition-all shadow-lg shadow-rose-600/30"
              >
                {loading ? <Spinner className="w-5 h-5 mr-2" /> : null}
                Get Started
              </Button>
            </form>
            <div className="text-center text-sm text-slate-400">
              Already have an account?{" "}
              <Link href="/login" className="text-rose-500 hover:underline">
                Sign In
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
