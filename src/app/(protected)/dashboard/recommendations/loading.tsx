import { Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function RecommendationsLoading() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl space-y-8 text-slate-900 animate-pulse">
      {/* Title Skeleton */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-slate-200" />
          <div className="h-8 w-64 bg-slate-200 rounded-lg" />
        </div>
        <div className="h-4 w-96 max-w-full bg-slate-100 rounded" />
      </div>

      {/* 3-Column Skeleton Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card
            key={i}
            className="border border-slate-200 bg-white rounded-2xl overflow-hidden flex flex-col justify-between shadow-sm"
          >
            {/* Image Placeholder Skeleton */}
            <div className="relative aspect-[4/3] bg-slate-100">
              <div className="absolute top-2 left-2 h-5 w-24 bg-slate-200 rounded-full" />
            </div>

            {/* Content Details Skeleton */}
            <CardContent className="p-5 flex-grow flex flex-col justify-between gap-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="h-5 w-32 bg-slate-200 rounded" />
                  <div className="h-4 w-16 bg-slate-100 rounded" />
                </div>

                <div className="h-4 w-40 bg-slate-100 rounded" />

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                  <div className="h-3.5 bg-slate-100 rounded" />
                  <div className="h-3.5 bg-slate-100 rounded" />
                  <div className="h-3.5 bg-slate-100 rounded" />
                  <div className="h-3.5 bg-slate-100 rounded" />
                </div>
              </div>

              {/* Action Button Skeleton */}
              <div className="h-9 w-full bg-slate-200 rounded-lg mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
