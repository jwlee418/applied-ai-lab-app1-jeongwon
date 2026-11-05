import React, { useMemo, useState } from 'react';
import { BarChart3, Layers, Maximize2, TrendingUp } from 'lucide-react';
import { AnalyticsResult } from '../types';

interface RevenueChartProps {
  analytics: AnalyticsResult;
  topRegionName?: string;
}

// Region distinct color palette
const REGION_COLORS = [
  '#4f46e5', // indigo-600
  '#06b6d4', // cyan-500
  '#10b981', // emerald-500
  '#f59e0b', // amber-500
  '#ec4899', // pink-500
  '#8b5cf6', // purple-500
  '#3b82f6', // blue-500
  '#14b8a6', // teal-500
];

const QUARTER_COLORS: Record<string, string> = {
  Q1: '#94a3b8', // slate-400
  Q2: '#38bdf8', // sky-400
  Q3: '#6366f1', // indigo-500
  Q4: '#10b981', // emerald-500
};

export const RevenueChart: React.FC<RevenueChartProps> = ({ analytics, topRegionName }) => {
  const [groupBy, setGroupBy] = useState<'quarter' | 'region'>('quarter');
  const [hoveredBar, setHoveredBar] = useState<{
    quarter: string;
    region: string;
    revenue: number;
    units: number;
    pctOfQuarter: number;
    x: number;
    y: number;
  } | null>(null);

  const { quarters, regions, regionSummaries, grandTotal } = analytics;

  // Build color mapping for regions
  const regionColorMap = useMemo(() => {
    const map: Record<string, string> = {};
    regions.forEach((r, idx) => {
      map[r] = REGION_COLORS[idx % REGION_COLORS.length];
    });
    return map;
  }, [regions]);

  // SVG dimensions
  const svgWidth = 840;
  const svgHeight = 360;
  const padding = { top: 30, right: 30, bottom: 50, left: 75 };
  const chartWidth = svgWidth - padding.left - padding.right;
  const chartHeight = svgHeight - padding.top - padding.bottom;

  // Determine maximum revenue value for scaling
  const maxRevenue = useMemo(() => {
    let max = 0;
    regionSummaries.forEach((r) => {
      max = Math.max(max, r.q1Rev, r.q2Rev, r.q3Rev, r.q4Rev);
    });
    // Add 15% headroom
    return max > 0 ? max * 1.15 : 100000;
  }, [regionSummaries]);

  // Compute horizontal categories
  const categories = groupBy === 'quarter' ? quarters : regions;
  const subItems = groupBy === 'quarter' ? regions : quarters;

  const categoryWidth = chartWidth / (categories.length || 1);
  const groupPadding = categoryWidth * 0.2;
  const availableBarSpace = categoryWidth - groupPadding;
  const barWidth = Math.max(4, availableBarSpace / (subItems.length || 1));

  // Ticks for Y axis
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((pct) => pct * maxRevenue);

  const formatCurrency = (val: number) => {
    if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `$${Math.round(val / 1000)}k`;
    return `$${Math.round(val)}`;
  };

  const getBarValue = (cat: string, sub: string) => {
    const quarter = groupBy === 'quarter' ? cat : sub;
    const region = groupBy === 'quarter' ? sub : cat;
    const summary = regionSummaries.find((r) => r.region === region);
    if (!summary) return { rev: 0, units: 0 };
    switch (quarter) {
      case 'Q1':
        return { rev: summary.q1Rev, units: summary.q1Units };
      case 'Q2':
        return { rev: summary.q2Rev, units: summary.q2Units };
      case 'Q3':
        return { rev: summary.q3Rev, units: summary.q3Units };
      case 'Q4':
        return { rev: summary.q4Rev, units: summary.q4Units };
      default:
        return { rev: 0, units: 0 };
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 overflow-hidden">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
              <BarChart3 className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Total Revenue by Region &amp; Quarter</h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Clustered quarterly comparison highlighting regional sales trajectory and Q2 to Q3 inflection points.
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="inline-flex items-center bg-slate-100 p-0.5 rounded-lg text-xs border border-slate-200">
            <button
              onClick={() => setGroupBy('quarter')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                groupBy === 'quarter'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Group by Quarter
            </button>
            <button
              onClick={() => setGroupBy('region')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                groupBy === 'region'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Group by Region
            </button>
          </div>
        </div>
      </div>

      {/* SVG Chart */}
      <div className="relative mt-4 overflow-x-auto">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto min-w-[620px] select-none"
        >
          {/* Grid lines and Y axis ticks */}
          {yTicks.map((tick, i) => {
            const y = padding.top + chartHeight - (tick / maxRevenue) * chartHeight;
            return (
              <g key={i}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={svgWidth - padding.right}
                  y2={y}
                  stroke={i === 0 ? '#cbd5e1' : '#f1f5f9'}
                  strokeDasharray={i === 0 ? '' : '3 3'}
                  strokeWidth="1"
                />
                <text
                  x={padding.left - 10}
                  y={y + 4}
                  textAnchor="end"
                  className="text-[11px] fill-slate-400 font-mono"
                >
                  {formatCurrency(tick)}
                </text>
              </g>
            );
          })}

          {/* Grouped Bars */}
          {categories.map((cat, catIdx) => {
            const groupX = padding.left + catIdx * categoryWidth + groupPadding / 2;
            const quarterRevTotal =
              groupBy === 'quarter'
                ? cat === 'Q1'
                  ? grandTotal.q1Rev
                  : cat === 'Q2'
                    ? grandTotal.q2Rev
                    : cat === 'Q3'
                      ? grandTotal.q3Rev
                      : grandTotal.q4Rev
                : 0;

            return (
              <g key={cat}>
                {/* Category X Axis Label */}
                <text
                  x={groupX + availableBarSpace / 2}
                  y={svgHeight - padding.bottom + 22}
                  textAnchor="middle"
                  className="text-xs font-semibold fill-slate-700"
                >
                  {cat}
                </text>

                {/* Sub Bars */}
                {subItems.map((sub, subIdx) => {
                  const { rev, units } = getBarValue(cat, sub);
                  const barH = (rev / maxRevenue) * chartHeight;
                  const x = groupX + subIdx * barWidth;
                  const y = padding.top + chartHeight - barH;

                  const region = groupBy === 'quarter' ? sub : cat;
                  const quarter = groupBy === 'quarter' ? cat : sub;
                  const isTopRegion = region === topRegionName;
                  const barColor =
                    groupBy === 'quarter'
                      ? regionColorMap[region] || '#6366f1'
                      : QUARTER_COLORS[quarter] || '#6366f1';

                  const pctOfQuarter = quarterRevTotal > 0 ? (rev / quarterRevTotal) * 100 : 0;

                  return (
                    <g key={sub}>
                      {/* Bar Rectangle */}
                      <rect
                        x={x + 1}
                        y={y}
                        width={Math.max(2, barWidth - 2)}
                        height={Math.max(0, barH)}
                        rx="4"
                        fill={barColor}
                        className={`transition-all duration-200 cursor-pointer ${
                          isTopRegion ? 'filter drop-shadow-sm' : ''
                        }`}
                        opacity={
                          hoveredBar
                            ? hoveredBar.region === region && hoveredBar.quarter === quarter
                              ? 1
                              : 0.55
                            : 0.92
                        }
                        stroke={isTopRegion ? '#1e1b4b' : 'transparent'}
                        strokeWidth={isTopRegion ? 1.5 : 0}
                        onMouseEnter={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          setHoveredBar({
                            quarter,
                            region,
                            revenue: rev,
                            units,
                            pctOfQuarter,
                            x,
                            y,
                          });
                        }}
                        onMouseLeave={() => setHoveredBar(null)}
                      />
                    </g>
                  );
                })}
              </g>
            );
          })}

          {/* X axis baseline */}
          <line
            x1={padding.left}
            y1={padding.top + chartHeight}
            x2={svgWidth - padding.right}
            y2={padding.top + chartHeight}
            stroke="#94a3b8"
            strokeWidth="1.5"
          />
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoveredBar && (
          <div
            className="absolute pointer-events-none z-30 transform -translate-x-1/2 -translate-y-full mb-2 bg-slate-900 text-white rounded-xl shadow-lg p-3 text-xs border border-slate-700 min-w-[170px]"
            style={{
              left: `${(hoveredBar.x / svgWidth) * 100}%`,
              top: `${(hoveredBar.y / svgHeight) * 100}%`,
            }}
          >
            <div className="flex items-center justify-between font-semibold pb-1 border-b border-slate-700 mb-1.5">
              <span className="text-indigo-300">{hoveredBar.region}</span>
              <span className="bg-slate-800 px-1.5 py-0.5 rounded text-[10px] text-slate-300">
                {hoveredBar.quarter}
              </span>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">Revenue:</span>
                <span className="font-bold text-emerald-400">
                  ${Math.round(hoveredBar.revenue).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Order Units:</span>
                <span className="font-semibold text-slate-200">
                  {hoveredBar.units.toLocaleString()}
                </span>
              </div>
              {hoveredBar.pctOfQuarter > 0 && (
                <div className="flex justify-between text-[11px] pt-1 border-t border-slate-800 text-slate-400">
                  <span>Share of {hoveredBar.quarter}:</span>
                  <span className="text-indigo-300 font-medium">
                    {hoveredBar.pctOfQuarter.toFixed(1)}%
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-1.5 text-slate-500 font-medium">
          <span>Legend ({groupBy === 'quarter' ? 'Regions' : 'Quarters'}):</span>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {groupBy === 'quarter'
            ? regions.map((region) => (
                <div key={region} className="flex items-center gap-1.5">
                  <div
                    className="w-3 h-3 rounded-sm shadow-2xs"
                    style={{ backgroundColor: regionColorMap[region] }}
                  />
                  <span className={`text-slate-700 ${region === topRegionName ? 'font-bold' : ''}`}>
                    {region}
                    {region === topRegionName && (
                      <span className="ml-1 text-[10px] text-indigo-600 font-bold">• Top Mover</span>
                    )}
                  </span>
                </div>
              ))
            : quarters.map((q) => (
                <div key={q} className="flex items-center gap-1.5">
                  <div
                    className="w-3 h-3 rounded-sm shadow-2xs"
                    style={{ backgroundColor: QUARTER_COLORS[q] || '#6366f1' }}
                  />
                  <span className="text-slate-700 font-medium">{q}</span>
                </div>
              ))}
        </div>
      </div>
    </div>
  );
};
