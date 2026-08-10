"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { submitManualPaymentAction } from "@/lib/actions/membership.actions";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Check, ShieldCheck, Sparkles, AlertCircle, Smartphone, Copy } from "lucide-react";
import { formatCurrency } from "@/lib/utils/format";

export function MembershipClient({
  plans,
  user,
}: {
  plans: any[];
  user: any;
}) {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<any>(plans && plans.length > 0 ? plans[0] : null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (plans && plans.length > 0) {
      const params = new URLSearchParams(window.location.search);
      const planIdParam = params.get("planId");
      if (planIdParam) {
        const found = plans.find((p) => p.id === planIdParam);
        if (found) {
          setSelectedPlan(found);
          return;
        }
      }
      setSelectedPlan((current: any) => current || plans[0]);
    }
  }, [plans]);

  const handleCopyNumber = () => {
    navigator.clipboard.writeText("8885678080");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push("/login?callbackUrl=/membership");
      return;
    }

    if (!selectedPlan) {
      setError("Please select a membership plan");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await submitManualPaymentAction({
        planId: selectedPlan.id,
        paymentMethod: "MANUAL_UPI",
      });

      if (res.success) {
        setSuccess(true);
      } else {
        setError(res.error || "Failed to submit payment details");
      }
    } catch {
      setError("An error occurred while submitting payment verification");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-12">
      {/* Title */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
          Official Production Subscription Plans
        </span>
        <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
          Choose Your Matchmaking Membership
        </h1>
        <p className="text-base text-slate-400">
          Select between our self-guided Standard plan or our dedicated Relationship Manager Concierge service.
        </p>
      </div>

      {/* Plans Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {plans.map((plan) => {
          const isConcierge = plan.name.toLowerCase().includes("concierge") || plan.price >= 100000;
          const isSelected = selectedPlan?.id === plan.id;

          return (
            <Card
              key={plan.id}
              onClick={() => setSelectedPlan(plan)}
              className={`relative border rounded-3xl p-8 flex flex-col justify-between cursor-pointer transition-all ${
                isSelected
                  ? "border-rose-500 ring-2 ring-rose-500/30 bg-slate-900 shadow-2xl scale-[1.02]"
                  : "border-slate-800 bg-slate-900/40 hover:border-slate-700"
              }`}
            >
              {isConcierge && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-rose-500 text-slate-950 text-xs font-extrabold px-4 py-1 rounded-full uppercase tracking-wider shadow-lg">
                  VIP Concierge
                </span>
              )}

              <div>
                <h3 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
                  {plan.name} {isConcierge && <Sparkles className="w-5 h-5 text-amber-400" />}
                </h3>
                <p className="text-xs text-slate-400 mt-2">{plan.description}</p>

                <div className="my-6">
                  <span className="text-4xl font-extrabold text-white">{formatCurrency(plan.price)}</span>
                  <span className="text-sm text-slate-400"> / {plan.durationDays} Days</span>
                </div>

                <hr className="border-slate-800 my-6" />

                <ul className="space-y-3 text-xs">
                  {plan.features?.map((f: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-slate-300">
                      <Check className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8">
                <Button
                  type="button"
                  variant={isSelected ? "default" : "outline"}
                  className={`w-full font-semibold ${
                    isSelected ? "bg-rose-600 hover:bg-rose-500 text-white" : "border-slate-700 text-slate-300"
                  }`}
                >
                  {isSelected ? "Selected Plan" : "Select Plan"}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Payment Section */}
      <div id="payment-section" className="max-w-2xl mx-auto pt-8">
        <Card className="border border-slate-800 bg-slate-900/80 backdrop-blur-xl shadow-2xl">
          <CardHeader className="border-b border-slate-800 pb-4">
            <CardTitle className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-rose-500" /> Payment & Membership Activation
            </CardTitle>
            <CardDescription className="text-xs">
              Selected Plan: <strong className="text-rose-400">{selectedPlan?.name}</strong> ({formatCurrency(selectedPlan?.price)})
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {success ? (
              <div className="p-6 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-center space-y-3">
                <Check className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
                <h3 className="text-xl font-bold text-emerald-200">Payment Submitted for Admin Verification!</h3>
                <p className="text-xs text-emerald-200/80 max-w-md mx-auto">
                  Your payment request for <strong>{selectedPlan?.name}</strong> has been logged. Our payment team will verify the transfer within 2–4 hours and automatically activate your membership.
                </p>
                <div className="pt-3">
                  <Button onClick={() => router.push("/dashboard")} className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold">
                    Go to Dashboard
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitPayment} className="space-y-6">
                {error && (
                  <div className="p-3 text-xs text-red-400 bg-red-950/40 border border-red-900 rounded-lg flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                  </div>
                )}

                {/* Simple Payment Number Display */}
                <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-rose-500/10 text-rose-400 rounded-xl">
                        <Smartphone className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs text-slate-400 font-medium">Payment / UPI Number</h4>
                        <p className="text-xl font-extrabold text-white tracking-wider">8885678080</p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={handleCopyNumber}
                      className="border-slate-800 text-slate-300 hover:bg-slate-850 hover:text-white text-xs gap-1.5 h-8"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      {copied ? "Copied" : "Copy"}
                    </Button>
                  </div>

                  <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/80 text-xs text-slate-300 space-y-1 leading-relaxed">
                    <p className="font-semibold text-slate-200">Payment Instructions:</p>
                    <p className="text-slate-400 text-[11px]">
                      Send <strong className="text-rose-400">{formatCurrency(selectedPlan?.price)}</strong> using any UPI app (Google Pay, PhonePe, Paytm, BHIM) to the payment number <strong className="text-white">8885678080</strong>.
                    </p>
                    <p className="text-slate-400 text-[11px]">
                      After sending the payment, click the button below to submit your payment verification request.
                    </p>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-semibold py-6 text-sm rounded-xl shadow-lg shadow-rose-600/30"
                >
                  {loading ? <Spinner className="w-5 h-5 mr-2" /> : null} Submit Payment for Verification
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
