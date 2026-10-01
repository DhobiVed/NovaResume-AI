import React, { useState } from 'react';

// ─── COLOR PALETTE CONSTANTS ────────────────────────────────────
export const CHART_COLORS = {
  emerald: '#10B981', // Strong (>=75%)
  amber: '#F59E0B',   // Moderate (60-74%)
  rose: '#EF4444',    // Needs Improvement (<60%)
  peach: '#6366F1',   // Accent / Brand
  peachLight: '#E0E7FF',
  cream: '#F8FAFC',
  indigo: '#6366F1',  // Tech / Secondary
  sky: '#0EA5E9',     // Blue / Primary
  slate: '#64748B',   // Neutral
  slateDark: '#0F172A',
  slateLight: '#F1F5F9',
  border: '#E2E8F0'
};

// ─── 1. DONUT / PIE CHART ───────────────────────────────────────
export interface DonutSlice {
  label: string;
  value: number;
  color: string;
  sublabel?: string;
}

interface DonutChartProps {
  data: DonutSlice[];
  title?: string;
  centerLabel?: string;
  centerSublabel?: string;
  size?: number;
  strokeWidth?: number;
  unit?: string;
}

export const DonutChart: React.FC<DonutChartProps> = ({
  data,
  title,
  centerLabel,
  centerSublabel,
  size = 220,
  strokeWidth = 28,
  unit = '%'
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const total = data.reduce((sum, d) => sum + d.value, 0);

  if (total === 0 || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200" style={{ height: size + 60 }}>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">No Data Available</p>
        <p className="text-[11px] text-slate-400 mt-1">Complete assessments to view visual composition</p>
      </div>
    );
  }

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  let accumulatedAngle = 0;

  return (
    <div className="flex flex-col items-center">
      {title && (
        <div className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 text-center">
          {title}
        </div>
      )}
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
          {/* Base background ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="#F1F5F9"
            strokeWidth={strokeWidth}
          />
          {/* Slices */}
          {data.map((slice, i) => {
            const fraction = slice.value / total;
            const strokeDasharray = `${fraction * circumference} ${circumference}`;
            const strokeDashoffset = -accumulatedAngle * circumference;
            accumulatedAngle += fraction;
            const isHovered = hoveredIdx === i;

            return (
              <circle
                key={i}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="transparent"
                stroke={slice.color}
                strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-200 cursor-pointer"
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
                style={{
                  filter: isHovered ? 'drop-shadow(0 4px 6px rgba(0,0,0,0.15))' : 'none'
                }}
              />
            );
          })}
        </svg>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
          {hoveredIdx !== null && data[hoveredIdx] ? (
            <>
              <span className="text-lg font-black text-slate-900 leading-tight">
                {data[hoveredIdx].value}{unit}
              </span>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight max-w-[100px] truncate">
                {data[hoveredIdx].label}
              </span>
            </>
          ) : (
            <>
              <span className="text-lg font-black text-slate-900 leading-tight">
                {centerLabel || `${total}${unit}`}
              </span>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">
                {centerSublabel || 'Total'}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-3 mt-4">
        {data.map((slice, i) => (
          <div
            key={i}
            className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-xs transition cursor-pointer ${
              hoveredIdx === i ? 'bg-slate-100 font-semibold text-slate-900' : 'text-slate-600'
            }`}
            onMouseEnter={() => setHoveredIdx(i)}
            onMouseLeave={() => setHoveredIdx(null)}
          >
            <span
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: slice.color }}
            />
            <span>{slice.label}:</span>
            <span className="font-bold text-slate-900">{slice.value}{unit}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── 2. VERTICAL BAR CHART (SCORE DISTRIBUTION) ────────────────
export interface BarDataPoint {
  label: string;
  value: number;
  percentage?: number;
  color?: string;
  sublabel?: string;
}

interface VerticalBarChartProps {
  data: BarDataPoint[];
  title?: string;
  height?: number;
  unit?: string;
  emptyMessage?: string;
}

export const VerticalBarChart: React.FC<VerticalBarChartProps> = ({
  data,
  title,
  height = 180,
  unit = 'students',
  emptyMessage = 'No distribution data available'
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const maxValue = Math.max(...data.map(d => d.value), 1);

  if (data.length === 0 || data.every(d => d.value === 0)) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200" style={{ height }}>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Empty State</p>
        <p className="text-[11px] text-slate-400 mt-1">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {title && (
        <div className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
          {title}
        </div>
      )}
      <div className="flex items-end gap-3 justify-between pt-6 px-2" style={{ height }}>
        {data.map((bar, i) => {
          const barHeightPct = Math.max((bar.value / maxValue) * 100, 6);
          const isHovered = hoveredIdx === i;
          const barColor = bar.color || (i === 0 ? CHART_COLORS.emerald : i === 1 ? CHART_COLORS.sky : i === 2 ? CHART_COLORS.amber : CHART_COLORS.rose);

          return (
            <div
              key={i}
              className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer"
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              {/* Value floating pill on hover / always */}
              <div
                className={`text-[10px] font-bold mb-1.5 transition-all ${
                  isHovered ? 'scale-110 text-slate-950 font-black' : 'text-slate-600'
                }`}
              >
                {bar.value}
                {bar.percentage !== undefined && (
                  <span className="text-[9px] text-slate-400 ml-0.5">({bar.percentage}%)</span>
                )}
              </div>

              {/* Bar track and fill */}
              <div className="w-full max-w-[48px] bg-slate-100 rounded-t-lg overflow-hidden flex items-end relative" style={{ height: '75%' }}>
                <div
                  className="w-full rounded-t-lg transition-all duration-300 relative"
                  style={{
                    height: `${barHeightPct}%`,
                    backgroundColor: barColor,
                    opacity: hoveredIdx !== null && hoveredIdx !== i ? 0.6 : 1
                  }}
                >
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>

              {/* Bottom label */}
              <div className="text-center mt-2 w-full">
                <div className={`text-[10px] font-bold leading-tight truncate ${isHovered ? 'text-slate-900' : 'text-slate-700'}`}>
                  {bar.label}
                </div>
                {bar.sublabel && (
                  <div className="text-[9px] text-slate-400 truncate mt-0.5">
                    {bar.sublabel}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex justify-between items-center text-[10px] text-slate-400 pt-3 border-t border-slate-100 mt-2 px-1">
        <span>Metric: {unit}</span>
        <span>Filter applied: Current Selection</span>
      </div>
    </div>
  );
};

// ─── 3. HORIZONTAL BAR CHART (TOPIC STRENGTHS / SKILLS) ─────────
export interface HorizontalBarItem {
  name: string;
  value: number; // e.g. 0-100%
  category?: string;
  benchmark?: number; // target or average
  status?: 'Strong' | 'Moderate' | 'Weak' | string;
}

interface HorizontalBarChartProps {
  data: HorizontalBarItem[];
  title?: string;
  unit?: string;
  emptyMessage?: string;
}

export const HorizontalBarChart: React.FC<HorizontalBarChartProps> = ({
  data,
  title,
  unit = '%',
  emptyMessage = 'No topic analytics available yet'
}) => {
  if (data.length === 0) {
    return (
      <div className="p-6 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Empty State</p>
        <p className="text-[11px] text-slate-400 mt-1">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-3">
      {title && (
        <div className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
          {title}
        </div>
      )}
      <div className="space-y-2.5">
        {data.map((item, i) => {
          const color =
            item.value >= 75
              ? CHART_COLORS.emerald
              : item.value >= 60
              ? CHART_COLORS.amber
              : CHART_COLORS.rose;

          return (
            <div key={i} className="group p-2 rounded-lg hover:bg-slate-50 transition border border-transparent hover:border-slate-200">
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                  {item.name}
                  {item.category && (
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-500 font-medium">
                      {item.category}
                    </span>
                  )}
                </span>
                <span className="font-bold text-slate-900 flex items-center gap-1">
                  <span>{item.value}{unit}</span>
                  {item.status && (
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                        item.status === 'Strong'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : item.status === 'Moderate'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {item.status}
                    </span>
                  )}
                </span>
              </div>

              {/* Progress track */}
              <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden relative">
                <div
                  className="h-full rounded-full transition-all duration-500 relative"
                  style={{ width: `${Math.min(item.value, 100)}%`, backgroundColor: color }}
                />
                {/* Benchmark marker line if present */}
                {item.benchmark !== undefined && (
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-slate-900/60 z-10"
                    style={{ left: `${item.benchmark}%` }}
                    title={`Benchmark: ${item.benchmark}%`}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── 4. COMPARISON BAR CHART (CURRICULUM VS INDUSTRY DEMAND) ─────
export interface ComparisonItem {
  skill: string;
  curriculumCoveragePct: number; // What students learn
  industryDemandPct: number;      // What industry needs
  gapPercentage: number;          // Gap = Industry - Coverage
  priority: 'High' | 'Medium' | 'Low';
}

interface ComparisonBarChartProps {
  data: ComparisonItem[];
  title?: string;
  emptyMessage?: string;
}

export const ComparisonBarChart: React.FC<ComparisonBarChartProps> = ({
  data,
  title = 'Curriculum Coverage vs Industry Demand',
  emptyMessage = 'No curriculum comparison data available'
}) => {
  if (data.length === 0) {
    return (
      <div className="p-6 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">No Data</p>
        <p className="text-[11px] text-slate-400 mt-1">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {/* Legend & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-slate-800">{title}</div>
          <div className="text-[11px] text-slate-500">Comparing syllabus hours vs recruiter skill requirements</div>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-sky-500" />
            <span className="text-slate-600 font-medium">Curriculum Coverage</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-amber-500" />
            <span className="text-slate-600 font-medium">Industry Demand</span>
          </div>
        </div>
      </div>

      {/* Rows */}
      <div className="space-y-3">
        {data.map((item, i) => {
          const isDeficit = item.industryDemandPct > item.curriculumCoveragePct;
          return (
            <div key={i} className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition">
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-slate-900 text-xs">{item.skill}</span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    item.priority === 'High'
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : item.priority === 'Medium'
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}
                >
                  {item.priority} Gap {isDeficit ? `(-${Math.abs(item.gapPercentage)}%)` : '(Aligned)'}
                </span>
              </div>

              {/* Dual bars */}
              <div className="space-y-1.5">
                {/* Curriculum Bar */}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-semibold text-slate-500 w-16">Curriculum:</span>
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-sky-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(item.curriculumCoveragePct, 100)}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-sky-700 w-8 text-right">
                    {item.curriculumCoveragePct}%
                  </span>
                </div>

                {/* Industry Bar */}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-semibold text-slate-500 w-16">Industry:</span>
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(item.industryDemandPct, 100)}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-amber-700 w-8 text-right">
                    {item.industryDemandPct}%
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
