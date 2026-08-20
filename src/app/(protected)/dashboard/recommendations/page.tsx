import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { container } from "@/lib/container";
import Link from "next/link";
import { Sparkles, MapPin, User, Compass, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function RecommendationsPage() {
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
  // @ts-ignore
  const isApproved = profile.status === "APPROVED";

  const recsRes = isApproved
    ? await container.services.recommendationService.getRecommendations(userId, 6)
    : { success: true, data: [] };
  const recommendations = recsRes.success ? recsRes.data || [] : [];

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl space-y-8 text-slate-900">
      
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-2">
          <Sparkles className="w-8 h-8 text-rose-600 fill-rose-100" />
          AI Recommendations
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Our machine learning matchmaker computes daily affinities using your partner preferences, educational background, and location.
        </p>
      </div>

      {!isApproved ? (
        <Card className="border border-amber-200 bg-amber-50/50 p-12 text-center text-amber-900 max-w-xl mx-auto space-y-4 shadow-sm">
          <div className="h-12 w-12 rounded-full bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-700 mx-auto">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-amber-950 text-lg">Profile Under Review</h3>
          <p className="text-xs text-amber-800">
            Your profile details have been submitted and are currently under review by our moderation team. AI Match Recommendations will be available as soon as your profile is approved.
          </p>
          <Link href="/dashboard" className="inline-block">
            <Button variant="outline" className="border-amber-300 bg-white hover:bg-amber-100 text-amber-900 text-xs font-semibold px-6 shadow-xs">
              Return to Dashboard
            </Button>
          </Link>
        </Card>
      ) : recommendations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {recommendations.map((rec: any, idx: number) => {
            const candidate = rec.profile;
            const age = candidate.dateOfBirth
              ? new Date().getFullYear() - new Date(candidate.dateOfBirth).getFullYear()
              : "N/A";
            
            // Primary Photo
            const primaryPhoto = candidate.photos?.find((p: any) => p.isMain)?.url 
              || (candidate.photos && candidate.photos[0]?.url);

            return (
              <Card key={idx} className="border border-slate-200 bg-white hover:border-rose-300 hover:shadow-md transition-all duration-300 group overflow-hidden flex flex-col justify-between shadow-sm">
                
                {/* Photo & Badge Overlay */}
                <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
                  {primaryPhoto ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={primaryPhoto}
                      alt={candidate.name || "Member Profile"}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center flex-col text-slate-400 gap-2">
                      <User className="w-12 h-12" />
                      <span className="text-xs font-medium">No profile picture</span>
                    </div>
                  )}

                  {/* Top Overlays */}
                  <div className="absolute top-2 left-2 flex gap-1.5">
                    <span className="text-[10px] bg-white/90 backdrop-blur-md text-rose-700 border border-rose-200 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 shadow-xs">
                      <Star className="w-3 h-3 fill-rose-600 text-rose-600" /> Match: {rec.score}%
                    </span>
                  </div>
                </div>

                {/* Body Details */}
                <CardContent className="p-5 flex-grow flex flex-col justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-slate-900 group-hover:text-rose-600 transition-colors">
                        {candidate.user?.name || candidate.name || "Matrimony Member"}
                      </h3>
                      <span className="text-xs font-semibold text-slate-500">{age} yrs {candidate.height ? `• ${candidate.height} cm` : ""}</span>
                    </div>

                    <p className="text-slate-500 text-xs flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-rose-600" /> {candidate.city || "City"}, {candidate.state || "State"}
                    </p>

                    <div className="grid grid-cols-2 gap-x-2 gap-y-1 pt-2 text-[11px] text-slate-600 border-t border-slate-100">
                      <div><span className="text-slate-400 font-medium">Religion:</span> {candidate.religion || "N/A"}</div>
                      <div><span className="text-slate-400 font-medium">Caste:</span> {candidate.caste || "N/A"}</div>
                      <div><span className="text-slate-400 font-medium">Tongue:</span> {candidate.motherTongue || "N/A"}</div>
                      <div><span className="text-slate-400 font-medium">Income:</span> {candidate.income ? `₹${candidate.income}L` : "N/A"}</div>
                    </div>

                    {rec.explanation && (
                      <p className="text-[11px] text-slate-500 italic mt-2 line-clamp-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
                        &ldquo;{rec.explanation}&rdquo;
                      </p>
                    )}
                  </div>

                  <Link href={`/profile/${candidate.userId}`} className="block w-full">
                    <Button variant="outline" className="w-full border-slate-200 bg-slate-50/50 hover:bg-rose-600 hover:text-white hover:border-rose-600 text-slate-700 font-semibold transition-all text-xs gap-1.5 h-9 rounded-lg shadow-xs">
                      <Compass className="w-4 h-4" /> View Match Details
                    </Button>
                  </Link>

                </CardContent>

              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="border border-slate-200 bg-white p-12 text-center text-slate-600 max-w-xl mx-auto space-y-4 shadow-sm">
          <div className="h-12 w-12 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 mx-auto shadow-xs">
            <Compass className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 text-lg">No Recommendations Available</h3>
          <p className="text-xs text-slate-500">
            Complete your partner preferences and biography details under My Profile to prompt matching calculations.
          </p>
          <Link href="/profile" className="inline-block">
            <Button className="bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white text-xs font-semibold px-6 shadow-md shadow-rose-500/20">
              Complete Profile
            </Button>
          </Link>
        </Card>
      )}

    </div>
  );
}
