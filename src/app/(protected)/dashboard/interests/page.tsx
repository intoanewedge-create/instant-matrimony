import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Heart, Compass, Check, X, Clock, ArrowRight, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { acceptInterestAction, declineInterestAction } from "@/lib/actions/interest.actions";

export default async function InterestsPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  const userId = (session.user as any).id;

  // Received requests with nested profile queries
  const receivedInterests = (await prisma.interest.findMany({
    where: { receiverId: userId },
    include: {
      sender: {
        include: {
          profile: {
            include: {
              photos: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })) as any[];

  // Sent requests with nested profile queries
  const sentInterests = (await prisma.interest.findMany({
    where: { senderId: userId },
    include: {
      receiver: {
        include: {
          profile: {
            include: {
              photos: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })) as any[];

  // Accept interest server handler
  async function handleAccept(formData: FormData) {
    "use server";
    const id = formData.get("interestId") as string;
    await acceptInterestAction(id);
  }

  // Decline interest server handler
  async function handleDecline(formData: FormData) {
    "use server";
    const id = formData.get("interestId") as string;
    await declineInterestAction(id);
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl space-y-8 text-slate-200">
      
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-rose-400 to-pink-500 bg-clip-text text-transparent flex items-center gap-2">
          <Heart className="w-8 h-8 text-rose-500 fill-rose-500/20" />
          My Connections & Interests
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Review incoming matching interests or monitor validation status on connections you sent.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Column: Received Interests */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold border-l-2 border-rose-500 pl-2 text-slate-200">
            Received Interests ({receivedInterests.length})
          </h2>

          {receivedInterests.length > 0 ? (
            <div className="space-y-4">
              {receivedInterests.map((interest) => {
                const senderUser = interest.sender;
                const senderProfile = senderUser?.profile;
                if (!senderUser) return null;

                const primaryPhoto = senderProfile?.photos?.find((p: any) => p.isMain)?.url 
                  || senderProfile?.photos?.[0]?.url;

                const age = senderProfile?.dateOfBirth
                  ? new Date().getFullYear() - new Date(senderProfile.dateOfBirth).getFullYear()
                  : "N/A";

                return (
                  <Card key={interest.id} className="border border-slate-800 bg-slate-900/30 overflow-hidden">
                    <CardContent className="p-4 flex gap-4 items-center">
                      {/* Photo Thumbnail */}
                      <div className="w-16 h-16 rounded-xl bg-slate-950 overflow-hidden shrink-0 border border-slate-800">
                        {primaryPhoto ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={primaryPhoto}
                            alt="Sender Avatar"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-700 bg-slate-900">
                            <User className="w-6 h-6" />
                          </div>
                        )}
                      </div>

                      {/* Summary details */}
                      <div className="flex-grow min-w-0">
                        {senderProfile ? (
                          <Link href={`/profile/${senderProfile.userId}`} className="font-bold text-slate-100 hover:text-rose-400 transition-colors text-sm truncate block">
                            {senderUser.name || "Matrimony Member"}
                          </Link>
                        ) : (
                          <span className="font-bold text-slate-400 text-sm block">
                            {senderUser.name || "Matrimony Member"}
                          </span>
                        )}
                        <p className="text-xs text-slate-400 mt-0.5 truncate">
                          {senderProfile ? (
                            `${age} yrs • ${senderProfile.religion} • ${senderProfile.city}`
                          ) : (
                            "No Profile Setup"
                          )}
                        </p>
                        <span className={`inline-flex items-center gap-1 mt-1 text-[9px] px-2 py-0.5 rounded-full font-semibold border ${
                          interest.status === "PENDING"
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                            : interest.status === "ACCEPTED"
                            ? "bg-green-500/10 text-green-400 border-green-500/20"
                            : "bg-slate-500/10 text-slate-400 border-slate-500/20"
                        }`}>
                          <Clock className="w-2.5 h-2.5" /> Status: {interest.status}
                        </span>
                      </div>

                      {/* Actions */}
                      {interest.status === "PENDING" && (
                        <div className="flex gap-1.5 shrink-0">
                          <form action={handleAccept}>
                            <input type="hidden" name="interestId" value={interest.id} />
                            <Button type="submit" size="icon" className="h-8 w-8 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg">
                              <Check className="w-4 h-4" />
                            </Button>
                          </form>
                          <form action={handleDecline}>
                            <input type="hidden" name="interestId" value={interest.id} />
                            <Button type="submit" size="icon" variant="ghost" className="h-8 w-8 text-red-400 hover:bg-red-950/20 rounded-lg">
                              <X className="w-4 h-4" />
                            </Button>
                          </form>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="border border-slate-800 bg-slate-900/10 p-8 text-center text-xs text-slate-500">
              No interests received yet.
            </Card>
          )}
        </div>

        {/* Right Column: Sent Interests */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold border-l-2 border-rose-500 pl-2 text-slate-200">
            Sent Interests ({sentInterests.length})
          </h2>

          {sentInterests.length > 0 ? (
            <div className="space-y-4">
              {sentInterests.map((interest) => {
                const receiverUser = interest.receiver;
                const receiverProfile = receiverUser?.profile;
                if (!receiverUser) return null;

                const primaryPhoto = receiverProfile?.photos?.find((p: any) => p.isMain)?.url 
                  || receiverProfile?.photos?.[0]?.url;

                const age = receiverProfile?.dateOfBirth
                  ? new Date().getFullYear() - new Date(receiverProfile.dateOfBirth).getFullYear()
                  : "N/A";

                return (
                  <Card key={interest.id} className="border border-slate-800 bg-slate-900/30 overflow-hidden">
                    <CardContent className="p-4 flex gap-4 items-center justify-between">
                      <div className="flex gap-4 items-center min-w-0">
                        {/* Photo Thumbnail */}
                        <div className="w-16 h-16 rounded-xl bg-slate-950 overflow-hidden shrink-0 border border-slate-800">
                          {primaryPhoto ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={primaryPhoto}
                              alt="Receiver Avatar"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-700 bg-slate-900">
                              <User className="w-6 h-6" />
                            </div>
                          )}
                        </div>

                        {/* Summary details */}
                        <div className="min-w-0">
                          {receiverProfile ? (
                            <Link href={`/profile/${receiverProfile.userId}`} className="font-bold text-slate-100 hover:text-rose-400 transition-colors text-sm truncate block">
                              {receiverUser.name || "Matrimony Member"}
                            </Link>
                          ) : (
                            <span className="font-bold text-slate-400 text-sm block">
                              {receiverUser.name || "Matrimony Member"}
                            </span>
                          )}
                          <p className="text-xs text-slate-400 mt-0.5 truncate">
                            {receiverProfile ? (
                              `${age} yrs • ${receiverProfile.religion} • ${receiverProfile.city}`
                            ) : (
                              "No Profile Setup"
                            )}
                          </p>
                          <span className={`inline-flex items-center gap-1 mt-1 text-[9px] px-2 py-0.5 rounded-full font-semibold border ${
                            interest.status === "PENDING"
                              ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                              : interest.status === "ACCEPTED"
                              ? "bg-green-500/10 text-green-400 border-green-500/20"
                              : "bg-slate-500/10 text-slate-400 border-slate-500/20"
                          }`}>
                            Status: {interest.status}
                          </span>
                        </div>
                      </div>

                      {receiverProfile && (
                        <Link href={`/profile/${receiverProfile.userId}`}>
                          <Button size="icon" variant="ghost" className="text-slate-400 hover:text-white rounded-lg">
                            <ArrowRight className="w-4 h-4" />
                          </Button>
                        </Link>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="border border-slate-800 bg-slate-900/10 p-8 text-center text-xs text-slate-500">
              You haven&apos;t sent any connect requests yet.
            </Card>
          )}
        </div>

      </div>

    </div>
  );
}
