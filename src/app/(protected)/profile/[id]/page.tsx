import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProfileDetailClient } from "./profile-detail-client";

export default async function ProfileDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  const selfUserId = (session.user as any).id;
  const targetUserId = (await params).id;

  const selfProfile = await prisma.profile.findUnique({
    where: { userId: selfUserId },
    select: { status: true },
  });
  const isAdmin = (session.user as any).role && (session.user as any).role !== "USER";
  if (!isAdmin && (!selfProfile || selfProfile.status !== "APPROVED")) {
    redirect("/dashboard");
  }

  // If viewing self, redirect to profile workspace
  if (selfUserId === targetUserId) {
    redirect("/profile");
  }

  // Fetch target profile with privacy settings
  const targetProfile = await prisma.profile.findUnique({
    where: { userId: targetUserId },
    include: {
      photos: { where: { deletedAt: null } },
      privacy: true,
      partnerPreference: true,
      user: {
        select: { id: true, name: true, email: true, phone: true, publicId: true, isActive: true, identityVerification: true },
      },
    },
  });

  if (
    !targetProfile ||
    targetProfile.deletedAt !== null ||
    targetProfile.status === "DELETED" ||
    !targetProfile.user?.isActive ||
    (!isAdmin && targetProfile.status !== "APPROVED")
  ) {
    redirect("/dashboard");
  }

  if (!isAdmin) {
    const { container } = await import("@/lib/container");
    const canView = await container.services.permissionService.canViewProfile(selfUserId, targetUserId);
    if (!canView) {
      redirect("/dashboard");
    }
  }

  // Record profile visit for history tracking
  if (selfUserId !== targetUserId) {
    await prisma.profileVisitor.create({
      data: {
        visitorId: selfUserId,
        visitedId: targetUserId,
      },
    }).catch(() => {});
  }

  // Check connection status
  const sentInterest = await prisma.interest.findFirst({
    where: { senderId: selfUserId, receiverId: targetUserId },
  });

  const receivedInterest = await prisma.interest.findFirst({
    where: { senderId: targetUserId, receiverId: selfUserId },
  });

  // Check contact unlock
  const unlockedContact = await prisma.contactUnlock.findFirst({
    where: { userId: selfUserId, targetUserId },
  });
  const isUnlocked = !!unlockedContact;

  // Check existing conversation
  const conversationParticipant = await prisma.conversationParticipant.findFirst({
    where: { userId: selfUserId },
    include: {
      conversation: {
        include: {
          participants: {
            where: { userId: targetUserId },
          },
        },
      },
    },
  });

  const hasChat = !!conversationParticipant?.conversation?.participants?.length;
  const conversationId = hasChat ? conversationParticipant.conversation.id : null;

  const serializedProfile = JSON.parse(JSON.stringify(targetProfile));
  if (!isUnlocked && !isAdmin) {
    if (serializedProfile.user) {
      delete serializedProfile.user.phone;
      delete serializedProfile.user.email;
    }
  }
  const serializedSentInterest = sentInterest ? JSON.parse(JSON.stringify(sentInterest)) : null;
  const serializedReceivedInterest = receivedInterest ? JSON.parse(JSON.stringify(receivedInterest)) : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50/30 via-slate-50 to-white text-slate-900 pb-12">
      <ProfileDetailClient
        profile={serializedProfile}
        initialSentInterest={serializedSentInterest}
        initialReceivedInterest={serializedReceivedInterest}
        conversationId={conversationId}
        isUnlocked={isUnlocked}
        isAdmin={(session.user as any).role === "ADMIN"}
      />
    </div>
  );
}
