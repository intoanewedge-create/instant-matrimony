"use client";

import React from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  icon?: React.ReactNode;
}

export function KpiCard({ title, value, subtext, trend, icon }: KpiCardProps) {
  return (
    <div
      className="bg-card text-card-foreground p-6 rounded-xl border border-border/40 shadow-sm flex flex-col justify-between hover:shadow-md hover:border-border/80 transition-all duration-200"
      role="region"
      aria-label={`${title} Metric`}
    >
      <div className="flex items-center justify-between gap-4 mb-2">
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{title}</span>
        {icon && <div className="text-muted-foreground/60">{icon}</div>}
      </div>

      <div className="space-y-1">
        <h3 className="text-2xl font-extrabold tracking-tight text-foreground select-all">{value}</h3>
        
        {(trend || subtext) && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            {trend && (
              <span
                className={`flex items-center font-bold px-1.5 py-0.5 rounded-full ${
                  trend.isPositive
                    ? "bg-emerald-500/10 text-emerald-500"
                    : "bg-rose-500/10 text-rose-500"
                }`}
                aria-label={`Trend: ${trend.value}% ${trend.isPositive ? "increase" : "decrease"}`}
              >
                {trend.isPositive ? (
                  <ArrowUpRight className="h-3 w-3 mr-0.5" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 mr-0.5" />
                )}
                {trend.value}%
              </span>
            )}
            {subtext && <span className="select-text">{subtext}</span>}
          </div>
        )}
      </div>
    </div>
  );
}
