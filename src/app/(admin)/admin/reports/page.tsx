"use client";

import React, { useState } from "react";
import { Download, FileText, Loader2, Sparkles } from "lucide-react";
import { AdminCard, AdminPageHeader } from "@/components/admin/design-system";
import { Button } from "@/components/ui/button";
import { generateReportAction } from "@/lib/actions/admin.actions";

export default function ReportsPage() {
  const [reportType, setReportType] = useState<"USERS" | "PAYMENTS">("USERS");
  const [format, setFormat] = useState<"CSV" | "Excel" | "PDF">("CSV");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "info" | "error"; message: string } | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setStatus(null);

    try {
      const res = await generateReportAction(reportType, format);
      if (!res.success || !res.data) {
        setStatus({ type: "error", message: res.error || "Report generation failed." });
        return;
      }

      if (res.data.status === "QUEUED") {
        setStatus({
          type: "info",
          message: "The dataset exceeds 100 rows. A background job has been enqueued in the SchedulerService. You will be notified when it completes.",
        });
      } else if (res.data.status === "COMPLETED" && res.data.data) {
        // Direct download
        const mimeType = format === "PDF" ? "application/pdf" : format === "Excel" ? "application/vnd.ms-excel" : "text/csv";
        const blob = new Blob([res.data.data], { type: mimeType });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${reportType.toLowerCase()}-report-${Date.now()}.${format === "Excel" ? "xls" : format.toLowerCase()}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        setStatus({
          type: "success",
          message: "Report generated successfully! Download started automatically.",
        });
      }
    } catch (e: any) {
      setStatus({ type: "error", message: e.message || "Failed to contact reporting services." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main id="admin-main-content" className="p-6 space-y-6 max-w-4xl mx-auto">
      <AdminPageHeader
        title="Reporting & Exports"
        description="Extract raw data feeds from the system database. Large queries (over 100 records) are offloaded to background scheduler tasks."
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Reports" }
        ]}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Selection panel */}
        <div className="md:col-span-2 space-y-6">
          <AdminCard title="Exporter Configuration" subtitle="Configure scope, parameters, and format">
            <div className="space-y-6">
              {/* Type Select */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase" htmlFor="report-type-select">
                  Data Scope
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    id="report-type-select"
                    onClick={() => setReportType("USERS")}
                    className={`p-4 rounded-xl border flex flex-col items-center justify-center text-center transition-all ${
                      reportType === "USERS"
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border/60 hover:bg-muted/10 text-muted-foreground"
                    }`}
                  >
                    <FileText className="h-6 w-6 mb-2" />
                    <span className="font-bold text-sm">Registered Users</span>
                    <span className="text-[10px] opacity-80 mt-1">Profiles and active accounts</span>
                  </button>
                  <button
                    onClick={() => setReportType("PAYMENTS")}
                    className={`p-4 rounded-xl border flex flex-col items-center justify-center text-center transition-all ${
                      reportType === "PAYMENTS"
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border/60 hover:bg-muted/10 text-muted-foreground"
                    }`}
                  >
                    <DollarSignIcon className="h-6 w-6 mb-2" />
                    <span className="font-bold text-sm">Payments Ledger</span>
                    <span className="text-[10px] opacity-80 mt-1">Stripe & Razorpay records</span>
                  </button>
                </div>
              </div>

              {/* Format Select */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase" htmlFor="report-format-select">
                  Export Format
                </label>
                <div className="grid grid-cols-3 gap-3" id="report-format-select">
                  {(["CSV", "Excel", "PDF"] as const).map((fmt) => (
                    <button
                      key={fmt}
                      onClick={() => setFormat(fmt)}
                      className={`py-3 px-4 rounded-lg border text-sm font-bold text-center transition-all ${
                        format === fmt
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-border/60 hover:bg-muted/10 text-muted-foreground"
                      }`}
                    >
                      {fmt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit button */}
              <Button
                disabled={loading}
                onClick={handleGenerate}
                className="w-full h-11 bg-primary text-primary-foreground font-bold"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Assembling Data...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Generate and Export Report
                  </>
                )}
              </Button>
            </div>
          </AdminCard>

          {/* Status Alert */}
          {status && (
            <div
              className={`p-4 rounded-xl border flex items-start gap-3 animate-fade-in ${
                status.type === "success"
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                  : status.type === "info"
                  ? "bg-blue-500/10 border-blue-500/20 text-blue-500"
                  : "bg-rose-500/10 border-rose-500/20 text-rose-500"
              }`}
              role="alert"
            >
              <div className="flex-1 space-y-1">
                <h4 className="font-bold text-sm leading-none capitalize">{status.type}</h4>
                <p className="text-xs opacity-90">{status.message}</p>
              </div>
            </div>
          )}
        </div>

        {/* Info panel */}
        <div className="space-y-6">
          <AdminCard title="Reporting Limits">
            <div className="space-y-4 text-xs font-semibold text-muted-foreground">
              <div className="flex items-start gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                <p>Exports &lt;= 100 rows execute instantly and download in your browser.</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                <p>Exports &gt; 100 rows trigger a background worker task to prevent API gateway timeouts.</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                <p>Logs track the operator ID, type, format, and execution time for compliance audit logs.</p>
              </div>
            </div>
          </AdminCard>
        </div>
      </div>
    </main>
  );
}

function DollarSignIcon({ className }: { className?: string }) {
  return (
    <span className={`flex items-center justify-center font-bold font-mono text-lg leading-none ${className}`}>
      $
    </span>
  );
}
