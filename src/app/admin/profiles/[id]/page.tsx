import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ArrowLeft, Image as ImageIcon, User, Briefcase } from "lucide-react";
import { AdminProfileDetailActions } from "./admin-profile-detail-actions";
import { getDisplayProfileId } from "@/lib/utils/public-id";

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
        select: { id: true, publicId: true, createdAt: true },
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

  const displayProfileId = getDisplayProfileId(profile.user, profile.userId);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/profiles"
          className="inline-flex items-center justify-center rounded-xl text-xs font-semibold px-3 py-1.5 border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 transition-colors shadow-sm"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Queue
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            Reviewing Profile: <span className="text-rose-600">{displayProfileId}</span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                profile.status === "APPROVED"
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : profile.status === "PENDING"
                  ? "bg-amber-50 text-amber-700 border border-amber-200"
                  : profile.status === "REJECTED"
                  ? "bg-red-50 text-red-700 border border-red-200"
                  : profile.status === "DELETED"
                  ? "bg-zinc-100 text-zinc-600 border border-zinc-200"
                  : "bg-purple-50 text-purple-700 border border-purple-200"
              }`}
            >
              {profile.status}
            </span>
          </h1>
          <p className="text-xs text-slate-500">Profile ID: {displayProfileId} | Submitted: {new Date(profile.createdAt).toLocaleDateString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Profile Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Photos Card */}
          <Card className="border border-slate-200/90 bg-white shadow-sm rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-4">
              <CardTitle className="text-lg font-semibold flex items-center gap-2 text-rose-600">
                <ImageIcon className="w-5 h-5" /> Profile Photos ({profile.photos.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {profile.photos.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No photos uploaded by this member.</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {profile.photos.map((photo, idx) => (
                    <div key={photo.id} className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-100 aspect-square group shadow-sm">
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
          <Card className="border border-slate-200/90 bg-white shadow-sm rounded-2xl">
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle className="text-lg font-semibold flex items-center gap-2 text-rose-600">
                <User className="w-5 h-5" /> Demographics & Cultural Background
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-xs text-slate-500 block">Gender</span>
                <span className="font-semibold text-slate-800">{profile.gender || "N/A"}</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Date of Birth</span>
                <span className="font-semibold text-slate-800">
                  {profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : "N/A"}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Height / Weight</span>
                <span className="font-semibold text-slate-800">
                  {profile.height ? `${profile.height} cm` : "N/A"} {profile.weight ? `/ ${profile.weight} kg` : ""}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Marital Status</span>
                <span className="font-semibold text-slate-800">{profile.maritalStatus || "N/A"}</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Religion</span>
                <span className="font-semibold text-slate-800">{profile.religion || "N/A"}</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Caste / Sub-Caste</span>
                <span className="font-semibold text-slate-800">
                  {profile.caste || "N/A"} {profile.subCaste ? `(${profile.subCaste})` : ""}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Gothram</span>
                <span className="font-semibold text-slate-800">{profile.gothram || "N/A"}</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Mother Tongue</span>
                <span className="font-semibold text-slate-800">{profile.motherTongue || "N/A"}</span>
              </div>
            </CardContent>
          </Card>

          {/* Education & Career */}
          <Card className="border border-slate-200/90 bg-white shadow-sm rounded-2xl">
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle className="text-lg font-semibold flex items-center gap-2 text-rose-600">
                <Briefcase className="w-5 h-5" /> Education, Profession & Location
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-xs text-slate-500 block">Highest Education</span>
                <span className="font-semibold text-slate-800">{profile.education || "N/A"}</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Occupation</span>
                <span className="font-semibold text-slate-800">{profile.occupation || "N/A"}</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Annual Income</span>
                <span className="font-semibold text-slate-800">
                  {profile.income ? `₹${profile.income.toLocaleString()}` : "N/A"}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Current Location</span>
                <span className="font-semibold text-slate-800">
                  {profile.city ? `${profile.city}, ${profile.state || ""}, ${profile.country || ""}` : "N/A"}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Bio & Family Details */}
          <Card className="border border-slate-200/90 bg-white shadow-sm rounded-2xl">
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle className="text-lg font-semibold flex items-center gap-2 text-rose-600">
                About & Family Description
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4 text-sm">
              <div>
                <span className="text-xs text-slate-500 block mb-1">About Me Bio</span>
                <p className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700">
                  {profile.bio || "No bio provided."}
                </p>
              </div>
              <div>
                <span className="text-xs text-slate-500 block mb-1">Family Details</span>
                <p className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700">
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
