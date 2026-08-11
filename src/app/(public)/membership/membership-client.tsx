"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { submitManualPaymentAction } from "@/lib/actions/membership.actions";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import {
  Check,
  ShieldCheck,
  Sparkles,
  AlertCircle,
  Smartphone,
  Copy,
  UploadCloud,
  Image as ImageIcon,
  Clock,
  CheckCircle2,
  X,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils/format";

export function MembershipClient({
  plans,
  user,
  paymentNumber = "9000906292",
  activeMembership = null,
  pendingPayments = [],
}: {
  plans: any[];
  user: any;
  paymentNumber?: string;
  activeMembership?: any;
  pendingPayments?: any[];
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [selectedPlan, setSelectedPlan] = useState<any>(plans && plans.length > 0 ? plans[0] : null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  // Form Fields for Manual Verification
  const [utrNumber, setUtrNumber] = useState("");
  const [accountHolder, setAccountHolder] = useState(user?.name || "");
  const [mobileNumber, setMobileNumber] = useState(user?.phone || "");
  const [screenshotBase64, setScreenshotBase64] = useState<string | null>(null);
  const [screenshotFileName, setScreenshotFileName] = useState<string | null>(null);

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
    const rawDigits = paymentNumber.replace(/[^0-9+]/g, "");
    navigator.clipboard.writeText(rawDigits || paymentNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file (PNG, JPG, JPEG, WEBP).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Payment screenshot must be smaller than 5MB.");
      return;
    }

    setError(null);
    setScreenshotFileName(file.name);

    const reader = new FileReader();
    reader.onload = () => {
      setScreenshotBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveScreenshot = () => {
    setScreenshotBase64(null);
    setScreenshotFileName(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Determine state of selected plan
  const isSelectedPlanPending = !!(
    selectedPlan &&
    pendingPayments.some((p: any) => p.planId === selectedPlan.id && p.status === "PENDING")
  );

  const isSelectedPlanActive = !!(
    selectedPlan &&
    activeMembership &&
    activeMembership.planId === selectedPlan.id &&
    activeMembership.status === "ACTIVE" &&
    new Date(activeMembership.endDate) > new Date()
  );

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      router.push("/login?callbackUrl=/membership");
      return;
    }

    if (!selectedPlan) {
      setError("Please select a membership plan.");
      return;
    }

    if (isSelectedPlanPending) {
      setError(`Your payment for ${selectedPlan.name} is currently under verification. Please wait for validation.`);
      return;
    }

    if (isSelectedPlanActive) {
      setError("This membership is already active. Please wait until it expires before renewing.");
      return;
    }

    if (!utrNumber.trim()) {
      setError("Please enter the UPI Transaction ID / UTR reference number.");
      return;
    }

    if (!accountHolder.trim()) {
      setError("Please enter the Payer Name as shown on the payment app.");
      return;
    }

    if (!mobileNumber.trim()) {
      setError("Please enter your Phone / WhatsApp number.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await submitManualPaymentAction({
        planId: selectedPlan.id,
        paymentMethod: `MANUAL_UPI (Phone: ${mobileNumber.trim()})`,
        utrNumber: utrNumber.trim(),
        receiptUrl: screenshotBase64 || undefined,
        accountHolder: accountHolder.trim(),
        bankName: `Mobile: ${mobileNumber.trim()}`,
      });

      if (res.success) {
        setSuccess(true);
      } else {
        setError(res.error || "Failed to submit payment details. Please try again.");
      }
    } catch {
      setError("An unexpected error occurred while submitting payment verification.");
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
          const isPlanPending = pendingPayments.some((p: any) => p.planId === plan.id && p.status === "PENDING");
          const isPlanActive =
            activeMembership?.planId === plan.id &&
            activeMembership.status === "ACTIVE" &&
            new Date(activeMembership.endDate) > new Date();

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
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
                    {plan.name} {isConcierge && <Sparkles className="w-5 h-5 text-amber-400" />}
                  </h3>
                  {isPlanActive && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> ACTIVE
                    </span>
                  )}
                  {isPlanPending && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                      <Clock className="w-3 h-3 animate-pulse" /> PENDING
                    </span>
                  )}
                </div>

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
                  {isPlanActive
                    ? "Currently Active"
                    : isPlanPending
                    ? "Verification Pending"
                    : isSelected
                    ? "Selected Plan"
                    : "Select Plan"}
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
              <ShieldCheck className="w-5 h-5 text-rose-500" /> Payment & Verification Details
            </CardTitle>
            <CardDescription className="text-xs">
              Selected Plan: <strong className="text-rose-400">{selectedPlan?.name}</strong> (
              {formatCurrency(selectedPlan?.price)})
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {success ? (
              <div className="p-6 rounded-2xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-center space-y-4 shadow-lg shadow-emerald-950/20">
                <Check className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
                <h3 className="text-xl font-bold text-emerald-200">Payment Submitted for Admin Verification!</h3>
                <p className="text-xs text-emerald-200/80 max-w-md mx-auto leading-relaxed">
                  Your payment verification request for <strong>{selectedPlan?.name}</strong> has been logged. Standard matching and contact unlocks will activate automatically once verified by our administrative team.
                </p>
                <div className="p-3 bg-emerald-900/30 rounded-xl border border-emerald-700/40 text-xs text-emerald-300 font-medium">
                  Status: <strong>PENDING VERIFICATION</strong> (Average turnaround: 2–4 hours)
                </div>
                <div className="pt-2">
                  <Button
                    onClick={() => router.push("/dashboard/billing")}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-6"
                  >
                    View Billing History
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitPayment} className="space-y-6">
                {error && (
                  <div className="p-3.5 text-xs text-red-400 bg-red-950/40 border border-red-900 rounded-xl flex items-center gap-2.5">
                    <AlertCircle className="w-4 h-4 shrink-0" /> <span>{error}</span>
                  </div>
                )}

                {/* Status Callout if plan is already active or pending */}
                {isSelectedPlanActive && (
                  <div className="p-3.5 rounded-xl bg-blue-950/40 border border-blue-800/60 text-blue-200 text-xs flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                    <span>
                      You already have an active subscription for this plan (valid until{" "}
                      <strong>{activeMembership?.endDate ? formatDate(activeMembership.endDate) : "active"}</strong>). It can be renewed once expired.
                    </span>
                  </div>
                )}

                {isSelectedPlanPending && (
                  <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-800/60 text-amber-200 text-xs flex items-center gap-2.5">
                    <Clock className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
                    <span>
                      Your payment for this plan is currently <strong>Under Verification</strong>. Please wait for moderation before submitting another payment.
                    </span>
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
                        <p className="text-xl font-extrabold text-white tracking-wider">{paymentNumber}</p>
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
                      {copied ? "Copied" : "Copy Number"}
                    </Button>
                  </div>

                  <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/80 text-xs text-slate-300 space-y-1 leading-relaxed">
                    <p className="font-semibold text-slate-200">Step 1 — Make Payment:</p>
                    <p className="text-slate-400 text-[11px]">
                      Send <strong className="text-rose-400">{formatCurrency(selectedPlan?.price)}</strong> using any UPI app (Google Pay, PhonePe, Paytm, BHIM) to <strong className="text-white">{paymentNumber}</strong>.
                    </p>
                  </div>
                </div>

                {/* Step 2: Verification Details */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Step 2 — Submit Verification Details
                  </h4>

                  {/* Transaction ID / UTR */}
                  <div className="space-y-1.5">
                    <Label htmlFor="utrNumber" className="text-xs text-slate-300">
                      Transaction ID / UTR Number <span className="text-rose-500">*</span>
                    </Label>
                    <Input
                      id="utrNumber"
                      type="text"
                      placeholder="e.g. 331489201948 or UPI Ref No."
                      value={utrNumber}
                      onChange={(e) => setUtrNumber(e.target.value)}
                      disabled={loading || isSelectedPlanActive || isSelectedPlanPending}
                      className="border-slate-800 bg-slate-950/60 text-white placeholder-slate-500 focus:border-rose-500 text-xs h-10"
                      required
                    />
                  </div>

                  {/* Payer Name & Mobile Number in 2-column grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="accountHolder" className="text-xs text-slate-300">
                        Payer Name <span className="text-rose-500">*</span>
                      </Label>
                      <Input
                        id="accountHolder"
                        type="text"
                        placeholder="Name on Bank / UPI App"
                        value={accountHolder}
                        onChange={(e) => setAccountHolder(e.target.value)}
                        disabled={loading || isSelectedPlanActive || isSelectedPlanPending}
                        className="border-slate-800 bg-slate-950/60 text-white placeholder-slate-500 focus:border-rose-500 text-xs h-10"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="mobileNumber" className="text-xs text-slate-300">
                        Mobile Number <span className="text-rose-500">*</span>
                      </Label>
                      <Input
                        id="mobileNumber"
                        type="tel"
                        placeholder="+91 9876543210"
                        value={mobileNumber}
                        onChange={(e) => setMobileNumber(e.target.value)}
                        disabled={loading || isSelectedPlanActive || isSelectedPlanPending}
                        className="border-slate-800 bg-slate-950/60 text-white placeholder-slate-500 focus:border-rose-500 text-xs h-10"
                        required
                      />
                    </div>
                  </div>

                  {/* Screenshot Upload Input */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-slate-300 flex items-center justify-between">
                      <span>Payment Screenshot (Primary Proof)</span>
                      <span className="text-[10px] text-slate-500">Max 5MB</span>
                    </Label>

                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*"
                      className="hidden"
                      id="screenshot-file-upload"
                      disabled={loading || isSelectedPlanActive || isSelectedPlanPending}
                    />

                    {screenshotBase64 ? (
                      <div className="p-3 rounded-xl border border-rose-500/30 bg-slate-950 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 truncate">
                          <ImageIcon className="w-4 h-4 text-rose-400 shrink-0" />
                          <span className="text-xs text-slate-200 truncate">{screenshotFileName || "Screenshot Attached"}</span>
                        </div>
                        <button
                          type="button"
                          onClick={handleRemoveScreenshot}
                          className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
                          title="Remove screenshot"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <label
                        htmlFor="screenshot-file-upload"
                        className={`flex flex-col items-center justify-center p-4 border border-dashed rounded-xl cursor-pointer transition-colors ${
                          isSelectedPlanActive || isSelectedPlanPending
                            ? "border-slate-800 bg-slate-950/20 opacity-50 cursor-not-allowed"
                            : "border-slate-800 hover:border-rose-500/50 bg-slate-950/40 hover:bg-slate-950"
                        }`}
                      >
                        <UploadCloud className="w-6 h-6 text-slate-400 mb-1" />
                        <span className="text-xs text-slate-300 font-medium">Click to upload screenshot</span>
                        <span className="text-[10px] text-slate-500 mt-0.5">PNG, JPG, or WEBP receipt proof</span>
                      </label>
                    )}
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading || isSelectedPlanActive || isSelectedPlanPending}
                  className="w-full bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-semibold py-6 text-sm rounded-xl shadow-lg shadow-rose-600/30 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Spinner className="w-5 h-5 mr-2" /> Submitting Verification...
                    </>
                  ) : isSelectedPlanActive ? (
                    "Plan Currently Active"
                  ) : isSelectedPlanPending ? (
                    "Verification Pending"
                  ) : (
                    "Submit Payment for Verification"
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
