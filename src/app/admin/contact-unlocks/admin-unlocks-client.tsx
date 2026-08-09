"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Unlock, Search, Calendar, UserCheck } from "lucide-react";

export function AdminUnlocksClient({ initialUnlocks }: { initialUnlocks: any[] }) {
  const [unlocks] = useState(initialUnlocks || []);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredUnlocks = unlocks.filter((u) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      u.user?.name?.toLowerCase().includes(q) ||
      u.user?.email?.toLowerCase().includes(q) ||
      u.targetUser?.name?.toLowerCase().includes(q) ||
      u.targetUser?.email?.toLowerCase().includes(q) ||
      u.unlockReason?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border border-slate-800 bg-slate-900/60 p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-rose-500/10 text-rose-400 rounded-xl">
              <Unlock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Total Contacts Unlocked</p>
              <h3 className="text-2xl font-bold text-white">{unlocks.length}</h3>
            </div>
          </div>
        </Card>

        <Card className="border border-slate-800 bg-slate-900/60 p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Unique Members Unlocking</p>
              <h3 className="text-2xl font-bold text-emerald-400">
                {new Set(unlocks.map((u) => u.userId)).size}
              </h3>
            </div>
          </div>
        </Card>
      </div>

      {/* Search Bar */}
      <div className="relative w-full sm:w-80">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <Input
          type="text"
          placeholder="Search unlocker, target member..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 bg-slate-950 border-slate-800 text-xs text-white"
        />
      </div>

      {/* Table */}
      <Card className="border border-slate-800 bg-slate-900/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-4">Unlocked By (Member)</th>
                <th className="p-4">Target Member Unlocked</th>
                <th className="p-4">Membership Plan</th>
                <th className="p-4">Unlock Reason</th>
                <th className="p-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredUnlocks.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    No contact unlock records found.
                  </td>
                </tr>
              ) : (
                filteredUnlocks.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-950/40 transition-colors">
                    <td className="p-4 font-semibold text-white">
                      {u.user?.name}
                      <div className="text-[10px] text-slate-400 font-normal">{u.user?.email}</div>
                    </td>
                    <td className="p-4 font-semibold text-rose-400">
                      {u.targetUser?.name}
                      <div className="text-[10px] text-slate-400 font-normal">{u.targetUser?.email}</div>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300">
                        {u.membership?.plan?.name || "Standard Plan"}
                      </span>
                    </td>
                    <td className="p-4 text-slate-400">{u.unlockReason || "Permanent Contact Unlock"}</td>
                    <td className="p-4 text-slate-400 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
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
