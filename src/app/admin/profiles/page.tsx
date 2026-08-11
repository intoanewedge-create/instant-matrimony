import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { ShieldCheck, XCircle, AlertCircle, Users, FileEdit } from "lucide-react";
import { AdminProfileTable } from "./admin-profile-table";

export const dynamic = "force-dynamic";

export default async function AdminProfilesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; search?: string }>;
}) {
  const resolvedParams = await searchParams;
  const statusFilter = resolvedParams.status || "ALL";
  const searchQuery = resolvedParams.search || "";

  const whereClause: any = { deletedAt: null };
  if (statusFilter !== "ALL") {
    whereClause.status = statusFilter;
  }
  if (searchQuery) {
    whereClause.OR = [
      { user: { name: { contains: searchQuery, mode: "insensitive" } } },
      { user: { email: { contains: searchQuery, mode: "insensitive" } } },
      { user: { phone: { contains: searchQuery, mode: "insensitive" } } },
      { city: { contains: searchQuery, mode: "insensitive" } },
      { caste: { contains: searchQuery, mode: "insensitive" } },
    ];
  }

  const profiles = await prisma.profile.findMany({
    where: whereClause,
    take: 100,
    orderBy: { updatedAt: "desc" },
    include: {
      user: {
        select: { id: true, name: true, email: true, phone: true, isActive: true, createdAt: true },
      },
      photos: {
        where: { deletedAt: null },
      },
    },
  });

  const [
    allCount,
    pendingCount,
    approvedCount,
    rejectedCount,
    suspendedCount,
    draftCount,
  ] = await Promise.all([
    prisma.profile.count({ where: { deletedAt: null } }),
    prisma.profile.count({ where: { status: "PENDING", deletedAt: null } }),
    prisma.profile.count({ where: { status: "APPROVED", deletedAt: null } }),
    prisma.profile.count({ where: { status: "REJECTED", deletedAt: null } }),
    prisma.profile.count({ where: { status: "SUSPENDED", deletedAt: null } }),
    prisma.profile.count({ where: { status: "DRAFT", deletedAt: null } }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-rose-400 to-pink-500 bg-clip-text text-transparent">
            Profile Moderation & Approvals
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Review and moderate member profiles, identity details, and photos before allowing public search visibility.
          </p>
        </div>
      </div>

      {/* Metric Summary Filter Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Link href="/admin/profiles?status=ALL">
          <Card className={`border ${statusFilter === "ALL" ? "border-rose-500 bg-rose-950/20 shadow-md shadow-rose-950/30" : "border-slate-800 bg-slate-900/60"} hover:border-rose-500 transition-all cursor-pointer`}>
            <CardContent className="p-3.5 flex items-center justify-between">
              <div>
                <p className="text-[11px] text-slate-400 font-medium">All Profiles</p>
                <p className="text-xl font-bold text-slate-100">{allCount}</p>
              </div>
              <Users className="w-6 h-6 text-slate-500" />
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/profiles?status=PENDING">
          <Card className={`border ${statusFilter === "PENDING" ? "border-amber-500 bg-amber-950/20 shadow-md shadow-amber-950/30" : "border-slate-800 bg-slate-900/60"} hover:border-amber-500 transition-all cursor-pointer`}>
            <CardContent className="p-3.5 flex items-center justify-between">
              <div>
                <p className="text-[11px] text-slate-400 font-medium">Pending Review</p>
                <p className="text-xl font-bold text-amber-400">{pendingCount}</p>
              </div>
              <ShieldCheck className="w-6 h-6 text-amber-500/50" />
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/profiles?status=APPROVED">
          <Card className={`border ${statusFilter === "APPROVED" ? "border-emerald-500 bg-emerald-950/20 shadow-md shadow-emerald-950/30" : "border-slate-800 bg-slate-900/60"} hover:border-emerald-500 transition-all cursor-pointer`}>
            <CardContent className="p-3.5 flex items-center justify-between">
              <div>
                <p className="text-[11px] text-slate-400 font-medium">Approved</p>
                <p className="text-xl font-bold text-emerald-400">{approvedCount}</p>
              </div>
              <ShieldCheck className="w-6 h-6 text-emerald-500/50" />
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/profiles?status=REJECTED">
          <Card className={`border ${statusFilter === "REJECTED" ? "border-red-500 bg-red-950/20 shadow-md shadow-red-950/30" : "border-slate-800 bg-slate-900/60"} hover:border-red-500 transition-all cursor-pointer`}>
            <CardContent className="p-3.5 flex items-center justify-between">
              <div>
                <p className="text-[11px] text-slate-400 font-medium">Rejected</p>
                <p className="text-xl font-bold text-red-400">{rejectedCount}</p>
              </div>
              <XCircle className="w-6 h-6 text-red-500/50" />
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/profiles?status=SUSPENDED">
          <Card className={`border ${statusFilter === "SUSPENDED" ? "border-purple-500 bg-purple-950/20 shadow-md shadow-purple-950/30" : "border-slate-800 bg-slate-900/60"} hover:border-purple-500 transition-all cursor-pointer`}>
            <CardContent className="p-3.5 flex items-center justify-between">
              <div>
                <p className="text-[11px] text-slate-400 font-medium">Suspended</p>
                <p className="text-xl font-bold text-purple-400">{suspendedCount}</p>
              </div>
              <AlertCircle className="w-6 h-6 text-purple-500/50" />
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/profiles?status=DRAFT">
          <Card className={`border ${statusFilter === "DRAFT" ? "border-sky-500 bg-sky-950/20 shadow-md shadow-sky-950/30" : "border-slate-800 bg-slate-900/60"} hover:border-sky-500 transition-all cursor-pointer`}>
            <CardContent className="p-3.5 flex items-center justify-between">
              <div>
                <p className="text-[11px] text-slate-400 font-medium">In Draft</p>
                <p className="text-xl font-bold text-sky-400">{draftCount}</p>
              </div>
              <FileEdit className="w-6 h-6 text-sky-500/50" />
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Profiles Table Component */}
      <AdminProfileTable profiles={profiles} currentFilter={statusFilter} initialSearch={searchQuery} />
    </div>
  );
}
