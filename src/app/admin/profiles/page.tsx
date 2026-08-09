import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { ShieldCheck, XCircle, AlertCircle } from "lucide-react";
import { AdminProfileTable } from "./admin-profile-table";

export default async function AdminProfilesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; search?: string }>;
}) {
  const resolvedParams = await searchParams;
  const statusFilter = resolvedParams.status || "PENDING";
  const searchQuery = resolvedParams.search || "";

  const whereClause: any = { deletedAt: null };
  if (statusFilter !== "ALL") {
    whereClause.status = statusFilter;
  }
  if (searchQuery) {
    whereClause.OR = [
      { user: { name: { contains: searchQuery, mode: "insensitive" } } },
      { user: { email: { contains: searchQuery, mode: "insensitive" } } },
      { city: { contains: searchQuery, mode: "insensitive" } },
    ];
  }

  const profiles = await prisma.profile.findMany({
    where: whereClause,
    take: 50,
    orderBy: { updatedAt: "desc" },
    include: {
      user: {
        select: { id: true, name: true, email: true, phone: true, isActive: true },
      },
      photos: {
        where: { deletedAt: null },
      },
    },
  });

  const pendingCount = await prisma.profile.count({ where: { status: "PENDING", deletedAt: null } });
  const approvedCount = await prisma.profile.count({ where: { status: "APPROVED", deletedAt: null } });
  const rejectedCount = await prisma.profile.count({ where: { status: "REJECTED", deletedAt: null } });
  const suspendedCount = await prisma.profile.count({ where: { status: "SUSPENDED", deletedAt: null } });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-rose-400 to-pink-500 bg-clip-text text-transparent">
            Profile Approval Queue
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Review user profiles, photos, and identity details before granting platform access.
          </p>
        </div>
      </div>

      {/* Metric Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Link href="/admin/profiles?status=PENDING">
          <Card className={`border ${statusFilter === "PENDING" ? "border-amber-500 bg-amber-950/20" : "border-slate-800 bg-slate-900/60"} hover:border-amber-500 transition-all cursor-pointer`}>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 font-medium">Pending Review</p>
                <p className="text-2xl font-bold text-amber-400">{pendingCount}</p>
              </div>
              <ShieldCheck className="w-8 h-8 text-amber-500/40" />
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/profiles?status=APPROVED">
          <Card className={`border ${statusFilter === "APPROVED" ? "border-emerald-500 bg-emerald-950/20" : "border-slate-800 bg-slate-900/60"} hover:border-emerald-500 transition-all cursor-pointer`}>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 font-medium">Approved</p>
                <p className="text-2xl font-bold text-emerald-400">{approvedCount}</p>
              </div>
              <ShieldCheck className="w-8 h-8 text-emerald-500/40" />
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/profiles?status=REJECTED">
          <Card className={`border ${statusFilter === "REJECTED" ? "border-red-500 bg-red-950/20" : "border-slate-800 bg-slate-900/60"} hover:border-red-500 transition-all cursor-pointer`}>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 font-medium">Rejected</p>
                <p className="text-2xl font-bold text-red-400">{rejectedCount}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-500/40" />
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/profiles?status=SUSPENDED">
          <Card className={`border ${statusFilter === "SUSPENDED" ? "border-purple-500 bg-purple-950/20" : "border-slate-800 bg-slate-900/60"} hover:border-purple-500 transition-all cursor-pointer`}>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 font-medium">Suspended</p>
                <p className="text-2xl font-bold text-purple-400">{suspendedCount}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-purple-500/40" />
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Profiles Table Component */}
      <AdminProfileTable profiles={profiles} currentFilter={statusFilter} />
    </div>
  );
}
