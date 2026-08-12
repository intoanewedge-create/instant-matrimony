import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  HelpCircle,
  ImageIcon,
  MessageSquare,
  FileText,
  ArrowRight,
  Sparkles,
  Layers,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminCmsPage() {
  let faqCount = 0;
  let bannerCount = 0;
  let testimonialCount = 0;
  let pageCount = 0;

  try {
    [faqCount, bannerCount, testimonialCount, pageCount] = await Promise.all([
      prisma.fAQ.count().catch(() => 0),
      prisma.banner.count().catch(() => 0),
      prisma.testimonial.count().catch(() => 0),
      prisma.cmsPage.count().catch(() => 0),
    ]);
  } catch (error) {
    console.error("AdminCmsPage count error:", error);
  }

  const sections = [
    {
      title: "FAQ Management",
      description: "Manage public frequently asked questions, categorize them, and set display priorities.",
      count: `${faqCount} FAQs`,
      href: "/admin/faqs",
      icon: HelpCircle,
      color: "from-rose-500/20 to-pink-500/20 text-rose-400 border-rose-500/30",
    },
    {
      title: "Hero & Promotional Banners",
      description: "Configure homepage sliders, promotional announcements, and campaign cards.",
      count: `${bannerCount} Banners`,
      href: "/admin/banners",
      icon: ImageIcon,
      color: "from-purple-500/20 to-indigo-500/20 text-purple-400 border-purple-500/30",
    },
    {
      title: "Success Stories & Testimonials",
      description: "Moderate member reviews, happy couple marriages, and customer ratings.",
      count: `${testimonialCount} Stories`,
      href: "/admin/testimonials",
      icon: MessageSquare,
      color: "from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30",
    },
    {
      title: "CMS Pages & Legal Docs",
      description: "Edit Privacy Policy, Terms of Service, Refund Policy, and Safety Guidelines.",
      count: `${pageCount} Pages`,
      href: "/admin/master-data",
      icon: FileText,
      color: "from-blue-500/20 to-cyan-500/20 text-blue-400 border-blue-500/30",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-rose-400 to-pink-500 bg-clip-text text-transparent">
            Content Management System (CMS)
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage dynamic marketing content, knowledge base, banners, and member testimonials.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs bg-slate-900 border border-slate-800 text-slate-300 px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-rose-400" />
            Live Production CMS
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <Card
              key={section.href}
              className="border border-slate-800 bg-slate-900/60 backdrop-blur-xl hover:border-slate-700 transition-all flex flex-col justify-between shadow-xl group"
            >
              <CardHeader className="space-y-3 pb-3">
                <div className="flex items-center justify-between">
                  <div className={`p-3 rounded-xl border bg-gradient-to-br ${section.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-mono font-semibold text-slate-400 bg-slate-950 px-2.5 py-1 rounded-full border border-slate-800">
                    {section.count}
                  </span>
                </div>
                <CardTitle className="text-lg font-bold text-slate-100 group-hover:text-rose-400 transition-colors">
                  {section.title}
                </CardTitle>
                <CardDescription className="text-xs text-slate-400 leading-relaxed">
                  {section.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <Link href={section.href}>
                  <Button className="w-full bg-slate-950 hover:bg-rose-600/20 hover:text-rose-300 border border-slate-800 hover:border-rose-500/40 text-slate-300 text-xs h-9 justify-between transition-all">
                    <span>Manage {section.title.split(" ")[0]}</span>
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
