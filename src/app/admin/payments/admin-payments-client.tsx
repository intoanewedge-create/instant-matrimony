"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { approvePaymentAction, rejectPaymentAction } from "@/lib/actions/membership.actions";
import { formatDate, formatCurrency } from "@/lib/utils/format";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { CheckCircle, XCircle, Eye, Search, AlertTriangle, ShieldCheck, DollarSign, Clock } from "lucide-react";

export function AdminPaymentsClient({ initialPayments }: { initialPayments: any[] }) {
  const router = useRouter();
  const [payments, setPayments] = useState(initialPayments || []);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // Reject modal state
  const [rejectingPayment, setRejectingPayment] = useState<any | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectingLoading, setRejectingLoading] = useState(false);

  // View receipt modal state
  const [viewingReceipt, setViewingReceipt] = useState<string | null>(null);

  const handleApprove = async (paymentId: string) => {
    setLoadingId(paymentId);
    try {
      const res = await approvePaymentAction(paymentId);
      if (res.success) {
        setPayments((prev) =>
          prev.map((p) => (p.id === paymentId ? { ...p, status: "PAID" } : p))
        );
        router.refresh();
      }
    } catch {
      // ignore
    } finally {
      setLoadingId(null);
    }
  };

  const handleRejectConfirm = async () => {
    if (!rejectingPayment || !rejectReason.trim()) return;
    setRejectingLoading(true);
    try {
      const res = await rejectPaymentAction(rejectingPayment.id, rejectReason.trim());
      if (res.success) {
        setPayments((prev) =>
          prev.map((p) => (p.id === rejectingPayment.id ? { ...p, status: "FAILED", rejectionReason: rejectReason } : p))
        );
        setRejectingPayment(null);
        setRejectReason("");
        router.refresh();
      }
    } catch {
      // ignore
    } finally {
      setRejectingLoading(false);
    }
  };

  const filteredPayments = payments.filter((p) => {
    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "PENDING" && p.status === "PENDING") ||
      (statusFilter === "APPROVED" && p.status === "PAID") ||
      (statusFilter === "REJECTED" && (p.status === "FAILED" || p.status === "REJECTED"));

    const matchesSearch =
      !searchQuery ||
      p.utrNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.user?.email?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  const pendingCount = payments.filter((p) => p.status === "PENDING").length;
  const approvedTotal = payments
    .filter((p) => p.status === "PAID")
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border border-slate-800 bg-slate-900/60 p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Pending Verification</p>
              <h3 className="text-2xl font-bold text-white">{pendingCount}</h3>
            </div>
          </div>
        </Card>

        <Card className="border border-slate-800 bg-slate-900/60 p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Approved Revenue</p>
              <h3 className="text-2xl font-bold text-emerald-400">{formatCurrency(approvedTotal)}</h3>
            </div>
          </div>
        </Card>

        <Card className="border border-slate-800 bg-slate-900/60 p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-rose-500/10 text-rose-400 rounded-xl">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Total Transactions</p>
              <h3 className="text-2xl font-bold text-white">{payments.length}</h3>
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
            placeholder="Search UTR, name, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-slate-950 border-slate-800 text-xs text-white"
          />
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          {["ALL", "PENDING", "APPROVED", "REJECTED"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === st
                  ? "bg-rose-600 text-white shadow-md shadow-rose-600/30"
                  : "bg-slate-950 border border-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <Card className="border border-slate-800 bg-slate-900/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-4">User</th>
                <th className="p-4">Plan & Amount</th>
                <th className="p-4">Method & UTR</th>
                <th className="p-4">Submitted Date</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    No payment records found.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-950/40 transition-colors">
                    <td className="p-4 font-semibold text-white">
                      <div>{p.user?.name || "Member"}</div>
                      <div className="text-[10px] text-slate-400 font-normal">{p.user?.email}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-rose-400">{formatCurrency(p.amount)}</div>
                      <div className="text-[10px] text-slate-400">{p.plan?.name || "Standard Plan"}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-mono text-white">{p.utrNumber}</div>
                      <div className="text-[10px] text-slate-400">{p.paymentMethod || "QR_CODE"}</div>
                    </td>
                    <td className="p-4 text-slate-400">
                      {formatDate(p.createdAt)}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          p.status === "PAID"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : p.status === "PENDING"
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                        }`}
                      >
                        {p.status === "PAID" ? "APPROVED" : p.status}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      {p.receiptUrl && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setViewingReceipt(p.receiptUrl)}
                          className="border-slate-800 text-slate-300 hover:bg-slate-800 text-[10px] h-7"
                        >
                          <Eye className="w-3 h-3 mr-1" /> Receipt
                        </Button>
                      )}

                      {p.status === "PENDING" && (
                        <>
                          <Button
                            size="sm"
                            disabled={loadingId === p.id}
                            onClick={() => handleApprove(p.id)}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[10px] h-7"
                          >
                            {loadingId === p.id ? <Spinner className="w-3 h-3" /> : <CheckCircle className="w-3 h-3 mr-1" />} Approve
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setRejectingPayment(p);
                              setRejectReason("");
                            }}
                            className="border-red-900/40 text-red-400 hover:bg-red-950/40 text-[10px] h-7"
                          >
                            <XCircle className="w-3 h-3 mr-1" /> Reject
                          </Button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Rejection Modal Dialog */}
      {rejectingPayment && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-500" /> Reject Payment Verification
            </h3>
            <p className="text-xs text-slate-400">
              Provide a mandatory rejection reason for member <strong>{rejectingPayment.user?.name}</strong>.
            </p>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. UTR number not found in bank statement, screenshot unreadable..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRejectingPayment(null)}
                className="border-slate-800 text-slate-300"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                disabled={rejectingLoading || !rejectReason.trim()}
                onClick={handleRejectConfirm}
                className="bg-red-600 hover:bg-red-500 text-white font-semibold"
              >
                {rejectingLoading ? <Spinner className="w-4 h-4 mr-1" /> : null} Confirm Rejection
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Viewer Modal */}
      {viewingReceipt && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-4 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-white text-sm">Payment Receipt Preview</h4>
              <button onClick={() => setViewingReceipt(null)} className="text-slate-400 hover:text-white text-xs">
                Close
              </button>
            </div>
            <div className="w-full h-80 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center p-2">
              <img src={viewingReceipt} alt="Receipt" className="max-h-full max-w-full object-contain" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
