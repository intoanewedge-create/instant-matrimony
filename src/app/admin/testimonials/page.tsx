"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import { MessageSquare, Plus, Trash2, Star, Heart } from "lucide-react";

export default function AdminTestimonialsPage() {
  const { toast } = useToast();
  const [testimonials, setTestimonials] = useState([
    {
      id: "1",
      coupleNames: "Karthik & Sneha",
      location: "Guntur, Andhra Pradesh",
      story: "We connected through InstantMatrimony and found shared family values instantly. Thank you to the team for verifying profiles so thoroughly!",
      weddingDate: "14 Feb 2026",
      isVerified: true,
    },
    {
      id: "2",
      coupleNames: "Venkatesh & Divya",
      location: "Vijayawada, Andhra Pradesh",
      story: "The direct concierge assistance and fast contact unlocks made our marriage matchmaking seamless and trustworthy.",
      weddingDate: "20 Jan 2026",
      isVerified: true,
    },
  ]);

  const [coupleNames, setCoupleNames] = useState("");
  const [location, setLocation] = useState("");
  const [story, setStory] = useState("");
  const [weddingDate, setWeddingDate] = useState("");

  const handleAddTestimonial = () => {
    if (!coupleNames.trim() || !story.trim()) {
      toast({ title: "Validation Error", description: "Please enter couple names and testimonial story." });
      return;
    }
    setTestimonials((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        coupleNames: coupleNames.trim(),
        location: location.trim() || "Andhra Pradesh",
        story: story.trim(),
        weddingDate: weddingDate.trim() || "2026",
        isVerified: true,
      },
    ]);
    setCoupleNames("");
    setLocation("");
    setStory("");
    setWeddingDate("");
    toast({ title: "Success Story Added", description: "Testimonial published to public success stories." });
  };

  const handleDelete = (id: string) => {
    setTestimonials((prev) => prev.filter((t) => t.id !== id));
    toast({ title: "Testimonial Removed", description: "Story removed from showcase." });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-rose-400 to-pink-500 bg-clip-text text-transparent">
            Testimonials & Success Stories
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Moderate and showcase happy couple testimonials and marriage success stories.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="border border-slate-800 bg-slate-900/60 backdrop-blur-xl lg:col-span-1 h-fit">
          <CardHeader>
            <CardTitle className="text-slate-100 flex items-center gap-2">
              <Plus className="w-5 h-5 text-rose-500" /> Add Success Story
            </CardTitle>
            <CardDescription className="text-slate-400">
              Publish verified member feedback.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Couple Names</label>
              <Input
                placeholder="e.g. Ramesh & Ananya"
                value={coupleNames}
                onChange={(e) => setCoupleNames(e.target.value)}
                className="border-slate-800 bg-slate-950/60 text-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Location / City</label>
              <Input
                placeholder="e.g. Guntur, AP"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="border-slate-800 bg-slate-950/60 text-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Wedding / Match Date</label>
              <Input
                placeholder="e.g. February 2026"
                value={weddingDate}
                onChange={(e) => setWeddingDate(e.target.value)}
                className="border-slate-800 bg-slate-950/60 text-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Story / Feedback</label>
              <Textarea
                placeholder="Share how they found each other through InstantMatrimony..."
                value={story}
                onChange={(e) => setStory(e.target.value)}
                rows={4}
                className="border-slate-800 bg-slate-950/60 text-white"
              />
            </div>
            <Button
              onClick={handleAddTestimonial}
              className="w-full bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white"
            >
              <Heart className="w-4 h-4 mr-2" /> Publish Story
            </Button>
          </CardContent>
        </Card>

        <Card className="border border-slate-800 bg-slate-900/60 backdrop-blur-xl lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-slate-100 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-rose-500" /> Published Stories ({testimonials.length})
            </CardTitle>
            <CardDescription className="text-slate-400">
              Stories featured on public homepage and success stories pages.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {testimonials.map((t) => (
              <div
                key={t.id}
                className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 space-y-2 hover:border-slate-700 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-slate-200">{t.coupleNames}</h3>
                    <span className="text-[10px] bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded-full font-semibold">
                      {t.location}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(t.id)}
                    className="text-slate-500 hover:text-red-400 hover:bg-red-950/30 h-8 w-8 p-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                  ))}
                  <span className="text-[11px] text-slate-500 ml-2 font-mono">{t.weddingDate}</span>
                </div>
                <p className="text-xs text-slate-400 italic">"{t.story}"</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
