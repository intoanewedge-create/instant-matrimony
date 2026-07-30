"use client";

import React, { useState } from "react";

// 1. Line Chart Widget
interface LineChartPoint {
  date: string;
  value: number;
}

interface LineChartProps {
  data: LineChartPoint[];
  title?: string;
  height?: number;
}

export function LineChart({ data, title, height = 200 }: LineChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return <div className="flex items-center justify-center h-[200px] text-muted-foreground text-xs font-semibold">No chart data available.</div>;
  }

  const values = data.map((d) => d.value);
  const maxVal = Math.max(...values, 10);
  const minVal = Math.min(...values, 0);
  const range = maxVal - minVal;

  const width = 500;
  const padding = 40;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  // Calculate coordinates
  const points = data.map((d, index) => {
    const x = padding + (index / (data.length - 1)) * chartWidth;
    const y = padding + chartHeight - ((d.value - minVal) / range) * chartHeight;
    return { x, y, date: d.date, value: d.value };
  });

  // Construct SVG path string
  let pathD = "";
  if (points.length > 0) {
    pathD = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      pathD += ` L ${points[i].x} ${points[i].y}`;
    }
  }

  // Construct fill path string (area below the line)
  let areaD = "";
  if (points.length > 0) {
    areaD = `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;
  }

  return (
    <div className="w-full bg-card rounded-xl border border-border/40 p-4 shadow-sm relative group">
      {title && <h4 className="text-sm font-bold text-foreground mb-4">{title}</h4>}
      <div className="relative">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full overflow-visible" role="img" aria-label={`Line chart for ${title}`}>
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
            const y = padding + ratio * chartHeight;
            const val = maxVal - ratio * range;
            return (
              <g key={idx} className="opacity-10 group-hover:opacity-20 transition-opacity">
                <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="currentColor" strokeDasharray="3,3" />
                <text x={padding - 5} y={y + 4} textAnchor="end" className="text-[10px] font-semibold font-mono fill-current">
                  {Math.round(val)}
                </text>
              </g>
            );
          })}

          {/* Area fill */}
          {areaD && (
            <path d={areaD} className="fill-primary/10 stroke-none" />
          )}

          {/* Path line */}
          {pathD && (
            <path d={pathD} className="stroke-primary fill-none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          )}

          {/* Data points */}
          {points.map((pt, idx) => (
            <g key={idx}>
              <circle
                cx={pt.x}
                cy={pt.y}
                r={hoveredIndex === idx ? 5 : 3}
                className={`fill-primary stroke-background stroke-2 transition-all cursor-pointer ${
                  hoveredIndex === idx ? "r-5" : ""
                }`}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
              />
              {/* X Axis Labels */}
              {idx % Math.ceil(data.length / 5) === 0 && (
                <text x={pt.x} y={height - padding + 15} textAnchor="middle" className="text-[9px] font-semibold text-muted-foreground fill-current">
                  {pt.date}
                </text>
              )}
            </g>
          ))}
        </svg>

        {/* Hover Tooltip */}
        {hoveredIndex !== null && points[hoveredIndex] && (
          <div
            className="absolute bg-background border border-border px-2 py-1 rounded-md text-[10px] font-bold shadow-lg pointer-events-none transition-all duration-100 z-10"
            style={{
              left: `${(points[hoveredIndex].x / width) * 100}%`,
              top: `${(points[hoveredIndex].y / height) * 100 - 35}%`,
              transform: "translateX(-50%)",
            }}
          >
            <div className="text-muted-foreground">{points[hoveredIndex].date}</div>
            <div className="text-primary font-mono">{points[hoveredIndex].value}</div>
          </div>
        )}
      </div>
    </div>
  );
}

// 2. Bar Chart Widget
interface BarChartItem {
  label: string;
  value: number;
}

interface BarChartProps {
  data: BarChartItem[];
  title?: string;
  height?: number;
}

export function BarChart({ data, title, height = 200 }: BarChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return <div className="flex items-center justify-center h-[200px] text-muted-foreground text-xs font-semibold">No bar chart data available.</div>;
  }

  const values = data.map((d) => d.value);
  const maxVal = Math.max(...values, 10);

  const width = 500;
  const padding = 40;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  const barWidth = (chartWidth / data.length) * 0.6;
  const gap = (chartWidth / data.length) * 0.4;

  return (
    <div className="w-full bg-card rounded-xl border border-border/40 p-4 shadow-sm relative group">
      {title && <h4 className="text-sm font-bold text-foreground mb-4">{title}</h4>}
      <div className="relative">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full overflow-visible" role="img" aria-label={`Bar chart for ${title}`}>
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
            const y = padding + ratio * chartHeight;
            const val = maxVal - ratio * maxVal;
            return (
              <g key={idx} className="opacity-10 group-hover:opacity-20 transition-opacity">
                <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="currentColor" strokeDasharray="3,3" />
                <text x={padding - 5} y={y + 4} textAnchor="end" className="text-[10px] font-semibold font-mono fill-current">
                  {Math.round(val)}
                </text>
              </g>
            );
          })}

          {/* Bars */}
          {data.map((item, idx) => {
            const x = padding + idx * (barWidth + gap) + gap / 2;
            const barHeight = (item.value / maxVal) * chartHeight;
            const y = padding + chartHeight - barHeight;

            return (
              <g key={idx}>
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={Math.max(barHeight, 2)}
                  rx="3"
                  className={`fill-primary/80 stroke-none transition-all cursor-pointer hover:fill-primary ${
                    hoveredIdx === idx ? "fill-primary" : ""
                  }`}
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                />
                {/* Labels */}
                <text
                  x={x + barWidth / 2}
                  y={height - padding + 15}
                  textAnchor="middle"
                  className="text-[9px] font-semibold text-muted-foreground fill-current"
                >
                  {item.label}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip */}
        {hoveredIdx !== null && data[hoveredIdx] && (
          <div
            className="absolute bg-background border border-border px-2 py-1 rounded-md text-[10px] font-bold shadow-lg pointer-events-none transition-all duration-100 z-10"
            style={{
              left: `${((padding + hoveredIdx * (barWidth + gap) + gap / 2 + barWidth / 2) / width) * 100}%`,
              top: `${((padding + chartHeight - (data[hoveredIdx].value / maxVal) * chartHeight) / height) * 100 - 35}%`,
              transform: "translateX(-50%)",
            }}
          >
            <div className="text-muted-foreground">{data[hoveredIdx].label}</div>
            <div className="text-primary font-mono">{data[hoveredIdx].value}</div>
          </div>
        )}
      </div>
    </div>
  );
}

// 3. Funnel Chart Widget
interface FunnelStage {
  stage: string;
  count: number;
  conversionRate: number;
}

interface FunnelChartProps {
  data: FunnelStage[];
  title?: string;
}

export function FunnelChart({ data, title }: FunnelChartProps) {
  if (!data || data.length === 0) {
    return <div className="flex items-center justify-center h-[200px] text-muted-foreground text-xs font-semibold">No funnel metrics available.</div>;
  }

  const maxCount = data[0].count || 1;

  return (
    <div className="w-full bg-card rounded-xl border border-border/40 p-5 shadow-sm">
      {title && <h4 className="text-sm font-bold text-foreground mb-4">{title}</h4>}
      <div className="space-y-4">
        {data.map((stage, idx) => {
          const widthPct = Math.round((stage.count / maxCount) * 100);
          return (
            <div key={idx} className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-foreground">{stage.stage}</span>
                <span className="font-mono text-muted-foreground">
                  {stage.count} ({idx === 0 ? "100%" : `${Math.round(stage.conversionRate)}%`})
                </span>
              </div>
              <div className="h-6 w-full bg-muted/40 rounded-md overflow-hidden relative border border-border/10">
                <div
                  className="h-full bg-primary/20 border-r-2 border-primary transition-all duration-500 flex items-center pl-3"
                  style={{ width: `${widthPct}%` }}
                >
                  {widthPct > 20 && (
                    <span className="text-[10px] font-bold text-primary whitespace-nowrap">
                      {widthPct}% capacity
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// 4. Cohort Retention Grid Widget
interface CohortItem {
  cohortName: string;
  size: number;
  retentionRates: number[]; // e.g. [100, 85, 70, 50]
}

interface CohortGridProps {
  data: CohortItem[];
  title?: string;
}

export function CohortGrid({ data, title }: CohortGridProps) {
  if (!data || data.length === 0) {
    return <div className="flex items-center justify-center h-[200px] text-muted-foreground text-xs font-semibold">No cohort retention data.</div>;
  }

  const maxPeriods = Math.max(...data.map((d) => d.retentionRates.length), 0);

  const getIntensityClass = (rate: number) => {
    if (rate >= 90) return "bg-primary text-primary-foreground";
    if (rate >= 75) return "bg-primary/80 text-primary-foreground";
    if (rate >= 50) return "bg-primary/50 text-foreground";
    if (rate >= 25) return "bg-primary/30 text-foreground";
    if (rate >= 10) return "bg-primary/10 text-foreground/80";
    return "bg-muted text-muted-foreground";
  };

  return (
    <div className="w-full bg-card rounded-xl border border-border/40 p-5 shadow-sm overflow-x-auto">
      {title && <h4 className="text-sm font-bold text-foreground mb-4">{title}</h4>}
      <table className="w-full text-left border-collapse text-xs">
        <thead>
          <tr className="border-b border-border/40">
            <th className="pb-2 font-semibold text-muted-foreground pr-4">Cohort</th>
            <th className="pb-2 font-semibold text-muted-foreground pr-4">Size</th>
            {Array.from({ length: maxPeriods }).map((_, idx) => (
              <th key={idx} className="pb-2 font-semibold text-muted-foreground text-center px-1">
                W{idx}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((cohort, cIdx) => (
            <tr key={cIdx} className="hover:bg-muted/10">
              <td className="py-2 pr-4 font-bold text-foreground">{cohort.cohortName}</td>
              <td className="py-2 pr-4 font-mono font-medium text-muted-foreground">{cohort.size}</td>
              {Array.from({ length: maxPeriods }).map((_, pIdx) => {
                const rate = cohort.retentionRates[pIdx];
                const hasVal = rate !== undefined;
                return (
                  <td key={pIdx} className="py-1 px-0.5 text-center">
                    {hasVal ? (
                      <div
                        className={`h-7 w-10 flex items-center justify-center rounded font-mono font-bold text-[10px] mx-auto ${getIntensityClass(
                          rate
                        )}`}
                        title={`Retention: ${rate}%`}
                      >
                        {Math.round(rate)}%
                      </div>
                    ) : (
                      <div className="h-7 w-10 bg-transparent mx-auto" />
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
