"use client";

import Link from "next/link";
import { Camera, BookOpen, Users, CheckCircle2, ChevronRight } from "lucide-react";

interface ProfileCompletionWidgetProps {
  completionPercent: number;
  hasPhotos: boolean;
  hasHoroscope: boolean;
  hasFamilyDetails: boolean;
}

export function ProfileCompletionWidget({
  completionPercent,
  hasPhotos,
  hasHoroscope,
  hasFamilyDetails,
}: ProfileCompletionWidgetProps) {
  const cards = [
    {
      icon: Camera,
      title: "Add Photo(s)",
      desc: "Photos get 10x more interest",
      href: "/dashboard/verification",
      done: hasPhotos,
      doneLabel: "Photos Added",
    },
    {
      icon: BookOpen,
      title: "Add Horoscope",
      desc: "Required for many families",
      href: "/onboarding?step=3",
      done: hasHoroscope,
      doneLabel: "Horoscope Added",
    },
    {
      icon: Users,
      title: "Family Details",
      desc: "Complete family background",
      href: "/onboarding?step=6",
      done: hasFamilyDetails,
      doneLabel: "Details Added",
    },
  ];

  return (
    <div
      className="rounded-2xl border shadow-sm overflow-hidden"
      style={{ backgroundColor: "#FFFFFF", borderColor: "#E5E7EB" }}
    >
      {/* Header */}
      <div className="px-5 py-4 border-b" style={{ borderColor: "#F3F4F6" }}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold" style={{ color: "#111827" }}>Complete Your Profile</h2>
          <span className="text-sm font-bold" style={{ color: "#E11D48" }}>{completionPercent}%</span>
        </div>
        <div className="w-full h-2 rounded-full" style={{ backgroundColor: "#F3F4F6" }}>
          <div
            className="h-2 rounded-full transition-all duration-500"
            style={{
              width: `${completionPercent}%`,
              background: completionPercent >= 80
                ? "linear-gradient(90deg, #16A34A, #22C55E)"
                : completionPercent >= 50
                ? "linear-gradient(90deg, #E11D48, #F43F5E)"
                : "linear-gradient(90deg, #F59E0B, #FBBF24)",
            }}
            role="progressbar"
            aria-valuenow={completionPercent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Profile ${completionPercent}% complete`}
          />
        </div>
        <p className="text-xs mt-2" style={{ color: "#6B7280" }}>
          {completionPercent < 60
            ? "Complete your profile to get more matches."
            : completionPercent < 90
            ? "Almost there! A few more details will boost your visibility."
            : "Great profile! You're getting maximum visibility."}
        </p>
      </div>

      {/* Action cards */}
      <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
        {cards.map(({ icon: Icon, title, desc, href, done, doneLabel }) => (
          done ? (
            <div
              key={title}
              className="rounded-xl p-3 flex flex-col gap-1"
              style={{ backgroundColor: "#F0FDF4", border: "1px solid #BBF7D0" }}
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: "#16A34A" }} aria-hidden="true" />
                <span className="text-xs font-bold" style={{ color: "#166534" }}>{doneLabel}</span>
              </div>
              <p className="text-xs" style={{ color: "#4ADE80" }}>{desc}</p>
            </div>
          ) : (
            <Link
              key={title}
              href={href}
              className="rounded-xl p-3 flex flex-col gap-1 border hover:border-rose-200 hover:bg-rose-50 transition-all group"
              style={{ borderColor: "#E5E7EB" }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: "#FFF1F2" }}
                  >
                    <Icon className="w-3.5 h-3.5" style={{ color: "#E11D48" }} aria-hidden="true" />
                  </div>
                  <span className="text-xs font-bold" style={{ color: "#111827" }}>{title}</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" style={{ color: "#9CA3AF" }} />
              </div>
              <p className="text-xs pl-9" style={{ color: "#6B7280" }}>{desc}</p>
            </Link>
          )
        ))}
      </div>
    </div>
  );
}
