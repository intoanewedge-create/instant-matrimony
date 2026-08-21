"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { editMembershipPlanAction } from "@/lib/actions/membership.actions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Shield, Edit3, Users, Sparkles } from "lucide-react";
import { getDisplayProfileId } from "@/lib/utils/public-id";

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
        durationDays: formData.durationDays,
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
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Plans Configurator Grid */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Shield className="w-5 h-5 text-rose-600" /> Database-Driven Membership Plans
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {plans.map((plan) => (
            <Card key={plan.id} className="border border-slate-200/90 bg-white p-6 space-y-4 shadow-sm rounded-2xl">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                    {plan.name} {plan.price >= 100000 && <Sparkles className="w-4 h-4 text-amber-500" />}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">{plan.description}</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEditClick(plan)}
                  className="border-slate-200 text-slate-700 hover:bg-slate-50 text-xs rounded-xl"
                >
                  <Edit3 className="w-3.5 h-3.5 mr-1" /> Edit Plan
                </Button>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-rose-600">₹{plan.price.toLocaleString()}</span>
                <span className="text-xs text-slate-500">/ {plan.durationDays} Days</span>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                <span>Status: <strong className={plan.isActive ? "text-emerald-600" : "text-red-600"}>{plan.isActive ? "ACTIVE" : "INACTIVE"}</strong></span>
                <span>Unlocks: <strong>{plan.price >= 100000 ? "UNLIMITED" : "5 MAX"}</strong></span>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Active Memberships Table */}
      <div className="space-y-4 pt-4">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Users className="w-5 h-5 text-rose-600" /> Active Member Subscriptions ({activeMemberships.length})
        </h2>

        <Card className="border border-slate-200/90 bg-white overflow-hidden shadow-sm rounded-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50/80 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200 font-semibold">
                <tr>
                  <th className="p-4">User ID</th>
                  <th className="p-4">Plan Name</th>
                  <th className="p-4">Start Date</th>
                  <th className="p-4">Expires On</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activeMemberships.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-400">
                      No active member subscriptions found.
                    </td>
                  </tr>
                ) : (
                  activeMemberships.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-4 font-semibold text-slate-900">
                        <span className="inline-block font-mono text-xs font-bold px-2 py-0.5 rounded bg-rose-50 text-rose-600 border border-rose-200">
                          {m.userId || m.user?.id}
                        </span>
                      </td>
                      <td className="p-4 font-bold text-rose-600">{m.plan?.name}</td>
                      <td className="p-4 text-slate-500">{new Date(m.startDate).toLocaleDateString()}</td>
                      <td className="p-4 text-slate-500">{new Date(m.endDate).toLocaleDateString()}</td>
                      <td className="p-4">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
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
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleSave} className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900">Edit Plan: {editingPlan.name}</h3>

            <div className="space-y-3 text-xs">
              <div>
                <Label htmlFor="price" className="text-slate-700">Price (₹)</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="bg-slate-50 border-slate-200 text-slate-900"
                />
              </div>

              <div>
                <Label htmlFor="durationDays" className="text-slate-700">Duration Label (e.g. 90 Days / 6 Months)</Label>
                <Input
                  id="durationDays"
                  type="text"
                  value={formData.durationDays}
                  onChange={(e) => setFormData({ ...formData, durationDays: e.target.value })}
                  className="bg-slate-50 border-slate-200 text-slate-900"
                />
              </div>

              <div>
                <Label htmlFor="description" className="text-slate-700">Description</Label>
                <textarea
                  id="description"
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  id="isActive"
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded border-slate-200 bg-slate-50 text-rose-600 focus:ring-rose-500"
                />
                <Label htmlFor="isActive" className="cursor-pointer text-slate-700">Plan Active</Label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button type="button" variant="outline" size="sm" onClick={() => setEditingPlan(null)} className="border-slate-200 text-slate-600 hover:bg-slate-50">
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={loading} className="bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-lg">
                {loading ? <Spinner className="w-4 h-4 mr-1" /> : null} Save Changes
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
