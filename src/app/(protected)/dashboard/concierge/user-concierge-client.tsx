"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Calendar, CheckCircle, FileText, Paperclip, ArrowLeft } from "lucide-react";

export function UserConciergeClient({ caseData }: { caseData: any }) {
  if (!caseData) {
    return (
      <div className="container mx-auto px-4 max-w-4xl space-y-8">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-slate-400 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-3xl font-extrabold text-white">VIP Concierge Matchmaking</h1>
        </div>

        <Card className="border border-slate-800 bg-slate-900/60 p-12 text-center space-y-4">
          <Sparkles className="w-12 h-12 text-amber-400 mx-auto" />
          <h3 className="text-xl font-bold text-white">Dedicated Relationship Manager Service</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Our Premium Concierge Plan (₹5,00,000) provides you with a dedicated Relationship Manager who handles profile shortlisting, family contacts, and meeting scheduling.
          </p>
          <Link href="/membership#payment-section">
            <Button className="bg-gradient-to-r from-amber-500 to-rose-500 text-slate-950 font-bold text-xs">
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
    <div className="container mx-auto px-4 max-w-5xl space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-slate-400 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-extrabold text-white flex items-center gap-2">
              VIP Concierge Matchmaking <Sparkles className="w-6 h-6 text-amber-400" />
            </h1>
            <p className="text-xs text-slate-400">
              Relationship Manager: <strong className="text-rose-400">{caseData.assignedAdmin?.name || "Senior Advisor Assigned"}</strong>
            </p>
          </div>
        </div>

        <span className="px-3.5 py-1 rounded-full text-xs font-extrabold bg-amber-500/10 text-amber-400 border border-amber-500/20">
          Status: {caseData.status.replace(/_/g, " ")}
        </span>
      </div>

      {/* Progress Pipeline Visualizer */}
      <Card className="border border-slate-800 bg-slate-900/60 p-6 space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Matchmaking Timeline Progress</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {pipeline.map((step, idx) => {
            const isCompleted = idx <= currentIdx;
            const isCurrent = idx === currentIdx;
            return (
              <div
                key={step}
                className={`p-2.5 rounded-xl border text-[10px] font-bold text-center transition-all ${
                  isCurrent
                    ? "bg-rose-600 border-rose-500 text-white shadow-lg shadow-rose-600/30"
                    : isCompleted
                    ? "bg-slate-900 border-slate-700 text-emerald-400"
                    : "bg-slate-950 border-slate-800 text-slate-500"
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
          <Card className="border border-slate-800 bg-slate-900/60 p-6 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-rose-500" /> Manager Activity & Progress Updates
            </h3>

            <div className="space-y-4">
              {caseData.updates?.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No updates published yet.</p>
              ) : (
                caseData.updates?.map((u: any) => (
                  <div key={u.id} className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-1.5">
                    <div className="flex justify-between items-center text-[10px] text-slate-400">
                      <span className="font-bold text-rose-400 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3 text-emerald-400" /> Relationship Manager Update
                      </span>
                      <span>{new Date(u.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed">{u.content}</p>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Right Col: Meetings & Attachments */}
        <div className="space-y-6">
          {/* Scheduled Meetings */}
          <Card className="border border-slate-800 bg-slate-900/60 p-6 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-rose-500" /> Scheduled Meetings
            </h3>
            {caseData.meetings?.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No upcoming meetings scheduled.</p>
            ) : (
              caseData.meetings?.map((m: any) => (
                <div key={m.id} className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-1">
                  <h4 className="font-bold text-white">{m.title}</h4>
                  <p className="text-rose-400 font-mono text-[11px]">{new Date(m.scheduledAt).toLocaleString()}</p>
                  {m.location && <p className="text-slate-400 text-[11px]">Location: {m.location}</p>}
                </div>
              ))
            )}
          </Card>

          {/* Attachments */}
          <Card className="border border-slate-800 bg-slate-900/60 p-6 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Paperclip className="w-4 h-4 text-rose-500" /> Documents & Verification
            </h3>
            {caseData.attachments?.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No documents attached.</p>
            ) : (
              caseData.attachments?.map((att: any) => (
                <div key={att.id} className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs flex justify-between items-center">
                  <span className="font-bold text-white truncate max-w-[180px]">{att.fileName}</span>
                  <a href={att.fileUrl} target="_blank" rel="noreferrer" className="text-rose-400 hover:underline text-[11px]">
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
