"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { assignConciergeAdminAction } from "@/lib/actions/concierge.actions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Headphones, Search, Sparkles, UserCheck, ArrowRight } from "lucide-react";
import { getDisplayProfileId } from "@/lib/utils/public-id";

export function AdminConciergeClient({
  initialCases,
  admins,
}: {
  initialCases: any[];
  admins: any[];
}) {
  const router = useRouter();
  const [cases, setCases] = useState(initialCases || []);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const handleAssignAdmin = async (caseId: string, adminId: string) => {
    try {
      const res = await assignConciergeAdminAction(caseId, adminId);
      if (res.success) {
        setCases((prev) =>
          prev.map((c) => (c.id === caseId ? { ...c, assignedAdminId: adminId, assignedAdmin: admins.find((a) => a.id === adminId) } : c))
        );
        router.refresh();
      }
    } catch {
      // ignore
    }
  };

  const filteredCases = cases.filter((c) => {
    const matchesStatus = statusFilter === "ALL" || c.status === statusFilter;
    const profileId = getDisplayProfileId(c.user, c.userId).toLowerCase();
    const matchesSearch =
      !searchQuery ||
      profileId.includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const activeCount = cases.filter((c) => c.status !== "CLOSED").length;

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border border-slate-200/90 bg-white p-4 shadow-sm rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-pink-50 text-pink-600 rounded-xl border border-pink-100">
              <Headphones className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Active Concierge Cases</p>
              <h3 className="text-2xl font-bold text-slate-900">{activeCount}</h3>
            </div>
          </div>
        </Card>

        <Card className="border border-slate-200/90 bg-white p-4 shadow-sm rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl border border-amber-100">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Total VIP Subscribers</p>
              <h3 className="text-2xl font-bold text-amber-700">{cases.length}</h3>
            </div>
          </div>
        </Card>

        <Card className="border border-slate-200/90 bg-white p-4 shadow-sm rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Assigned Managers</p>
              <h3 className="text-2xl font-bold text-slate-900">
                {new Set(cases.map((c) => c.assignedAdminId).filter(Boolean)).size}
              </h3>
            </div>
          </div>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            type="text"
            placeholder="Search Profile ID (IM...)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-slate-50 border-slate-200 text-xs text-slate-900 placeholder:text-slate-400"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          {["ALL", "OPEN", "SEARCHING_MATCHES", "SHORTLIST_PREPARED", "FAMILY_CONTACT", "MEETING_SCHEDULED", "CLOSED"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                statusFilter === st
                  ? "bg-rose-600 text-white shadow-sm"
                  : "bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900"
              }`}
            >
              {st.replace(/_/g, " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Cases List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCases.length === 0 ? (
          <Card className="col-span-full border border-slate-200/90 bg-white p-12 text-center text-slate-400 shadow-sm rounded-2xl">
            No concierge cases match the criteria.
          </Card>
        ) : (
          filteredCases.map((c) => (
            <Card key={c.id} className="border border-slate-200/90 bg-white p-6 flex flex-col justify-between space-y-4 hover:border-slate-300 shadow-sm rounded-2xl transition-all">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-rose-600 text-sm font-mono break-all">
                      {c.userId}
                    </h3>
                    <p className="text-xs text-slate-700 font-semibold">{c.user?.name || "Concierge Subscriber"}</p>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                    {c.status.replace(/_/g, " ")}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-3">
                  <div className="flex justify-between">
                    <span>Assigned Manager:</span>
                    <strong className="text-slate-800">{c.assignedAdmin?.name || "Unassigned"}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Shortlisted Matches:</span>
                    <strong className="text-rose-600">{c.shortlists?.length || 0}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Started:</span>
                    <span>{new Date(c.startedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex gap-2">
                <select
                  value={c.assignedAdminId || ""}
                  onChange={(e) => handleAssignAdmin(c.id, e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-[11px] text-slate-700 rounded-xl px-2 py-1.5 flex-grow focus:outline-none"
                >
                  <option value="">Assign Admin...</option>
                  {admins.map((a) => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>

                <Link href={`/admin/concierge/${c.id}`}>
                  <Button size="sm" className="bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs h-8 rounded-xl">
                    Manage Case <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </Link>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
