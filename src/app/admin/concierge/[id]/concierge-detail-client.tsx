"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  updateConciergeStatusAction,
  assignConciergeAdminAction,
  publishConciergeUpdateAction,
  shortlistMatchAction,
  scheduleConciergeMeetingAction,
  logConciergeCallAction,
  addConciergeAttachmentAction,
} from "@/lib/actions/concierge.actions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  Calendar,
  PhoneCall,
  FileText,
  Paperclip,
  Sparkles,
  Plus,
} from "lucide-react";

export function ConciergeDetailClient({
  caseData: initialCase,
  admins,
}: {
  caseData: any;
  admins: any[];
}) {
  const router = useRouter();
  const [caseData, setCaseData] = useState(initialCase);
  const [activeTab, setActiveTab] = useState<"shortlists" | "updates" | "meetings" | "calls" | "attachments">("shortlists");
  const [loading, setLoading] = useState(false);

  // Forms states
  const [newUpdate, setNewUpdate] = useState("");
  const [isCustomerVisible, setIsCustomerVisible] = useState(true);

  const [shortlistTargetId, setShortlistTargetId] = useState("");
  const [shortlistNotes, setShortlistNotes] = useState("");

  const [meetingTitle, setMeetingTitle] = useState("");
  const [meetingTime, setMeetingTime] = useState("");
  const [meetingLocation, setMeetingLocation] = useState("");
  const [meetingNotes, setMeetingNotes] = useState("");

  const [callPerson, setCallPerson] = useState("");
  const [callDuration, setCallDuration] = useState("");
  const [callNotes, setCallNotes] = useState("");

  const [fileName, setFileName] = useState("");
  const [fileUrl, setFileUrl] = useState("");

  const handleStatusChange = async (status: string) => {
    setLoading(true);
    try {
      const res = await updateConciergeStatusAction(caseData.id, status);
      if (res.success) {
        setCaseData((prev: any) => ({ ...prev, status }));
        router.refresh();
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleAssignAdmin = async (adminId: string) => {
    setLoading(true);
    try {
      const res = await assignConciergeAdminAction(caseData.id, adminId);
      if (res.success) {
        const adminObj = admins.find((a) => a.id === adminId);
        setCaseData((prev: any) => ({ ...prev, assignedAdminId: adminId, assignedAdmin: adminObj }));
        router.refresh();
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handlePublishUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUpdate.trim()) return;
    setLoading(true);

    try {
      const res = await publishConciergeUpdateAction(caseData.id, newUpdate.trim(), isCustomerVisible);
      if (res.success) {
        setCaseData((prev: any) => ({
          ...prev,
          updates: [res.data, ...(prev.updates || [])],
        }));
        setNewUpdate("");
        router.refresh();
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleAddShortlist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shortlistTargetId.trim()) return;
    setLoading(true);

    try {
      const res = await shortlistMatchAction(caseData.id, shortlistTargetId.trim(), shortlistNotes);
      if (res.success) {
        router.refresh();
        setShortlistTargetId("");
        setShortlistNotes("");
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!meetingTitle || !meetingTime) return;
    setLoading(true);

    try {
      const res = await scheduleConciergeMeetingAction(caseData.id, meetingTitle, meetingTime, meetingLocation, meetingNotes);
      if (res.success) {
        setCaseData((prev: any) => ({
          ...prev,
          meetings: [...(prev.meetings || []), res.data],
        }));
        setMeetingTitle("");
        setMeetingTime("");
        setMeetingLocation("");
        setMeetingNotes("");
        router.refresh();
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleLogCall = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!callPerson || !callNotes) return;
    setLoading(true);

    try {
      const res = await logConciergeCallAction(caseData.id, callPerson, Number(callDuration || 0), callNotes);
      if (res.success) {
        setCaseData((prev: any) => ({
          ...prev,
          callLogs: [res.data, ...(prev.callLogs || [])],
        }));
        setCallPerson("");
        setCallDuration("");
        setCallNotes("");
        router.refresh();
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleAddAttachment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileName || !fileUrl) return;
    setLoading(true);

    try {
      const res = await addConciergeAttachmentAction(caseData.id, fileName, fileUrl);
      if (res.success) {
        setCaseData((prev: any) => ({
          ...prev,
          attachments: [res.data, ...(prev.attachments || [])],
        }));
        setFileName("");
        setFileUrl("");
        router.refresh();
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const statuses = [
    "OPEN",
    "SEARCHING_MATCHES",
    "SHORTLIST_PREPARED",
    "FAMILY_CONTACT",
    "MEETING_SCHEDULED",
    "NEGOTIATION",
    "MARRIAGE_CONFIRMED",
    "CLOSED",
  ];

  return (
    <div className="space-y-8">
      {/* Back & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div className="flex items-center gap-3">
          <Link href="/admin/concierge" className="text-slate-400 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
              Concierge Case: {caseData.user?.name} <Sparkles className="w-5 h-5 text-amber-400" />
            </h1>
            <p className="text-xs text-slate-400">{caseData.user?.email} • {caseData.user?.phone}</p>
          </div>
        </div>

        {/* Manager Assigner */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400">Assigned Admin:</span>
          <select
            value={caseData.assignedAdminId || ""}
            onChange={(e) => handleAssignAdmin(e.target.value)}
            className="bg-slate-900 border border-slate-800 text-xs text-rose-400 font-bold rounded-lg px-3 py-2 focus:outline-none"
          >
            <option value="">Unassigned</option>
            {admins.map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Status Progress Pipeline Bar */}
      <Card className="border border-slate-800 bg-slate-900/60 p-6 space-y-3">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Case Lifecycle Pipeline</span>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {statuses.map((st) => {
            const isCurrent = caseData.status === st;
            return (
              <button
                key={st}
                disabled={loading}
                onClick={() => handleStatusChange(st)}
                className={`p-2.5 rounded-xl border text-[10px] font-extrabold transition-all text-center ${
                  isCurrent
                    ? "bg-rose-600 border-rose-500 text-white shadow-lg shadow-rose-600/30"
                    : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white"
                }`}
              >
                {st.replace(/_/g, " ")}
              </button>
            );
          })}
        </div>
      </Card>

      {/* Main Tabbed Workspace */}
      <div className="space-y-6">
        {/* Workspace Navigation Bar */}
        <div className="flex border-b border-slate-800 gap-4 overflow-x-auto text-xs font-bold">
          {[
            { id: "shortlists", label: `Shortlisted Matches (${caseData.shortlists?.length || 0})`, icon: Sparkles },
            { id: "updates", label: `Updates & Notes (${caseData.updates?.length || 0})`, icon: FileText },
            { id: "meetings", label: `Meetings (${caseData.meetings?.length || 0})`, icon: Calendar },
            { id: "calls", label: `Call Logs (${caseData.callLogs?.length || 0})`, icon: PhoneCall },
            { id: "attachments", label: `Attachments (${caseData.attachments?.length || 0})`, icon: Paperclip },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 pb-3 border-b-2 font-bold transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-rose-500 text-rose-400"
                    : "border-transparent text-slate-400 hover:text-white"
                }`}
              >
                <Icon className="w-4 h-4" /> {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab 1: Shortlists */}
        {activeTab === "shortlists" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="border border-slate-800 bg-slate-900/60 p-6 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-rose-500" /> Shortlist Match Profile
              </h3>
              <form onSubmit={handleAddShortlist} className="space-y-3 text-xs">
                <div>
                  <Label htmlFor="targetUserId">Target Member User ID</Label>
                  <Input
                    id="targetUserId"
                    type="text"
                    placeholder="Enter target member User ID"
                    value={shortlistTargetId}
                    onChange={(e) => setShortlistTargetId(e.target.value)}
                    className="bg-slate-950 border-slate-800 text-white"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="shortlistNotes">Shortlist Notes</Label>
                  <textarea
                    id="shortlistNotes"
                    rows={2}
                    placeholder="Compatibility notes for family..."
                    value={shortlistNotes}
                    onChange={(e) => setShortlistNotes(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                  />
                </div>
                <Button type="submit" disabled={loading} className="w-full bg-rose-600 hover:bg-rose-500 text-white font-semibold">
                  Add to Shortlist
                </Button>
              </form>
            </Card>

            <div className="lg:col-span-2 space-y-3">
              {caseData.shortlists?.length === 0 ? (
                <Card className="border border-slate-800 bg-slate-900/60 p-8 text-center text-slate-500 text-xs">
                  No match candidates shortlisted yet.
                </Card>
              ) : (
                caseData.shortlists?.map((s: any) => (
                  <Card key={s.id} className="border border-slate-800 bg-slate-900/60 p-4 space-y-2">
                    <div className="flex justify-between items-start text-xs">
                      <div>
                        <h4 className="font-bold text-white text-sm">{s.targetUser?.name || "Shortlisted Member"}</h4>
                        <p className="text-slate-400">{s.targetUser?.email}</p>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                        {s.status}
                      </span>
                    </div>
                    {s.notes && <p className="text-xs text-slate-300 italic">{s.notes}</p>}
                  </Card>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Updates & Notes */}
        {activeTab === "updates" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="border border-slate-800 bg-slate-900/60 p-6 space-y-4">
              <h3 className="text-sm font-bold text-white">Post Case Update</h3>
              <form onSubmit={handlePublishUpdate} className="space-y-3 text-xs">
                <textarea
                  rows={4}
                  placeholder="Type progress update or internal notes..."
                  value={newUpdate}
                  onChange={(e) => setNewUpdate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none"
                  required
                />
                <div className="flex items-center gap-2">
                  <input
                    id="isCustomerVisible"
                    type="checkbox"
                    checked={isCustomerVisible}
                    onChange={(e) => setIsCustomerVisible(e.target.checked)}
                    className="rounded border-slate-800 bg-slate-950 text-rose-600"
                  />
                  <Label htmlFor="isCustomerVisible" className="cursor-pointer">Publish to Customer Dashboard</Label>
                </div>
                <Button type="submit" disabled={loading} className="w-full bg-rose-600 hover:bg-rose-500 text-white font-semibold">
                  Publish Update
                </Button>
              </form>
            </Card>

            <div className="lg:col-span-2 space-y-3">
              {caseData.updates?.map((u: any) => (
                <Card key={u.id} className="border border-slate-800 bg-slate-900/60 p-4 space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${u.isCustomerVisible ? "bg-emerald-500/10 text-emerald-400" : "bg-slate-800 text-slate-400"}`}>
                      {u.isCustomerVisible ? "Customer Visible" : "Admin Only Note"}
                    </span>
                    <span className="text-slate-500 text-[10px]">{new Date(u.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-slate-200 pt-1 leading-relaxed">{u.content}</p>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Meetings */}
        {activeTab === "meetings" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="border border-slate-800 bg-slate-900/60 p-6 space-y-4">
              <h3 className="text-sm font-bold text-white">Schedule Family Meeting</h3>
              <form onSubmit={handleScheduleMeeting} className="space-y-3 text-xs">
                <div>
                  <Label htmlFor="meetingTitle">Meeting Title</Label>
                  <Input
                    id="meetingTitle"
                    type="text"
                    placeholder="e.g. Initial Family Introductory Call"
                    value={meetingTitle}
                    onChange={(e) => setMeetingTitle(e.target.value)}
                    className="bg-slate-950 border-slate-800 text-white"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="meetingTime">Scheduled Date & Time</Label>
                  <Input
                    id="meetingTime"
                    type="datetime-local"
                    value={meetingTime}
                    onChange={(e) => setMeetingTime(e.target.value)}
                    className="bg-slate-950 border-slate-800 text-white"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="meetingLocation">Location / Meeting Link</Label>
                  <Input
                    id="meetingLocation"
                    type="text"
                    placeholder="e.g. Taj Hotel Coffee Shop / Google Meet Link"
                    value={meetingLocation}
                    onChange={(e) => setMeetingLocation(e.target.value)}
                    className="bg-slate-950 border-slate-800 text-white"
                  />
                </div>
                <Button type="submit" disabled={loading} className="w-full bg-rose-600 hover:bg-rose-500 text-white font-semibold">
                  Schedule Meeting
                </Button>
              </form>
            </Card>

            <div className="lg:col-span-2 space-y-3">
              {caseData.meetings?.map((m: any) => (
                <Card key={m.id} className="border border-slate-800 bg-slate-900/60 p-4 space-y-2">
                  <div className="flex justify-between items-start text-xs">
                    <div>
                      <h4 className="font-bold text-white text-sm">{m.title}</h4>
                      <p className="text-rose-400 font-mono text-[11px]">{new Date(m.scheduledAt).toLocaleString()}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-400">
                      {m.status}
                    </span>
                  </div>
                  {m.location && <p className="text-xs text-slate-300">Location: {m.location}</p>}
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Call Logs */}
        {activeTab === "calls" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="border border-slate-800 bg-slate-900/60 p-6 space-y-4">
              <h3 className="text-sm font-bold text-white">Log Phone Call</h3>
              <form onSubmit={handleLogCall} className="space-y-3 text-xs">
                <div>
                  <Label htmlFor="callPerson">Person Contacted</Label>
                  <Input
                    id="callPerson"
                    type="text"
                    placeholder="e.g. Father of Candidate"
                    value={callPerson}
                    onChange={(e) => setCallPerson(e.target.value)}
                    className="bg-slate-950 border-slate-800 text-white"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="callDuration">Duration (minutes)</Label>
                  <Input
                    id="callDuration"
                    type="number"
                    placeholder="15"
                    value={callDuration}
                    onChange={(e) => setCallDuration(e.target.value)}
                    className="bg-slate-950 border-slate-800 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="callNotes">Call Summary & Notes</Label>
                  <textarea
                    id="callNotes"
                    rows={3}
                    placeholder="Key points discussed during call..."
                    value={callNotes}
                    onChange={(e) => setCallNotes(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                    required
                  />
                </div>
                <Button type="submit" disabled={loading} className="w-full bg-rose-600 hover:bg-rose-500 text-white font-semibold">
                  Log Call
                </Button>
              </form>
            </Card>

            <div className="lg:col-span-2 space-y-3">
              {caseData.callLogs?.map((cl: any) => (
                <Card key={cl.id} className="border border-slate-800 bg-slate-900/60 p-4 space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-white">{cl.person} ({cl.duration || 0} mins)</span>
                    <span className="text-slate-500 text-[10px]">{new Date(cl.calledAt).toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-slate-300 pt-1">{cl.notes}</p>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Tab 5: Attachments */}
        {activeTab === "attachments" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="border border-slate-800 bg-slate-900/60 p-6 space-y-4">
              <h3 className="text-sm font-bold text-white">Add Document Attachment</h3>
              <form onSubmit={handleAddAttachment} className="space-y-3 text-xs">
                <div>
                  <Label htmlFor="fileName">Document Name</Label>
                  <Input
                    id="fileName"
                    type="text"
                    placeholder="e.g. Horoscope Verification Report.pdf"
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    className="bg-slate-950 border-slate-800 text-white"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="fileUrl">File URL</Label>
                  <Input
                    id="fileUrl"
                    type="text"
                    placeholder="e.g. https://storage.com/file.pdf"
                    value={fileUrl}
                    onChange={(e) => setFileUrl(e.target.value)}
                    className="bg-slate-950 border-slate-800 text-white"
                    required
                  />
                </div>
                <Button type="submit" disabled={loading} className="w-full bg-rose-600 hover:bg-rose-500 text-white font-semibold">
                  Add Attachment
                </Button>
              </form>
            </Card>

            <div className="lg:col-span-2 space-y-3">
              {caseData.attachments?.map((att: any) => (
                <Card key={att.id} className="border border-slate-800 bg-slate-900/60 p-4 flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <Paperclip className="w-4 h-4 text-rose-500" />
                    <span className="font-bold text-white">{att.fileName}</span>
                  </div>
                  <a href={att.fileUrl} target="_blank" rel="noreferrer" className="text-rose-400 hover:underline">
                    Download
                  </a>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
