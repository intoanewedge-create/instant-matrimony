import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { container } from "@/lib/container";
import { VerificationClient } from "./verification-client";

export default async function VerificationPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  const userId = (session.user as any).id;

  const profileResult = await container.services.profileService.getProfileByUserId(userId);
  if (!profileResult.success) {
    redirect("/onboarding");
  }
  const profile = profileResult.data;

  // Fetch photos
  // @ts-ignore
  const photos = await container.repositories.photoRepository.findByProfileId(profile.id);

  // Fetch identity verification
  const verification = await container.repositories.verificationRepository.findByUserId(userId);

  // Serialize before passing to client component (resolve Date objects warnings)
  const serializedPhotos = photos.map(p => ({
    id: p.id,
    url: p.url,
    isMain: p.isMain,
    isApproved: p.isApproved,
    createdAt: p.createdAt.toISOString(),
  }));

  const serializedVerification = verification ? {
    id: verification.id,
    status: verification.status,
    documentType: verification.documentType,
    documentUrl: (verification as any).documentMedia?.url || "",
    selfieUrl: (verification as any).selfieMedia?.url || "",
    rejectionReason: verification.rejectionReason,
  } : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50/30 via-slate-50 to-white text-slate-900 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <VerificationClient
          profile={profile}
          initialPhotos={serializedPhotos}
          initialVerification={serializedVerification}
        />
      </div>
    </div>
  );
}
