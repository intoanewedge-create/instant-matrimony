"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Unlock, Search, Calendar, UserCheck } from "lucide-react";
import { getDisplayProfileId } from "@/lib/utils/public-id";

export function AdminUnlocksClient({ initialUnlocks }: { initialUnlocks: any[] }) {
  const [unlocks] = useState(initialUnlocks || []);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredUnlocks = unlocks.filter((u) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const unlockerId = getDisplayProfileId(u.user, u.userId).toLowerCase();
    const targetId = getDisplayProfileId(u.targetUser, u.targetUserId).toLowerCase();
    return (
      unlockerId.includes(q) ||
      targetId.includes(q) ||
      u.unlockReason?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border border-slate-200/90 bg-white p-4 shadow-sm rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-rose-50 text-rose-600 rounded-xl border border-rose-100">
              <Unlock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Total Contacts Unlocked</p>
              <h3 className="text-2xl font-bold text-slate-900">{unlocks.length}</h3>
            </div>
          </div>
        </Card>

        <Card className="border border-slate-200/90 bg-white p-4 shadow-sm rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Unique Members Unlocking</p>
              <h3 className="text-2xl font-bold text-emerald-700">
                {new Set(unlocks.map((u) => u.userId)).size}
              </h3>
            </div>
          </div>
        </Card>
      </div>

      {/* Search Bar */}
      <div className="relative w-full sm:w-80">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <Input
          type="text"
          placeholder="Search by Profile ID (IM...)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 bg-slate-50 border-slate-200 text-xs text-slate-900 placeholder:text-slate-400"
        />
      </div>

      {/* Table */}
      <Card className="border border-slate-200/90 bg-white shadow-sm rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50/80 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-4">Unlocked By (User ID)</th>
                <th className="p-4">Target User ID</th>
                <th className="p-4">Membership Plan</th>
                <th className="p-4">Unlock Reason</th>
                <th className="p-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUnlocks.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">
                    No contact unlock records found.
                  </td>
                </tr>
              ) : (
                filteredUnlocks.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-4 font-semibold text-slate-900">
                      <span className="inline-block font-mono text-xs font-bold px-2 py-0.5 rounded bg-rose-50 text-rose-600 border border-rose-200">
                        {u.userId}
                      </span>
                    </td>
                    <td className="p-4 font-semibold text-rose-600">
                      <span className="inline-block font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
                        {u.targetUserId}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-[10px] font-semibold text-slate-700 border border-slate-200">
                        {u.membership?.plan?.name || "Standard Plan"}
                      </span>
                    </td>
                    <td className="p-4 text-slate-600">{u.unlockReason || "Permanent Contact Unlock"}</td>
                    <td className="p-4 text-slate-500 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {new Date(u.unlockedAt).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
