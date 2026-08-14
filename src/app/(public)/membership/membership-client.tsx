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
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
          Official Production Subscription Plans
        </span>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
          Choose Your Matchmaking Membership
        </h1>
        <p className="text-base text-slate-600">
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
                  ? "border-rose-600 ring-2 ring-rose-500/20 bg-white shadow-xl scale-[1.02]"
                  : "border-slate-200/90 bg-white hover:border-slate-300 shadow-md"
              }`}
            >
              {isConcierge && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-rose-500 text-white text-xs font-extrabold px-4 py-1 rounded-full uppercase tracking-wider shadow-md">
                  VIP Concierge
                </span>
              )}

              <div>
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                    {plan.name} {isConcierge && <Sparkles className="w-5 h-5 text-amber-500" />}
                  </h3>
                  {isPlanActive && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> ACTIVE
                    </span>
                  )}
                  {isPlanPending && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                      <Clock className="w-3 h-3 animate-pulse" /> PENDING
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-500 mt-2">{plan.description}</p>

                <div className="my-6">
                  <span className="text-4xl font-extrabold text-slate-900">{formatCurrency(plan.price)}</span>
                  <span className="text-sm text-slate-500">
                    {isConcierge ? " / Valid Until Marriage" : ` / ${plan.durationDays} Days`}
                  </span>
                </div>

                <hr className="border-slate-100 my-6" />

                <ul className="space-y-3 text-xs">
                  {plan.features?.map((f: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-slate-700">
                      <Check className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8">
                <Button
                  type="button"
                  variant={isSelected ? "default" : "outline"}
                  className={`w-full font-semibold rounded-xl h-11 transition-all ${
                    isSelected ? "bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/20" : "border-slate-300 text-slate-700 hover:bg-slate-50"
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
      <div id="payment-section" className="max-w-2xl mx-auto pt-4">
        {!user && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50/70 border border-rose-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-rose-100 text-rose-600 rounded-xl">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Sign in to activate your membership</h3>
                <p className="text-xs text-slate-600">
                  Please log in or register to connect your verification payment to your account.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                size="sm"
                onClick={() => router.push(`/login?callbackUrl=${encodeURIComponent("/membership")}`)}
                className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold px-4 py-2 rounded-xl"
              >
                Sign In
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => router.push(`/register?callbackUrl=${encodeURIComponent("/membership")}`)}
                className="border-slate-300 text-slate-700 hover:bg-white text-xs px-3 py-2 rounded-xl"
              >
                Register
              </Button>
            </div>
          </div>
        )}

        <Card className="border border-slate-200/90 bg-white shadow-xl rounded-2xl">
          <CardHeader className="border-b border-slate-100 pb-4">
            <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-rose-600" /> Payment & Verification Details
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Selected Plan: <strong className="text-rose-600 font-semibold">{selectedPlan?.name}</strong> (
              {formatCurrency(selectedPlan?.price)})
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {success ? (
              <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-center space-y-4 shadow-sm">
                <Check className="w-12 h-12 text-emerald-600 mx-auto animate-bounce" />
                <h3 className="text-xl font-bold text-emerald-900">Payment Submitted for Admin Verification!</h3>
                <p className="text-xs text-emerald-800 max-w-md mx-auto leading-relaxed">
                  Your payment verification request for <strong>{selectedPlan?.name}</strong> has been logged. Standard matching and contact unlocks will activate automatically once verified by our administrative team.
                </p>
                <div className="p-3 bg-white rounded-xl border border-emerald-200 text-xs text-emerald-800 font-medium">
                  Status: <strong className="text-emerald-700">PENDING VERIFICATION</strong> (Average turnaround: 2–4 hours)
                </div>
                <div className="pt-2">
                  <Button
                    onClick={() => router.push("/dashboard/billing")}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 rounded-xl"
                  >
                    View Billing History
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitPayment} className="space-y-6">
                {error && (
                  <div className="p-3.5 text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2.5">
                    <AlertCircle className="w-4 h-4 shrink-0" /> <span>{error}</span>
                  </div>
                )}

                {/* Status Callout if plan is already active or pending */}
                {isSelectedPlanActive && (
                  <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-xs flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>
                      You already have an active subscription for this plan (valid until{" "}
                      <strong>{activeMembership?.endDate ? formatDate(activeMembership.endDate) : "active"}</strong>). It can be renewed once expired.
                    </span>
                  </div>
                )}

                {isSelectedPlanPending && (
                  <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2.5">
                    <Clock className="w-4 h-4 text-amber-600 shrink-0 animate-pulse" />
                    <span>
                      Your payment for this plan is currently <strong>Under Verification</strong>. Please wait for moderation before submitting another payment.
                    </span>
                  </div>
                )}

                {/* Simple Payment Number Display */}
                <div className="p-5 rounded-2xl bg-rose-50/40 border border-rose-100 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-rose-100 text-rose-600 rounded-xl">
                        <Smartphone className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs text-slate-500 font-medium">Payment / UPI Number</h4>
                        <p className="text-xl font-extrabold text-slate-900 tracking-wider">{paymentNumber}</p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={handleCopyNumber}
                      className="border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs gap-1.5 h-8 rounded-lg shadow-sm"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      {copied ? "Copied" : "Copy Number"}
                    </Button>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-rose-100 text-xs text-slate-700 space-y-1 leading-relaxed">
                    <p className="font-semibold text-slate-900">Step 1 — Make Payment:</p>
                    <p className="text-slate-600 text-[11px]">
                      Send <strong className="text-rose-600">{formatCurrency(selectedPlan?.price)}</strong> using any UPI app (Google Pay, PhonePe, Paytm, BHIM) to <strong className="text-slate-900">{paymentNumber}</strong>.
                    </p>
                  </div>
                </div>

                {/* Step 2: Verification Details */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Step 2 — Submit Verification Details
                  </h4>

                  {/* Transaction ID / UTR */}
                  <div className="space-y-1.5">
                    <Label htmlFor="utrNumber" className="text-xs text-slate-700 font-medium">
                      Transaction ID / UTR Number <span className="text-rose-600">*</span>
                    </Label>
                    <Input
                      id="utrNumber"
                      type="text"
                      placeholder="e.g. 331489201948 or UPI Ref No."
                      value={utrNumber}
                      onChange={(e) => setUtrNumber(e.target.value)}
                      disabled={loading || isSelectedPlanActive || isSelectedPlanPending}
                      className="border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:border-rose-500 text-xs h-10 rounded-xl"
                      required
                    />
                  </div>

                  {/* Payer Name & Mobile Number in 2-column grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="accountHolder" className="text-xs text-slate-700 font-medium">
                        Payer Name <span className="text-rose-600">*</span>
                      </Label>
                      <Input
                        id="accountHolder"
                        type="text"
                        placeholder="Name on Bank / UPI App"
                        value={accountHolder}
                        onChange={(e) => setAccountHolder(e.target.value)}
                        disabled={loading || isSelectedPlanActive || isSelectedPlanPending}
                        className="border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:border-rose-500 text-xs h-10 rounded-xl"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="mobileNumber" className="text-xs text-slate-700 font-medium">
                        Mobile Number <span className="text-rose-600">*</span>
                      </Label>
                      <Input
                        id="mobileNumber"
                        type="tel"
                        placeholder="+91 9876543210"
                        value={mobileNumber}
                        onChange={(e) => setMobileNumber(e.target.value)}
                        disabled={loading || isSelectedPlanActive || isSelectedPlanPending}
                        className="border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:border-rose-500 text-xs h-10 rounded-xl"
                        required
                      />
                    </div>
                  </div>

                  {/* Screenshot Upload Input */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-slate-700 font-medium flex items-center justify-between">
                      <span>Payment Screenshot (Primary Proof)</span>
                      <span className="text-[10px] text-slate-500">Max 5MB (PNG, JPG, WEBP)</span>
                    </Label>

                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/png,image/jpeg,image/jpg,image/webp"
                      className="hidden"
                      id="screenshot-file-upload"
                      disabled={loading || isSelectedPlanActive || isSelectedPlanPending}
                    />

                    {screenshotBase64 ? (
                      <div className="p-3.5 rounded-xl border border-rose-200 bg-rose-50/40 flex items-center justify-between gap-3 shadow-sm">
                        <div className="flex items-center gap-3 truncate">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={screenshotBase64}
                            alt="Screenshot Preview"
                            className="h-12 w-12 object-cover rounded-lg border border-rose-200 shrink-0"
                          />
                          <div className="truncate">
                            <p className="text-xs font-semibold text-slate-900 truncate">{screenshotFileName || "Screenshot Attached"}</p>
                            <p className="text-[10px] text-emerald-600 flex items-center gap-1 mt-0.5">
                              <Check className="w-3 h-3" /> Image attached & verified
                            </p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={handleRemoveScreenshot}
                          className="text-slate-400 hover:text-red-600 hover:bg-white h-8 px-2"
                          title="Remove screenshot"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <label
                        htmlFor="screenshot-file-upload"
                        className={`flex flex-col items-center justify-center p-5 border border-dashed rounded-xl cursor-pointer transition-colors ${
                          isSelectedPlanActive || isSelectedPlanPending
                            ? "border-slate-200 bg-slate-50 opacity-50 cursor-not-allowed"
                            : "border-slate-300 hover:border-rose-400 bg-slate-50/70 hover:bg-rose-50/30"
                        }`}
                      >
                        <UploadCloud className="w-7 h-7 text-rose-500 mb-1.5" />
                        <span className="text-xs text-slate-800 font-medium">Click or tap to upload payment screenshot</span>
                        <span className="text-[10px] text-slate-500 mt-1">PNG, JPG, or WEBP receipt proof</span>
                      </label>
                    )}
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading || isSelectedPlanActive || isSelectedPlanPending}
                  className="w-full bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-semibold py-6 text-sm rounded-xl shadow-md shadow-rose-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
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
