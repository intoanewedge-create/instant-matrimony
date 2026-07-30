import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Heart, ShieldCheck, MessageSquareCode, Award, Users2, Sparkles, CheckCircle2 } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-transparent to-background py-20 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-center">
            
            {/* Left Hero Column */}
            <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
              <div className="inline-flex items-center space-x-2 bg-primary/10 border border-primary/20 text-primary px-3.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-6 animate-pulse">
                <Sparkles className="h-3.5 w-3.5" />
                <span>#1 Trusted Indian Matchmaking Platform</span>
              </div>
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl text-foreground leading-[1.1] mb-6">
                Find Your Perfect <br />
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Life Partner
                </span>{" "}
                Instantly
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-xl mb-8">
                Connect with thousands of verified profiles across different communities, religions, and regions. Built with maximum safety, secure chat, and premium compatibility tools.
              </p>

              {/* Quick Profile Search Box */}
              <div className="bg-card border border-border/60 p-5 rounded-2xl shadow-xl shadow-black/5 max-w-xl">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">I am a</label>
                    <select className="w-full bg-secondary border border-border/40 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary">
                      <option>Male</option>
                      <option>Female</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">Looking for a</label>
                    <select className="w-full bg-secondary border border-border/40 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary">
                      <option>Female</option>
                      <option>Male</option>
                    </select>
                  </div>
                </div>
                <Link href="/register">
                  <Button className="w-full" variant="accent">
                    Start Searching Now
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right Hero Column (Visual Elements) */}
            <div className="mt-16 sm:mt-24 lg:mt-0 lg:col-span-6 flex justify-center">
              <div className="relative w-full max-w-md aspect-square bg-gradient-to-tr from-primary/10 to-accent/10 rounded-full flex items-center justify-center p-8 border border-primary/10">
                <div className="absolute inset-4 rounded-full border border-dashed border-primary/20 animate-spin-slow" />
                <div className="bg-card border border-border/50 p-6 rounded-2xl shadow-xl flex flex-col items-center max-w-xs text-center z-10 hover:scale-102 transition-transform duration-300">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-white mb-4">
                    <Heart className="h-6 w-6 fill-white" />
                  </div>
                  <h3 className="text-lg font-bold">100% Verified</h3>
                  <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                    Every member profile undergoes strict database checks & manual document verification.
                  </p>
                  <div className="mt-4 flex items-center space-x-1.5 bg-emerald-500/10 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                    <CheckCircle2 className="h-3 w-3" />
                    <span>Safe & Secure</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-secondary/40 py-12 border-y border-border/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <p className="text-3xl font-extrabold text-primary">10k+</p>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1 font-medium">Happy Marriages</p>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-primary">100%</p>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1 font-medium">Verified Accounts</p>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-primary">24/7</p>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1 font-medium">Dedicated Advisor Support</p>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-primary">100%</p>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1 font-medium">Privacy Controlled</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-foreground">
            How InstantMatrimony Works
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground mt-4 max-w-xl mx-auto">
            Three simple steps to connect with your future partner on our premium platform.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mt-16">
            <div className="flex flex-col items-center bg-card border border-border/40 p-8 rounded-2xl hover:shadow-lg transition-shadow duration-300">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold text-lg mb-6">
                1
              </div>
              <h3 className="text-lg font-bold">Create Free Profile</h3>
              <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
                Fill in details about yourself, education, career, and upload your profile photos securely.
              </p>
            </div>
            
            <div className="flex flex-col items-center bg-card border border-border/40 p-8 rounded-2xl hover:shadow-lg transition-shadow duration-300">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold text-lg mb-6">
                2
              </div>
              <h3 className="text-lg font-bold">Set Preferences & Search</h3>
              <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
                Filter results based on community, mother tongue, location, income brackets, or education levels.
              </p>
            </div>

            <div className="flex flex-col items-center bg-card border border-border/40 p-8 rounded-2xl hover:shadow-lg transition-shadow duration-300">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold text-lg mb-6">
                3
              </div>
              <h3 className="text-lg font-bold">Initiate Chat & Meet</h3>
              <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
                Send interests, get matched, and start corresponding using our fully encrypted internal messaging system.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features Section */}
      <section className="bg-secondary/20 py-20 sm:py-28 border-y border-border/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-foreground">
              Why Seekers Choose Us
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground mt-4 max-w-xl mx-auto">
              Our platform offers advanced, robust security and premium privacy features designed for serious life partner searches.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="bg-card border border-border/40 p-6 rounded-2xl flex flex-col space-y-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-white">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold">Verified Profiles</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                We require government-issued identity cards and documents to approve profiles, protecting you from fake accounts and scammers.
              </p>
            </div>
            {/* Card 2 */}
            <div className="bg-card border border-border/40 p-6 rounded-2xl flex flex-col space-y-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-white">
                <MessageSquareCode className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold">Privacy Control</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Choose who can view your profile photo, contact details, or send you interest requests. Control your visibility settings completely.
              </p>
            </div>
            {/* Card 3 */}
            <div className="bg-card border border-border/40 p-6 rounded-2xl flex flex-col space-y-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-white">
                <Award className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold">Premium SaaS Plans</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Flexible subscription tiers designed with fair prices. No hidden charges. Clear features mapping matches to your budget.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 sm:py-28 bg-gradient-to-r from-primary to-accent text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10 backdrop-blur-xs" />
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl font-extrabold sm:text-4xl tracking-tight leading-tight">
            Ready to Find Your Soulmate?
          </h2>
          <p className="text-base sm:text-lg text-white/90 mt-4 max-w-xl mx-auto leading-relaxed">
            Create your account today, verify your profile metrics, and match up with genuine, verified Indian matrimony seekers.
          </p>
          <div className="mt-8 flex justify-center space-x-4">
            <Link href="/register">
              <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-zinc-50 border border-white">
                Register Free
              </Button>
            </Link>
            <Link href="/membership">
              <Button size="lg" className="bg-primary-hover border border-primary-hover text-white hover:bg-primary">
                View Pricing
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
