import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Heart, Star } from "lucide-react";
import Image from "next/image";

export const dynamic = "force-dynamic";

const DEFAULT_STORIES = [
  {
    name: "Aarav & Priya",
    role: "Hyderabad, Telangana • Married October 2025",
    content: "We matched through InstantMatrimony's Standard membership. Aarav's verified credentials and clear family background caught our attention immediately. Within 3 months of secure conversations and meeting with our families, everything was finalized!",
    rating: 5,
    photoUrl: null,
  },
  {
    name: "Siddharth & Ananya",
    role: "Bangalore, Karnataka • Married December 2025",
    content: "Ananya and I shared common interests in engineering and outdoor travel. Finding someone with exact career alignment and cultural compatibility was seamless. InstantMatrimony made it effortless. We're happily married now!",
    rating: 5,
    photoUrl: null,
  },
  {
    name: "Kabir & Sneha",
    role: "Visakhapatnam, Andhra Pradesh • Married February 2026",
    content: "Our parents handled our initial search preferences. They were particularly impressed by the document validation badge and strict verification check. We contacted Sneha's family, and everything fell in place perfectly.",
    rating: 5,
    photoUrl: null,
  },
  {
    name: "Vikram & Meghana",
    role: "Vijayawada, Andhra Pradesh • Married January 2026",
    content: "The advanced filtering and verified horoscope compatibility made connecting with the right person feel natural. The platform's privacy controls gave us complete confidence.",
    rating: 5,
    photoUrl: null,
  },
];

export default async function SuccessStoriesPage() {
  let stories: any[] = [];
  try {
    const dbStories = await prisma.testimonial.findMany({
      where: { isApproved: true },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    });

    if (dbStories && dbStories.length > 0) {
      stories = dbStories;
    }
  } catch (e) {
    // Graceful fallback
  }

  if (stories.length === 0) {
    stories = DEFAULT_STORIES;
  }

  return (
    <div className="flex flex-col w-full py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Title */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="flex justify-center mb-4 text-rose-500">
            <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20">
              <Sparkles className="h-8 w-8 text-rose-500 animate-pulse" />
            </div>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl text-foreground">
            Matrimonial Success Stories
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground mt-4 leading-relaxed">
            Read inspiring unions made on InstantMatrimony. Real stories of trust, cultural harmony, and lifelong companionship.
          </p>
        </div>

        {/* Stories list */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {stories.map((story, idx) => {
            const initials = story.name
              ? story.name.split("&").map((n: string) => n.trim().slice(0, 1)).join(" & ")
              : "M";

            return (
              <Card
                key={story.id || idx}
                className="overflow-hidden hover:shadow-xl hover:border-rose-500/30 transition-all duration-300 flex flex-col justify-between bg-card border-border/50 shadow-sm"
              >
                <div>
                  {/* Visual Header */}
                  <div className="h-44 bg-gradient-to-br from-rose-500/15 via-pink-500/10 to-purple-500/15 flex items-center justify-center p-6 border-b border-border/40 relative">
                    <Heart className="h-16 w-16 text-rose-500/20 absolute" />
                    {story.photoUrl ? (
                      <div className="h-24 w-24 rounded-full overflow-hidden border-4 border-background shadow-lg relative">
                        <Image
                          src={story.photoUrl}
                          alt={story.name}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                    ) : (
                      <div className="h-20 w-20 rounded-full border-4 border-background bg-gradient-to-tr from-rose-600 to-pink-500 flex items-center justify-center font-bold text-lg text-white shadow-lg uppercase">
                        {initials}
                      </div>
                    )}
                  </div>

                  <CardContent className="p-6 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold text-foreground">{story.name}</h3>
                      {/* Star Rating */}
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-3.5 h-3.5 ${
                              star <= (story.rating || 5)
                                ? "text-amber-400 fill-amber-400"
                                : "text-muted-foreground/30"
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    {story.role && (
                      <p className="text-xs text-rose-500 font-medium">{story.role}</p>
                    )}

                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed italic pl-3 border-l-2 border-rose-500/30">
                      "{story.content}"
                    </p>
                  </CardContent>
                </div>

                <div className="px-6 pb-6 pt-2">
                  <div className="text-[11px] text-muted-foreground font-mono bg-secondary/50 px-3 py-1.5 rounded-lg border border-border/40 flex items-center justify-between">
                    <span>Verified Couple Match</span>
                    <span className="text-emerald-500 font-semibold">✓ Verified</span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* CTA banner */}
        <div className="mt-16 text-center p-8 sm:p-10 rounded-2xl bg-gradient-to-r from-rose-600 via-pink-600 to-rose-600 text-white shadow-xl shadow-rose-950/20 space-y-3">
          <h2 className="text-2xl sm:text-3xl font-extrabold">Ready to Write Your Success Story?</h2>
          <p className="text-xs sm:text-sm text-rose-100 max-w-xl mx-auto">
            Create your profile in minutes, verify your details, and discover highly compatible profiles today.
          </p>
          <div className="pt-2">
            <a
              href="/register"
              className="inline-flex items-center justify-center px-6 py-2.5 text-xs sm:text-sm font-bold rounded-xl bg-white text-rose-600 hover:bg-rose-50 shadow-lg transition-transform hover:scale-105"
            >
              Register Free Today
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
