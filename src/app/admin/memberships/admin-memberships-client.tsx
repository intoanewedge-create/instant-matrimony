"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { editMembershipPlanAction } from "@/lib/actions/membership.actions";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Shield, Edit3, Check, Users, Sparkles } from "lucide-react";

export function AdminMembershipsClient({
  plans: initialPlans,
  activeMemberships,
}: {
  plans: any[];
  activeMemberships: any[];
}) {
  const router = useRouter();
  const [plans, setPlans] = useState(initialPlans || []);
  const [editingPlan, setEditingPlan] = useState<any | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const handleEditClick = (plan: any) => {
    setEditingPlan(plan);
    setFormData({
      price: plan.price,
      durationDays: plan.durationDays,
      description: plan.description || "",
      isActive: plan.isActive,
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan) return;
    setLoading(true);

    try {
      const res = await editMembershipPlanAction(editingPlan.id, {
        price: Number(formData.price),
        durationDays: Number(formData.durationDays),
        description: formData.description,
        isActive: formData.isActive,
      });

      if (res.success) {
        setPlans((prev) =>
          prev.map((p) => (p.id === editingPlan.id ? { ...p, ...formData } : p))
        );
        setEditingPlan(null);
        router.refresh();
      }
    } catch (err) {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Plans Configurator Grid */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Shield className="w-5 h-5 text-rose-500" /> Database-Driven Membership Plans
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {plans.map((plan) => (
            <Card key={plan.id} className="border border-slate-800 bg-slate-900/60 p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-white text-lg flex items-center gap-2">
                    {plan.name} {plan.price >= 100000 && <Sparkles className="w-4 h-4 text-amber-400" />}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">{plan.description}</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEditClick(plan)}
                  className="border-slate-700 text-slate-300 hover:bg-slate-800 text-xs"
                >
                  <Edit3 className="w-3.5 h-3.5 mr-1" /> Edit Plan
                </Button>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-rose-400">₹{plan.price.toLocaleString()}</span>
                <span className="text-xs text-slate-400">/ {plan.durationDays} Days</span>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <span>Status: <strong className={plan.isActive ? "text-emerald-400" : "text-red-400"}>{plan.isActive ? "ACTIVE" : "INACTIVE"}</strong></span>
                <span>Unlocks: <strong>{plan.price >= 100000 ? "UNLIMITED" : "5 MAX"}</strong></span>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Active Memberships Table */}
      <div className="space-y-4 pt-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Users className="w-5 h-5 text-rose-500" /> Active Member Subscriptions ({activeMemberships.length})
        </h2>

        <Card className="border border-slate-800 bg-slate-900/60 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-4">Member</th>
                  <th className="p-4">Plan Name</th>
                  <th className="p-4">Start Date</th>
                  <th className="p-4">Expires On</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {activeMemberships.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500">
                      No active member subscriptions found.
                    </td>
                  </tr>
                ) : (
                  activeMemberships.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-950/40 transition-colors">
                      <td className="p-4 font-semibold text-white">
                        {m.user?.name}
                        <div className="text-[10px] text-slate-400 font-normal">{m.user?.email}</div>
                      </td>
                      <td className="p-4 font-bold text-rose-400">{m.plan?.name}</td>
                      <td className="p-4 text-slate-400">{new Date(m.startDate).toLocaleDateString()}</td>
                      <td className="p-4 text-slate-400">{new Date(m.endDate).toLocaleDateString()}</td>
                      <td className="p-4">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {m.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Plan Edit Modal */}
      {editingPlan && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleSave} className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white">Edit Plan: {editingPlan.name}</h3>

            <div className="space-y-3 text-xs">
              <div>
                <Label htmlFor="price">Price (₹)</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="bg-slate-950 border-slate-800 text-white"
                />
              </div>

              <div>
                <Label htmlFor="durationDays">Duration (Days)</Label>
                <Input
                  id="durationDays"
                  type="number"
                  value={formData.durationDays}
                  onChange={(e) => setFormData({ ...formData, durationDays: e.target.value })}
                  className="bg-slate-950 border-slate-800 text-white"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  id="isActive"
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded border-slate-800 bg-slate-950 text-rose-600 focus:ring-rose-500"
                />
                <Label htmlFor="isActive" className="cursor-pointer">Plan Active</Label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setEditingPlan(null)} className="border-slate-800 text-slate-300">
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={loading} className="bg-rose-600 hover:bg-rose-500 text-white font-semibold">
                {loading ? <Spinner className="w-4 h-4 mr-1" /> : null} Save Changes
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
