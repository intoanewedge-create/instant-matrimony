"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { submitManualPaymentAction } from "@/lib/actions/membership.actions";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Check, QrCode, Building2, ShieldCheck, Sparkles, AlertCircle } from "lucide-react";
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

  useEffect(() => {
    if (plans && plans.length > 0) {
      const params = new URLSearchParams(window.location.search);
      const planIdParam = params.get("planId");
      if (planIdParam) {
        const found = plans.find(p => p.id === planIdParam);
        if (found) {
          setSelectedPlan(found);
          return;
        }
      }
      setSelectedPlan((current: any) => current || plans[0]);
    }
  }, [plans]);
  const [paymentMethod, setPaymentMethod] = useState<"QR_CODE" | "BANK_TRANSFER">("QR_CODE");
  const [utrNumber, setUtrNumber] = useState("");
  const [receiptUrl, setReceiptUrl] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountHolder, setAccountHolder] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

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

    if (!utrNumber.trim()) {
      setError("Please enter the UTR or Bank Transaction Reference Number");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await submitManualPaymentAction({
        planId: selectedPlan.id,
        paymentMethod,
        utrNumber,
        receiptUrl,
        bankName,
        accountHolder,
      });

      if (res.success) {
        setSuccess(true);
      } else {
        setError(res.error || "Failed to submit payment details");
      }
    } catch {
      setError("An error occurred while submitting payment proof");
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

      {/* Manual Payment Section */}
      <div id="payment-section" className="max-w-2xl mx-auto pt-8">
        <Card className="border border-slate-800 bg-slate-900/80 backdrop-blur-xl shadow-2xl">
          <CardHeader className="border-b border-slate-800 pb-4">
            <CardTitle className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-rose-500" /> Manual Payment & Verification
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
                  Your UTR reference (<strong>{utrNumber}</strong>) has been logged. Our payment team will verify the transfer within 2–4 hours and automatically activate your membership.
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

                {/* Method Switcher */}
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("QR_CODE")}
                    className={`p-4 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all ${
                      paymentMethod === "QR_CODE"
                        ? "border-rose-500 bg-rose-950/30 text-rose-300"
                        : "border-slate-800 bg-slate-950/50 text-slate-400"
                    }`}
                  >
                    <QrCode className="w-4 h-4" /> UPI / QR Code Payment
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("BANK_TRANSFER")}
                    className={`p-4 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all ${
                      paymentMethod === "BANK_TRANSFER"
                        ? "border-rose-500 bg-rose-950/30 text-rose-300"
                        : "border-slate-800 bg-slate-950/50 text-slate-400"
                    }`}
                  >
                    <Building2 className="w-4 h-4" /> Bank Account Transfer
                  </button>
                </div>

                {/* Account Details Box */}
                {paymentMethod === "QR_CODE" ? (
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 text-center">
                    <div className="w-40 h-40 bg-white rounded-lg mx-auto p-2 flex items-center justify-center">
                      <QrCode className="w-32 h-32 text-slate-950" />
                    </div>
                    <div className="text-xs text-slate-300 space-y-1">
                      <p className="font-semibold text-rose-400">UPI ID: instantmatrimony@upi</p>
                      <p className="text-[11px] text-slate-400">Scan QR Code using Google Pay, PhonePe, or Paytm</p>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs text-slate-300">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Account Holder:</span>
                      <span className="font-bold text-white">InstantMatrimony Tech Pvt Ltd</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Bank Name:</span>
                      <span className="font-bold text-white">HDFC Bank Ltd</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Account Number:</span>
                      <span className="font-mono text-rose-400 font-bold">50200088991122</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">IFSC Code:</span>
                      <span className="font-mono text-white font-bold">HDFC0001234</span>
                    </div>
                  </div>
                )}

                {/* Inputs */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="utrNumber" className="text-xs text-slate-200 font-medium">
                      UTR / Bank Transaction Reference Number *
                    </Label>
                    <Input
                      id="utrNumber"
                      type="text"
                      placeholder="e.g. 329188204910 or UTR129038192"
                      value={utrNumber}
                      onChange={(e) => setUtrNumber(e.target.value)}
                      className="border-slate-800 bg-slate-950/60 text-white"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="receiptUrl" className="text-xs text-slate-200 font-medium">
                      Screenshot / Receipt Image URL (Optional)
                    </Label>
                    <Input
                      id="receiptUrl"
                      type="text"
                      placeholder="e.g. https://storage.com/receipt.jpg"
                      value={receiptUrl}
                      onChange={(e) => setReceiptUrl(e.target.value)}
                      className="border-slate-800 bg-slate-950/60 text-white"
                    />
                  </div>

                  {paymentMethod === "BANK_TRANSFER" && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="bankName" className="text-xs text-slate-200 font-medium">Your Bank Name</Label>
                        <Input
                          id="bankName"
                          type="text"
                          placeholder="e.g. ICICI Bank"
                          value={bankName}
                          onChange={(e) => setBankName(e.target.value)}
                          className="border-slate-800 bg-slate-950/60 text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="accountHolder" className="text-xs text-slate-200 font-medium">Sender Name</Label>
                        <Input
                          id="accountHolder"
                          type="text"
                          placeholder="e.g. Rahul Sharma"
                          value={accountHolder}
                          onChange={(e) => setAccountHolder(e.target.value)}
                          className="border-slate-800 bg-slate-950/60 text-white"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-semibold shadow-lg shadow-rose-600/30"
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
