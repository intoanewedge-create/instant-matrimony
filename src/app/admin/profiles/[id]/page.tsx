import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ArrowLeft, Image as ImageIcon, User, Briefcase } from "lucide-react";
import { AdminProfileDetailActions } from "./admin-profile-detail-actions";

export default async function AdminProfileDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const profileId = resolvedParams.id;

  const profile = await prisma.profile.findUnique({
    where: { id: profileId },
    include: {
      user: {
        select: { id: true, name: true, email: true, phone: true, createdAt: true },
      },
      photos: {
        where: { deletedAt: null },
      },
      privacy: true,
      partnerPreference: true,
    },
  });

  if (!profile) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/profiles"
          className="inline-flex items-center justify-center rounded-md text-xs font-semibold px-3 py-1.5 border border-slate-800 text-slate-300 hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Queue
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
            Reviewing Profile: <span className="text-rose-400">{profile.user?.name}</span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                profile.status === "APPROVED"
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  : profile.status === "PENDING"
                  ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                  : profile.status === "REJECTED"
                  ? "bg-red-500/10 text-red-400 border border-red-500/20"
                  : profile.status === "DELETED"
                  ? "bg-zinc-800 text-zinc-400 border border-zinc-700"
                  : "bg-purple-500/10 text-purple-400 border border-purple-500/20"
              }`}
            >
              {profile.status}
            </span>
          </h1>
          <p className="text-xs text-slate-400">User ID: {profile.userId} | Submitted: {new Date(profile.createdAt).toLocaleDateString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Profile Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Photos Card */}
          <Card className="border border-slate-800 bg-slate-900/60 backdrop-blur-xl">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-800 pb-4">
              <CardTitle className="text-lg font-semibold flex items-center gap-2 text-rose-400">
                <ImageIcon className="w-5 h-5" /> Profile Photos ({profile.photos.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {profile.photos.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No photos uploaded by this member.</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {profile.photos.map((photo, idx) => (
                    <div key={photo.id} className="relative rounded-lg overflow-hidden border border-slate-800 bg-slate-950 aspect-square group">
                      <img
                        src={photo.url}
                        alt={`Photo ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      {photo.isMain && (
                        <span className="absolute top-2 left-2 bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow">
                          Main
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Demographics & Background */}
          <Card className="border border-slate-800 bg-slate-900/60 backdrop-blur-xl">
            <CardHeader className="border-b border-slate-800 pb-4">
              <CardTitle className="text-lg font-semibold flex items-center gap-2 text-rose-400">
                <User className="w-5 h-5" /> Demographics & Cultural Background
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-xs text-slate-400 block">Gender</span>
                <span className="font-semibold text-slate-200">{profile.gender || "N/A"}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block">Date of Birth</span>
                <span className="font-semibold text-slate-200">
                  {profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : "N/A"}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block">Height / Weight</span>
                <span className="font-semibold text-slate-200">
                  {profile.height ? `${profile.height} cm` : "N/A"} {profile.weight ? `/ ${profile.weight} kg` : ""}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block">Marital Status</span>
                <span className="font-semibold text-slate-200">{profile.maritalStatus || "N/A"}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block">Religion</span>
                <span className="font-semibold text-slate-200">{profile.religion || "N/A"}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block">Caste / Sub-Caste</span>
                <span className="font-semibold text-slate-200">
                  {profile.caste || "N/A"} {profile.subCaste ? `(${profile.subCaste})` : ""}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block">Gothram</span>
                <span className="font-semibold text-slate-200">{profile.gothram || "N/A"}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block">Mother Tongue</span>
                <span className="font-semibold text-slate-200">{profile.motherTongue || "N/A"}</span>
              </div>
            </CardContent>
          </Card>

          {/* Education & Career */}
          <Card className="border border-slate-800 bg-slate-900/60 backdrop-blur-xl">
            <CardHeader className="border-b border-slate-800 pb-4">
              <CardTitle className="text-lg font-semibold flex items-center gap-2 text-rose-400">
                <Briefcase className="w-5 h-5" /> Education, Profession & Location
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-xs text-slate-400 block">Highest Education</span>
                <span className="font-semibold text-slate-200">{profile.education || "N/A"}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block">Occupation</span>
                <span className="font-semibold text-slate-200">{profile.occupation || "N/A"}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block">Annual Income</span>
                <span className="font-semibold text-slate-200">
                  {profile.income ? `₹${profile.income.toLocaleString()}` : "N/A"}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block">Current Location</span>
                <span className="font-semibold text-slate-200">
                  {profile.city ? `${profile.city}, ${profile.state || ""}, ${profile.country || ""}` : "N/A"}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Bio & Family Details */}
          <Card className="border border-slate-800 bg-slate-900/60 backdrop-blur-xl">
            <CardHeader className="border-b border-slate-800 pb-4">
              <CardTitle className="text-lg font-semibold flex items-center gap-2 text-rose-400">
                About & Family Description
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4 text-sm">
              <div>
                <span className="text-xs text-slate-400 block mb-1">About Me Bio</span>
                <p className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-slate-300">
                  {profile.bio || "No bio provided."}
                </p>
              </div>
              <div>
                <span className="text-xs text-slate-400 block mb-1">Family Details</span>
                <p className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-slate-300">
                  {profile.familyDetails || "No family details provided."}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Col: Admin Controls */}
        <div className="space-y-6">
          <AdminProfileDetailActions profile={profile} />
        </div>
      </div>
    </div>
  );
}
