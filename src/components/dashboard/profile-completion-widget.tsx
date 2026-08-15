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
      className="rounded-2xl border shadow-xs overflow-hidden"
      style={{ backgroundColor: "#FFFFFF", borderColor: "#E5E7EB" }}
    >
      {/* Header */}
      <div className="px-5 py-4 border-b" style={{ borderColor: "#F3F4F6" }}>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-base font-bold" style={{ color: "#1F2937" }}>Complete Your Profile</h2>
          <span className="text-sm font-bold" style={{ color: "#00A76F" }}>{completionPercent}%</span>
        </div>
        <div className="w-full h-2 rounded-full" style={{ backgroundColor: "#F3F4F6" }}>
          <div
            className="h-2 rounded-full transition-all duration-500"
            style={{
              width: `${completionPercent}%`,
              backgroundColor: "#00A76F",
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
              className="rounded-xl p-3 flex flex-col gap-1 border"
              style={{ backgroundColor: "#E6F4EA", borderColor: "#A7F3D0" }}
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: "#00A76F" }} aria-hidden="true" />
                <span className="text-xs font-bold" style={{ color: "#008F60" }}>{doneLabel}</span>
              </div>
              <p className="text-[11px]" style={{ color: "#047857" }}>{desc}</p>
            </div>
          ) : (
            <Link
              key={title}
              href={href}
              className="rounded-xl p-3 flex flex-col gap-1.5 border hover:border-emerald-200 hover:bg-emerald-50 transition-all group"
              style={{ borderColor: "#E5E7EB", backgroundColor: "#FFFFFF" }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: "#E6F4EA" }}
                  >
                    <Icon className="w-4 h-4" style={{ color: "#00A76F" }} aria-hidden="true" />
                  </div>
                  <span className="text-xs font-bold" style={{ color: "#1F2937" }}>{title}</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" style={{ color: "#9CA3AF" }} />
              </div>
              <p className="text-[11px] pl-9" style={{ color: "#6B7280" }}>{desc}</p>
            </Link>
          )
        ))}
      </div>
    </div>
  );
}
