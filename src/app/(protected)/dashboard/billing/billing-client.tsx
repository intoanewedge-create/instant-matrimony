"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Zap, CreditCard, Calendar, Check, Download, AlertCircle, Trash2 } from "lucide-react";
import { Card, CardHeader, CardContent, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createCheckoutAction, cancelSubscriptionAction } from "@/lib/actions/billing.actions";

export function BillingClient({ plans, activeMembership, invoices }: any) {
  const router = useRouter();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleCheckout = async (planId: string, price: number) => {
    setLoadingPlan(planId);
    setError(null);
    setSuccess(null);

    const successUrl = `${window.location.origin}/dashboard?checkout=success`;
    const cancelUrl = `${window.location.origin}/dashboard/billing?checkout=cancel`;

    try {
      const res = await createCheckoutAction({
        planId,
        amount: price,
        successUrl,
        cancelUrl,
      });

      if (res.success && res.data?.checkoutUrl) {
        window.location.assign(res.data.checkoutUrl);
      } else {
        setError(res.error || "Failed to initiate checkout");
      }
    } catch (e: any) {
      setError(e.message || "An unexpected error occurred");
    } finally {
      setLoadingPlan(null);
    }
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
    <div className="container mx-auto px-4 py-8 max-w-6xl space-y-10 text-slate-200">
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-rose-400 to-pink-500 bg-clip-text text-transparent">
          Billing & Premium Plans
        </h1>
        <p className="text-slate-400 text-sm">
          Upgrade your plan, manage active subscriptions, and view your billing history.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-950/30 border border-red-800/30 flex items-center gap-3 text-red-400 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-xl bg-green-950/30 border border-green-800/30 flex items-center gap-3 text-green-400 text-sm">
          <Check className="w-5 h-5 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Active Membership Status */}
      <Card className="border border-slate-800 bg-slate-900/40 backdrop-blur-md overflow-hidden relative">
        <div className="absolute right-0 top-0 bottom-0 w-1/4 bg-gradient-to-r from-rose-500/5 to-transparent blur-2xl pointer-events-none" />
        <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-slate-800/50">
          <div>
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-rose-500" />
              Active Plan Summary
            </CardTitle>
            <CardDescription className="text-slate-400">Your current membership benefits and status</CardDescription>
          </div>
          {activeMembership && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20 uppercase">
              <Zap className="w-3.5 h-3.5 animate-pulse" /> {activeMembership.plan?.name}
            </span>
          )}
        </CardHeader>
        <CardContent className="p-6">
          {activeMembership ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-1">
                <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Plan Name</span>
                <p className="text-lg font-bold text-slate-200">{activeMembership.plan?.name}</p>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Billing Cycle</span>
                <p className="text-lg font-semibold text-slate-200 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  Expires on {new Date(activeMembership.endDate).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center md:justify-end">
                {activeMembership.cancelAtPeriodEnd ? (
                  <span className="text-xs text-amber-400 font-medium bg-amber-500/15 border border-amber-500/20 px-3 py-1.5 rounded-lg">
                    Cancels at end of period
                  </span>
                ) : (
                  <Button
                    onClick={handleCancelSubscription}
                    disabled={cancelling}
                    variant="outline"
                    className="border-red-900/30 text-red-400 hover:bg-red-950/20 hover:text-red-300 gap-1.5"
                  >
                    <Trash2 className="w-4 h-4" />
                    {cancelling ? "Cancelling..." : "Cancel Subscription"}
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-6 space-y-3">
              <p className="text-slate-400 text-sm">You are currently on the Free Basic tier. Upgrade to access match contacts and premium messaging features.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Plan Comparisons */}
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Available Premium Tiers</h2>
          <p className="text-slate-400 text-sm mt-1">Unlock matches, verify your profile, and fast-track your matchmaking</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan: any) => {
            const isCurrent = activeMembership?.planId === plan.id;
            return (
              <motion.div
                key={plan.id}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
              >
                <Card className={`border h-full flex flex-col justify-between overflow-hidden bg-slate-900/30 backdrop-blur-md ${isCurrent ? 'border-rose-500 bg-rose-950/5' : 'border-slate-800'}`}>
                  <CardHeader className="p-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-semibold uppercase tracking-wider text-rose-400">{plan.name}</span>
                      {isCurrent && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30">
                          CURRENT PLAN
                        </span>
                      )}
                    </div>
                    <div className="flex items-baseline gap-1 my-3">
                      <span className="text-4xl font-extrabold">₹{plan.price}</span>
                      <span className="text-slate-400 text-sm">/{plan.durationDays} days</span>
                    </div>
                    <CardDescription className="text-xs text-slate-400 leading-relaxed mt-2">
                      {plan.description || "Unlock high-quality premium matches and secure direct communication features."}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="px-6 pb-6 pt-0 flex-grow">
                    <ul className="space-y-2.5 text-xs text-slate-300">
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-rose-500 shrink-0" />
                        <span>Direct Messaging & Photo Sharing</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-rose-500 shrink-0" />
                        <span>View Mutual Connection Contact Details</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-rose-500 shrink-0" />
                        <span>Compatibility Matching score calculation</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-rose-500 shrink-0" />
                        <span>Priority support & identity badge</span>
                      </li>
                    </ul>
                  </CardContent>
                  <CardFooter className="p-6 bg-slate-950/20 border-t border-slate-800/40">
                    <Button
                      onClick={() => handleCheckout(plan.id, plan.price)}
                      disabled={loadingPlan !== null || isCurrent}
                      className={`w-full font-semibold transition-all ${isCurrent ? 'bg-slate-800 hover:bg-slate-800 text-slate-500' : 'bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white'}`}
                    >
                      {loadingPlan === plan.id ? "Initializing..." : isCurrent ? "Active Tier" : "Upgrade Plan"}
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
        <h2 className="text-xl font-bold">Billing & Invoice History</h2>
        <Card className="border border-slate-800 bg-slate-900/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/40 text-xs font-semibold uppercase text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4">Invoice Number</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Plan Name</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {invoices.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500 text-xs">
                      No invoices or billing history found.
                    </td>
                  </tr>
                ) : (
                  invoices.map((inv: any) => (
                    <tr key={inv.id} className="hover:bg-slate-900/10 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs">{inv.invoiceNumber}</td>
                      <td className="px-6 py-4">{new Date(inv.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4 font-bold">₹{inv.amount}</td>
                      <td className="px-6 py-4 text-xs font-medium text-rose-400">{inv.order?.plan?.name || "Premium Plan"}</td>
                      <td className="px-6 py-4">
                        <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded bg-green-500/10 text-green-400 border border-green-500/20">
                          {inv.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button
                          onClick={() => window.print()}
                          variant="ghost"
                          size="sm"
                          className="text-slate-400 hover:text-slate-200 gap-1 hover:bg-slate-800"
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
