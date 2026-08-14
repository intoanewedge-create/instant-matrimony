"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Zap, CreditCard, Calendar, Check, Download, AlertCircle, Trash2, Clock } from "lucide-react";
import { Card, CardHeader, CardContent, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createCheckoutAction, cancelSubscriptionAction } from "@/lib/actions/billing.actions";
import { formatDate, formatCurrency } from "@/lib/utils/format";

export function BillingClient({ plans, activeMembership, invoices, payments = [] }: any) {
  const router = useRouter();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleCheckout = async (planId: string, price: number) => {
    router.push(`/membership?planId=${planId}`);
  };

  const handleCancelSubscription = async () => {
    if (!activeMembership) return;
    if (!confirm("Are you sure you want to cancel your premium subscription?")) return;

    setCancelling(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await cancelSubscriptionAction(activeMembership.id);
      if (res.success) {
        setSuccess("Subscription successfully set to cancel at the end of the billing period.");
        router.refresh();
      } else {
        setError(res.error || "Failed to cancel subscription");
      }
    } catch (e: any) {
      setError(e.message || "An unexpected error occurred");
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl space-y-10 text-slate-900">
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
          Billing & Premium Plans
        </h1>
        <p className="text-slate-500 text-sm">
          Upgrade your plan, manage active subscriptions, and view your billing history.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-center gap-3 text-red-700 text-sm shadow-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-emerald-700 text-sm shadow-sm">
          <Check className="w-5 h-5 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Pending & Rejected Manual Payments Banners */}
      {payments.filter((p: any) => p.status === "PENDING").map((p: any) => (
        <div key={p.id} className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg text-amber-700 shrink-0">
              <Clock className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-amber-900">Payment Verification Pending</h3>
              <p className="text-xs text-amber-700">
                Your payment of <strong>{formatCurrency(p.amount)}</strong>{p.utrNumber ? ` (Ref: ${p.utrNumber})` : ""} is under review. Standard matching controls will activate once verified.
              </p>
            </div>
          </div>
          <span className="px-3 py-1 text-xs font-bold rounded-full bg-amber-100 border border-amber-300 text-amber-800 shrink-0">
            PENDING VERIFICATION
          </span>
        </div>
      ))}

      {payments.filter((p: any) => p.status === "FAILED" && p.rejectionReason).map((p: any) => (
        <div key={p.id} className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg text-red-700 shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-red-900">Payment Rejected</h3>
              <p className="text-xs text-red-700">
                Your payment request{p.utrNumber ? ` (Ref: ${p.utrNumber})` : ""} was rejected. Reason: <strong>{p.rejectionReason}</strong>. Please check details and submit again.
              </p>
            </div>
          </div>
          <span className="px-3 py-1 text-xs font-bold rounded-full bg-red-100 border border-red-300 text-red-800 shrink-0 font-mono">
            REJECTED
          </span>
        </div>
      ))}

      {/* Active Membership Status */}
      <Card className="border border-slate-200 bg-white shadow-sm overflow-hidden relative">
        <div className="absolute right-0 top-0 bottom-0 w-1/4 bg-gradient-to-r from-rose-100/30 to-transparent blur-2xl pointer-events-none" />
        <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <CardTitle className="text-xl font-bold flex items-center gap-2 text-slate-900">
              <CreditCard className="w-5 h-5 text-rose-600" />
              Active Plan Summary
            </CardTitle>
            <CardDescription className="text-slate-500">Your current membership benefits and status</CardDescription>
          </div>
          {activeMembership && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-700 border border-rose-200 uppercase">
              <Zap className="w-3.5 h-3.5 animate-pulse text-rose-600" /> {activeMembership.plan?.name}
            </span>
          )}
        </CardHeader>
        <CardContent className="p-6">
          {activeMembership ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-1">
                <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">Plan Name</span>
                <p className="text-lg font-bold text-slate-900">{activeMembership.plan?.name}</p>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">Billing Cycle</span>
                <p className="text-lg font-semibold text-slate-900 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  Expires on {formatDate(activeMembership.endDate)}
                </p>
              </div>
              <div className="flex items-center md:justify-end">
                {activeMembership.cancelAtPeriodEnd ? (
                  <span className="text-xs text-amber-700 font-medium bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg">
                    Cancels at end of period
                  </span>
                ) : (
                  <Button
                    onClick={handleCancelSubscription}
                    disabled={cancelling}
                    variant="outline"
                    className="border-red-200 bg-white text-red-600 hover:bg-red-50 hover:text-red-700 gap-1.5 shadow-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                    {cancelling ? "Cancelling..." : "Cancel Subscription"}
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-6 space-y-3">
              <p className="text-slate-500 text-sm">You are currently on the Free Basic tier. Upgrade to access match contacts and premium messaging features.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Plan Comparisons */}
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900">Available Premium Tiers</h2>
          <p className="text-slate-500 text-sm mt-1">Unlock matches, verify your profile, and fast-track your matchmaking</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan: any) => {
            const isCurrent = activeMembership?.planId === plan.id;
            const isPlanPending = payments.some((p: any) => p.planId === plan.id && p.status === "PENDING");
            return (
              <motion.div
                key={plan.id}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
              >
                <Card className={`border h-full flex flex-col justify-between overflow-hidden bg-white shadow-sm ${isCurrent ? 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/10' : isPlanPending ? 'border-amber-400 bg-amber-50/20' : 'border-slate-200 hover:border-slate-300'}`}>
                  <CardHeader className="p-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-bold uppercase tracking-wider text-rose-600">{plan.name}</span>
                      {isCurrent && (
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-200">
                          CURRENT PLAN
                        </span>
                      )}
                      {isPlanPending && !isCurrent && (
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                          PENDING
                        </span>
                      )}
                    </div>
                    <div className="flex items-baseline gap-1 my-3">
                      <span className="text-4xl font-extrabold text-slate-900">{formatCurrency(plan.price)}</span>
                      <span className="text-slate-500 text-sm">
                        {plan.price >= 100000 || plan.name?.toLowerCase().includes("concierge")
                          ? " / Valid Until Marriage"
                          : ` / ${plan.durationDays} days`}
                      </span>
                    </div>
                    <CardDescription className="text-xs text-slate-500 leading-relaxed mt-2">
                      {plan.description || "Unlock high-quality premium matches and secure direct communication features."}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="px-6 pb-6 pt-0 flex-grow">
                    <ul className="space-y-2.5 text-xs text-slate-600">
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-rose-600 shrink-0" />
                        <span>Direct Messaging & Photo Sharing</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-rose-600 shrink-0" />
                        <span>View Mutual Connection Contact Details</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-rose-600 shrink-0" />
                        <span>Compatibility Matching score calculation</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-rose-600 shrink-0" />
                        <span>Priority support & identity badge</span>
                      </li>
                    </ul>
                  </CardContent>
                  <CardFooter className="p-6 bg-slate-50/50 border-t border-slate-100">
                    <Button
                      onClick={() => handleCheckout(plan.id, plan.price)}
                      disabled={loadingPlan !== null || isCurrent || isPlanPending}
                      className={`w-full font-semibold transition-all shadow-sm ${
                        isCurrent
                          ? 'bg-slate-100 hover:bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                          : isPlanPending
                          ? 'bg-amber-100 text-amber-800 border border-amber-300 hover:bg-amber-100 cursor-not-allowed'
                          : 'bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white'
                      }`}
                    >
                      {loadingPlan === plan.id ? "Initializing..." : isCurrent ? "Active Tier" : isPlanPending ? "Verification Pending" : "Upgrade Plan"}
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Invoice History */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Billing & Invoice History</h2>
        <Card className="border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Invoice Number</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Plan Name</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoices.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-400 text-xs">
                      No invoices or billing history found.
                    </td>
                  </tr>
                ) : (
                  invoices.map((inv: any) => (
                    <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs text-slate-800 font-semibold">{inv.invoiceNumber}</td>
                      <td className="px-6 py-4 text-slate-600">{formatDate(inv.createdAt)}</td>
                      <td className="px-6 py-4 font-bold text-slate-900">{formatCurrency(inv.amount)}</td>
                      <td className="px-6 py-4 text-xs font-semibold text-rose-600">{inv.order?.plan?.name || "Premium Plan"}</td>
                      <td className="px-6 py-4">
                        <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {inv.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button
                          onClick={() => window.print()}
                          variant="ghost"
                          size="sm"
                          className="text-slate-600 hover:text-slate-900 gap-1 hover:bg-slate-100"
                        >
                          <Download className="w-3.5 h-3.5" /> Print
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
