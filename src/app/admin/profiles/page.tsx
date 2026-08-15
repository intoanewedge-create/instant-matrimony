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
      { user: { publicId: { contains: searchQuery, mode: "insensitive" } } },
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
        select: { id: true, name: true, email: true, phone: true, publicId: true, isActive: true, createdAt: true },
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
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Profile Moderation & Approvals
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Review and moderate member profiles, identity details, and photos before allowing public search visibility.
          </p>
        </div>
      </div>

      {/* Metric Summary Filter Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Link href="/admin/profiles?status=ALL">
          <Card className={`border rounded-2xl ${statusFilter === "ALL" ? "border-rose-500 bg-rose-50/80 shadow-sm" : "border-slate-200/90 bg-white"} hover:border-rose-300 transition-all cursor-pointer shadow-sm`}>
            <CardContent className="p-3.5 flex items-center justify-between">
              <div>
                <p className="text-[11px] text-slate-500 font-medium">All Profiles</p>
                <p className="text-xl font-bold text-slate-900">{allCount}</p>
              </div>
              <Users className="w-5 h-5 text-slate-400" />
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/profiles?status=PENDING">
          <Card className={`border rounded-2xl ${statusFilter === "PENDING" ? "border-amber-500 bg-amber-50/80 shadow-sm" : "border-slate-200/90 bg-white"} hover:border-amber-300 transition-all cursor-pointer shadow-sm`}>
            <CardContent className="p-3.5 flex items-center justify-between">
              <div>
                <p className="text-[11px] text-amber-700 font-medium">Pending Review</p>
                <p className="text-xl font-bold text-amber-800">{pendingCount}</p>
              </div>
              <ShieldCheck className="w-5 h-5 text-amber-500" />
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/profiles?status=APPROVED">
          <Card className={`border rounded-2xl ${statusFilter === "APPROVED" ? "border-emerald-500 bg-emerald-50/80 shadow-sm" : "border-slate-200/90 bg-white"} hover:border-emerald-300 transition-all cursor-pointer shadow-sm`}>
            <CardContent className="p-3.5 flex items-center justify-between">
              <div>
                <p className="text-[11px] text-emerald-700 font-medium">Approved</p>
                <p className="text-xl font-bold text-emerald-800">{approvedCount}</p>
              </div>
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/profiles?status=REJECTED">
          <Card className={`border rounded-2xl ${statusFilter === "REJECTED" ? "border-red-500 bg-red-50/80 shadow-sm" : "border-slate-200/90 bg-white"} hover:border-red-300 transition-all cursor-pointer shadow-sm`}>
            <CardContent className="p-3.5 flex items-center justify-between">
              <div>
                <p className="text-[11px] text-red-700 font-medium">Rejected</p>
                <p className="text-xl font-bold text-red-800">{rejectedCount}</p>
              </div>
              <XCircle className="w-5 h-5 text-red-500" />
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/profiles?status=SUSPENDED">
          <Card className={`border rounded-2xl ${statusFilter === "SUSPENDED" ? "border-purple-500 bg-purple-50/80 shadow-sm" : "border-slate-200/90 bg-white"} hover:border-purple-300 transition-all cursor-pointer shadow-sm`}>
            <CardContent className="p-3.5 flex items-center justify-between">
              <div>
                <p className="text-[11px] text-purple-700 font-medium">Suspended</p>
                <p className="text-xl font-bold text-purple-800">{suspendedCount}</p>
              </div>
              <AlertCircle className="w-5 h-5 text-purple-500" />
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/profiles?status=DRAFT">
          <Card className={`border rounded-2xl ${statusFilter === "DRAFT" ? "border-sky-500 bg-sky-50/80 shadow-sm" : "border-slate-200/90 bg-white"} hover:border-sky-300 transition-all cursor-pointer shadow-sm`}>
            <CardContent className="p-3.5 flex items-center justify-between">
              <div>
                <p className="text-[11px] text-sky-700 font-medium">In Draft</p>
                <p className="text-xl font-bold text-sky-800">{draftCount}</p>
              </div>
              <FileEdit className="w-5 h-5 text-sky-500" />
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Profiles Table Component */}
      <AdminProfileTable profiles={profiles} currentFilter={statusFilter} initialSearch={searchQuery} />
    </div>
  );
}
