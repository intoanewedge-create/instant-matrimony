import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { InterestsClient } from "./interests-client";
import { container } from "@/lib/container";

export default async function InterestsPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  const userId = (session.user as any).id;

  const profileResult = await container.services.profileService.getProfileByUserId(userId);
  if (!profileResult.success) {
    redirect("/onboarding");
  }
  // @ts-ignore
  if (profileResult.data.status === "DRAFT") {
    redirect("/onboarding");
  }

  // Fetch received and sent interests with member profiles and photos
  const [receivedInterests, sentInterests] = await Promise.all([
    prisma.interest.findMany({
      where: {
        receiverId: userId,
        sender: { deletedAt: null, isActive: true },
      },
      orderBy: { createdAt: "desc" },
      include: {
        sender: {
          include: {
            profile: {
              include: {
                photos: { where: { deletedAt: null } },
                privacy: true,
              },
            },
          },
        },
      },
    }),
    prisma.interest.findMany({
      where: {
        senderId: userId,
        receiver: { deletedAt: null, isActive: true },
      },
      orderBy: { createdAt: "desc" },
      include: {
        receiver: {
          include: {
            profile: {
              include: {
                photos: { where: { deletedAt: null } },
                privacy: true,
              },
            },
          },
        },
      },
    }),
  ]);

  const serializedReceived = JSON.parse(JSON.stringify(receivedInterests));
  const serializedSent = JSON.parse(JSON.stringify(sentInterests));

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50/30 via-slate-50 to-white text-slate-900 py-8">
      <InterestsClient
        receivedInterests={serializedReceived}
        sentInterests={serializedSent}
      />
    </div>
  );
}
