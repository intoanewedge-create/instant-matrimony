"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Calendar, CheckCircle, FileText, Paperclip, ArrowLeft } from "lucide-react";

export function UserConciergeClient({ caseData }: { caseData: any }) {
  if (!caseData) {
    return (
      <div className="container mx-auto px-4 max-w-4xl space-y-8 text-slate-900">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-slate-500 hover:text-slate-900">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-3xl font-extrabold text-slate-900">VIP Concierge Matchmaking</h1>
        </div>

        <Card className="border border-slate-200 bg-white p-12 text-center space-y-4 shadow-sm">
          <div className="h-14 w-14 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mx-auto shadow-xs">
            <Sparkles className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">Dedicated Relationship Manager Service</h3>
          <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
            Our Premium Concierge Plan (₹5,00,000) provides you with a dedicated Relationship Manager who handles profile shortlisting, family contacts, and meeting scheduling.
          </p>
          <Link href="/membership#payment-section">
            <Button className="bg-gradient-to-r from-amber-500 to-rose-600 text-white font-bold text-xs shadow-md shadow-rose-500/20 hover:from-amber-600 hover:to-rose-700">
              Upgrade to Premium Concierge
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  const pipeline = [
    "OPEN",
    "SEARCHING_MATCHES",
    "SHORTLIST_PREPARED",
    "FAMILY_CONTACT",
    "MEETING_SCHEDULED",
    "NEGOTIATION",
    "MARRIAGE_CONFIRMED",
    "CLOSED",
  ];

  const currentIdx = pipeline.indexOf(caseData.status);

  return (
    <div className="container mx-auto px-4 max-w-5xl space-y-8 text-slate-900">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-slate-500 hover:text-slate-900">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-2">
              VIP Concierge Matchmaking <Sparkles className="w-6 h-6 text-amber-500" />
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Relationship Manager: <strong className="text-rose-600 font-semibold">{caseData.assignedAdmin?.name || "Senior Advisor Assigned"}</strong>
            </p>
          </div>
        </div>

        <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 self-start sm:self-auto shadow-xs">
          Status: {caseData.status.replace(/_/g, " ")}
        </span>
      </div>

      {/* Progress Pipeline Visualizer */}
      <Card className="border border-slate-200 bg-white p-6 space-y-3 shadow-sm">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Matchmaking Timeline Progress</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {pipeline.map((step, idx) => {
            const isCompleted = idx <= currentIdx;
            const isCurrent = idx === currentIdx;
            return (
              <div
                key={step}
                className={`p-2.5 rounded-xl border text-[10px] font-bold text-center transition-all ${
                  isCurrent
                    ? "bg-rose-600 border-rose-600 text-white shadow-md shadow-rose-600/20"
                    : isCompleted
                    ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                    : "bg-slate-50 border-slate-200 text-slate-400"
                }`}
              >
                {step.replace(/_/g, " ")}
              </div>
            );
          })}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Timeline Updates */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border border-slate-200 bg-white p-6 space-y-4 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-rose-600" /> Manager Activity & Progress Updates
            </h3>

            <div className="space-y-4">
              {caseData.updates?.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No updates published yet.</p>
              ) : (
                caseData.updates?.map((u: any) => (
                  <div key={u.id} className="p-4 bg-slate-50/80 rounded-xl border border-slate-200 space-y-1.5 shadow-xs">
                    <div className="flex justify-between items-center text-[10px] text-slate-500">
                      <span className="font-bold text-rose-600 flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Relationship Manager Update
                      </span>
                      <span>{new Date(u.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed">{u.content}</p>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Right Col: Meetings & Attachments */}
        <div className="space-y-6">
          {/* Scheduled Meetings */}
          <Card className="border border-slate-200 bg-white p-6 space-y-3 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-rose-600" /> Scheduled Meetings
            </h3>
            {caseData.meetings?.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No upcoming meetings scheduled.</p>
            ) : (
              caseData.meetings?.map((m: any) => (
                <div key={m.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1 shadow-xs">
                  <h4 className="font-bold text-slate-900">{m.title}</h4>
                  <p className="text-rose-600 font-mono text-[11px] font-semibold">{new Date(m.scheduledAt).toLocaleString()}</p>
                  {m.location && <p className="text-slate-500 text-[11px]">Location: {m.location}</p>}
                </div>
              ))
            )}
          </Card>

          {/* Attachments */}
          <Card className="border border-slate-200 bg-white p-6 space-y-3 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Paperclip className="w-4 h-4 text-rose-600" /> Documents & Verification
            </h3>
            {caseData.attachments?.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No documents attached.</p>
            ) : (
              caseData.attachments?.map((att: any) => (
                <div key={att.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex justify-between items-center shadow-xs">
                  <span className="font-bold text-slate-800 truncate max-w-[180px]">{att.fileName}</span>
                  <a href={att.fileUrl} target="_blank" rel="noreferrer" className="text-rose-600 hover:text-rose-700 font-semibold hover:underline text-[11px]">
                    Download
                  </a>
                </div>
              ))
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
