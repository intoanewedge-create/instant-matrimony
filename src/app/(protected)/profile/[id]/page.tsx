import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { container } from "@/lib/container";
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

  // If viewing self, redirect to profile workspace
  if (selfUserId === targetUserId) {
    redirect("/profile");
  }

  // Fetch target profile
  const targetProfile = await container.repositories.profileRepository.findByUserId(targetUserId);
  if (!targetProfile) {
    redirect("/dashboard");
  }

  // Check connection status
  const sentInterest = await prisma.interest.findFirst({
    where: { senderId: selfUserId, receiverId: targetUserId },
  });

  const receivedInterest = await prisma.interest.findFirst({
    where: { senderId: targetUserId, receiverId: selfUserId },
  });

  // Check if they have an existing conversation
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

  // Convert dates and relation entities safely for client component
  const serializedProfile = JSON.parse(JSON.stringify(targetProfile));
  const serializedSentInterest = sentInterest ? JSON.parse(JSON.stringify(sentInterest)) : null;
  const serializedReceivedInterest = receivedInterest ? JSON.parse(JSON.stringify(receivedInterest)) : null;

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-12">
      <ProfileDetailClient
        profile={serializedProfile}
        initialSentInterest={serializedSentInterest}
        initialReceivedInterest={serializedReceivedInterest}
        conversationId={conversationId}
      />
    </div>
  );
}
