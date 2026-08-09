import { Target, Award, Compass } from "lucide-react";
import { container } from "@/lib/container";
import { CmsPageRenderer } from "@/components/cms-page-renderer";

export default async function About() {
  let cmsData = null;
  try {
    const cmsRes = await container.services.cmsService.getPageBySlug("about");
    if (cmsRes.success && cmsRes.data && cmsRes.data.status === "PUBLISHED") {
      cmsData = cmsRes.data;
    }
  } catch {
    // Fallback to static
  }

  if (cmsData) {
    return (
      <CmsPageRenderer
        title={cmsData.title}
        content={cmsData.content}
        seoTitle={cmsData.seoTitle}
      />
    );
  }

  return (
    <div className="flex flex-col w-full py-16 sm:py-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl text-foreground">
            Our Mission & Story
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground mt-4 leading-relaxed">
            Redefining matrimony matchmaking in India with safety, modern technology, and verified compatibility standards.
          </p>
        </div>

        {/* Story Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20">
          <div>
            <h2 className="text-2xl font-bold mb-4">How InstantMatrimony Began</h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-4">
              InstantMatrimony was founded to bridge the gap between traditional family matches and contemporary security preferences. Traditional portals are filled with outdated profiles, matching delays, and fake accounts.
            </p>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              We built an enterprise-grade platform with absolute verification checks, direct communication channels, and rich partner matching settings. Our aim is to make finding your soulmate a premium, seamless, and completely secure experience.
            </p>
          </div>
          <div className="bg-secondary/40 border border-border/50 p-8 rounded-2xl flex flex-col justify-center min-h-[300px]">
            <blockquote className="text-lg font-medium text-foreground italic">
              "A successful marriage requires falling in love many times, always with the same person."
            </blockquote>
            <p className="text-sm font-semibold text-primary mt-4">— Mignon McLaughlin</p>
          </div>
        </div>

        {/* Corporate Values */}
        <div className="border-t border-border/20 pt-16">
          <h2 className="text-2xl font-bold text-center mb-12">Our Core Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Value 1 */}
            <div className="bg-card border border-border/40 p-6 rounded-2xl flex flex-col space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-white">
                <Target className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold">Absolute Integrity</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                We manual-review every user account and confirm credentials. We do not tolerate fake profiles or spam behavior.
              </p>
            </div>
            {/* Value 2 */}
            <div className="bg-card border border-border/40 p-6 rounded-2xl flex flex-col space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-white">
                <Compass className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold">Privacy Control</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Your credentials and photos are yours to share. Custom locks enable you to choose who interacts with you.
              </p>
            </div>
            {/* Value 3 */}
            <div className="bg-card border border-border/40 p-6 rounded-2xl flex flex-col space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-white">
                <Award className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold">Premium Customer Support</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Dedicated match advisors review search preferences and assist you 24/7 on your partnership journey.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
