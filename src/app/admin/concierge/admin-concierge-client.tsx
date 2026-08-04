"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { assignConciergeAdminAction, updateConciergeStatusAction } from "@/lib/actions/concierge.actions";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Headphones, Search, Filter, Sparkles, UserCheck, Calendar, ArrowRight, Shield } from "lucide-react";

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
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleAssignAdmin = async (caseId: string, adminId: string) => {
    setLoadingId(caseId);
    try {
      const res = await assignConciergeAdminAction(caseId, adminId);
      if (res.success) {
        setCases((prev) =>
          prev.map((c) => (c.id === caseId ? { ...c, assignedAdminId: adminId, assignedAdmin: admins.find((a) => a.id === adminId) } : c))
        );
        router.refresh();
      }
    } catch (e) {
      // ignore
    } finally {
      setLoadingId(null);
    }
  };

  const handleStatusChange = async (caseId: string, newStatus: string) => {
    setLoadingId(caseId);
    try {
      const res = await updateConciergeStatusAction(caseId, newStatus);
      if (res.success) {
        setCases((prev) =>
          prev.map((c) => (c.id === caseId ? { ...c, status: newStatus } : c))
        );
        router.refresh();
      }
    } catch (e) {
      // ignore
    } finally {
      setLoadingId(null);
    }
  };

  const filteredCases = cases.filter((c) => {
    const matchesStatus = statusFilter === "ALL" || c.status === statusFilter;
    const matchesSearch =
      !searchQuery ||
      c.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.user?.email?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const activeCount = cases.filter((c) => c.status !== "CLOSED").length;

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border border-slate-800 bg-slate-900/60 p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-pink-500/10 text-pink-400 rounded-xl">
              <Headphones className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Active Concierge Cases</p>
              <h3 className="text-2xl font-bold text-white">{activeCount}</h3>
            </div>
          </div>
        </Card>

        <Card className="border border-slate-800 bg-slate-900/60 p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Total VIP Subscribers</p>
              <h3 className="text-2xl font-bold text-amber-400">{cases.length}</h3>
            </div>
          </div>
        </Card>

        <Card className="border border-slate-800 bg-slate-900/60 p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Assigned Managers</p>
              <h3 className="text-2xl font-bold text-white">
                {new Set(cases.map((c) => c.assignedAdminId).filter(Boolean)).size}
              </h3>
            </div>
          </div>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/40 p-4 rounded-xl border border-slate-800">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <Input
            type="text"
            placeholder="Search member name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-slate-950 border-slate-800 text-xs text-white"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          {["ALL", "OPEN", "SEARCHING_MATCHES", "SHORTLIST_PREPARED", "FAMILY_CONTACT", "MEETING_SCHEDULED", "CLOSED"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === st
                  ? "bg-rose-600 text-white shadow-md shadow-rose-600/30"
                  : "bg-slate-950 border border-slate-800 text-slate-400 hover:text-white"
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
          <Card className="col-span-full border border-slate-800 bg-slate-900/60 p-12 text-center text-slate-500">
            No concierge cases match the criteria.
          </Card>
        ) : (
          filteredCases.map((c) => (
            <Card key={c.id} className="border border-slate-800 bg-slate-900/60 p-6 flex flex-col justify-between space-y-4 hover:border-slate-700 transition-all">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-white text-base">{c.user?.name}</h3>
                    <p className="text-xs text-slate-400">{c.user?.email}</p>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    {c.status.replace(/_/g, " ")}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-400 border-t border-slate-800/80 pt-3">
                  <div className="flex justify-between">
                    <span>Assigned Manager:</span>
                    <strong className="text-slate-200">{c.assignedAdmin?.name || "Unassigned"}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Shortlisted Matches:</span>
                    <strong className="text-rose-400">{c.shortlists?.length || 0}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Started:</span>
                    <span>{new Date(c.startedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex gap-2">
                <select
                  value={c.assignedAdminId || ""}
                  onChange={(e) => handleAssignAdmin(c.id, e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-[11px] text-slate-300 rounded px-2 py-1.5 flex-grow focus:outline-none"
                >
                  <option value="">Assign Admin...</option>
                  {admins.map((a) => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>

                <Link href={`/admin/concierge/${c.id}`}>
                  <Button size="sm" className="bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs h-8">
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
