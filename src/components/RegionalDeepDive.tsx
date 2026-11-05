import React, { useState } from 'react';
import {
  Boxes,
  Briefcase,
  Layers,
  Percent,
  Tag,
  TrendingDown,
  TrendingUp,
  Users,
} from 'lucide-react';
import { AnalyticsResult, RegionDeepDive } from '../types';

interface RegionalDeepDiveProps {
  deepDive: RegionDeepDive;
  analytics: AnalyticsResult;
  onSelectRegion: (region: string) => void;
}

export const RegionalDeepDive: React.FC<RegionalDeepDiveProps> = ({
  deepDive,
  analytics,
  onSelectRegion,
}) => {
  const [activeTab, setActiveTab] = useState<'products' | 'channels'>('products');

  const formatCurrency = (val: number) => `$${Math.round(val).toLocaleString()}`;
  const formatPct = (val: number) => `${val >= 0 ? '+' : ''}${val.toFixed(1)}%`;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 overflow-hidden">
      {/* Title & Region Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-sky-50 text-sky-600">
              <Boxes className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Variance Driver Attribution: <span className="text-indigo-600">{deepDive.region}</span>
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Explaining why revenue changed by{' '}
            <strong className={deepDive.revenueChange >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
              {deepDive.revenueChange >= 0 ? '+' : ''}
              {formatCurrency(deepDive.revenueChange)} ({formatPct(deepDive.percentChange)})
            </strong>{' '}
            between Q2 and Q3 using calculated product, channel, and discount figures.
          </p>
        </div>

        {/* Region selector dropdown */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-500 font-medium">Inspect Region:</label>
          <select
            value={deepDive.region}
            onChange={(e) => onSelectRegion(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          >
            {analytics.regions.map((reg) => (
              <option key={reg} value={reg}>
                {reg} {reg === analytics.topChangedRegionByDollar.region ? '★ (Top Mover)' : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI Cards: Volume vs Pricing Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
        <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Total Units Shift</span>
            <Boxes className="w-3.5 h-3.5 text-indigo-500" />
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-lg font-bold text-slate-900 font-mono">
              {deepDive.unitsChange >= 0 ? '+' : ''}
              {deepDive.unitsChange.toLocaleString()}
            </span>
            <span
              className={`text-xs font-semibold ${
                deepDive.unitsPercentChange >= 0 ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {formatPct(deepDive.unitsPercentChange)}
            </span>
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Q2: {deepDive.q2Units.toLocaleString()} → Q3: {deepDive.q3Units.toLocaleString()} units
          </div>
        </div>

        <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Average Discount Rate</span>
            <Percent className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-lg font-bold text-slate-900 font-mono">
              {deepDive.discountDiffPctPoints >= 0 ? '+' : ''}
              {deepDive.discountDiffPctPoints.toFixed(1)} pp
            </span>
            <span className="text-xs text-slate-500">shift</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Q2: {deepDive.q2AvgDiscount.toFixed(1)}% → Q3: {deepDive.q3AvgDiscount.toFixed(1)}%
          </div>
        </div>

        <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Top Product Driver</span>
            <Tag className="w-3.5 h-3.5 text-sky-500" />
          </div>
          <div className="mt-1 truncate font-bold text-slate-900 text-sm">
            {deepDive.topProducts[0]?.product || 'N/A'}
          </div>
          <div className="text-[11px] text-emerald-600 font-medium mt-0.5">
            {deepDive.topProducts[0]
              ? `${deepDive.topProducts[0].change >= 0 ? '+' : ''}${formatCurrency(
                  deepDive.topProducts[0].change
                )} (${formatPct(deepDive.topProducts[0].pctChange)})`
              : '—'}
          </div>
        </div>

        <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Top Channel Impact</span>
            <Briefcase className="w-3.5 h-3.5 text-purple-500" />
          </div>
          <div className="mt-1 truncate font-bold text-slate-900 text-sm">
            {deepDive.topChannels[0]?.channel || 'N/A'}
          </div>
          <div className="text-[11px] text-indigo-600 font-medium mt-0.5">
            {deepDive.topChannels[0]
              ? `${deepDive.topChannels[0].change >= 0 ? '+' : ''}${formatCurrency(
                  deepDive.topChannels[0].change
                )} (${formatPct(deepDive.topChannels[0].pctChange)})`
              : '—'}
          </div>
        </div>
      </div>

      {/* Tabs for Product vs Channel Deep Dive */}
      <div className="mt-6">
        <div className="flex border-b border-slate-200 gap-6">
          <button
            onClick={() => setActiveTab('products')}
            className={`pb-2 text-xs font-semibold flex items-center gap-1.5 transition-colors border-b-2 -mb-px ${
              activeTab === 'products'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            Product Breakdown ({deepDive.topProducts.length})
          </button>
          <button
            onClick={() => setActiveTab('channels')}
            className={`pb-2 text-xs font-semibold flex items-center gap-1.5 transition-colors border-b-2 -mb-px ${
              activeTab === 'channels'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            Channel Breakdown ({deepDive.topChannels.length})
          </button>
        </div>

        {/* Product Breakdown Table */}
        {activeTab === 'products' ? (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <th className="py-2.5 px-3">Product Name</th>
                  <th className="py-2.5 px-3 text-right">Q2 Revenue</th>
                  <th className="py-2.5 px-3 text-right">Q3 Revenue</th>
                  <th className="py-2.5 px-3 text-right">Revenue Shift ($)</th>
                  <th className="py-2.5 px-3 text-right">Revenue Shift (%)</th>
                  <th className="py-2.5 px-3 text-right">Units (Q2 → Q3)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {deepDive.topProducts.map((p, idx) => (
                  <tr key={p.product} className="hover:bg-slate-50/70">
                    <td className="py-2.5 px-3 font-medium text-slate-800 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-[10px] font-bold">
                        {idx + 1}
                      </span>
                      {p.product}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-600 font-mono">
                      {formatCurrency(p.q2Rev)}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-800 font-mono font-medium">
                      {formatCurrency(p.q3Rev)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-semibold">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded ${
                          p.change >= 0 ? 'text-emerald-700 bg-emerald-50' : 'text-rose-700 bg-rose-50'
                        }`}
                      >
                        {p.change >= 0 ? '+' : ''}
                        {formatCurrency(p.change)}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono">
                      <span
                        className={`font-semibold ${
                          p.pctChange >= 0 ? 'text-emerald-700' : 'text-rose-700'
                        }`}
                      >
                        {formatPct(p.pctChange)}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-600 font-mono">
                      {p.q2Units.toLocaleString()} → {p.q3Units.toLocaleString()} (
                      {p.unitsChange >= 0 ? '+' : ''}
                      {p.unitsChange.toLocaleString()})
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* Channel Breakdown Table */
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <th className="py-2.5 px-3">Channel Name</th>
                  <th className="py-2.5 px-3 text-right">Q2 Revenue</th>
                  <th className="py-2.5 px-3 text-right">Q3 Revenue</th>
                  <th className="py-2.5 px-3 text-right">Revenue Shift ($)</th>
                  <th className="py-2.5 px-3 text-right">Revenue Shift (%)</th>
                  <th className="py-2.5 px-3 text-right">Units (Q2 → Q3)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {deepDive.topChannels.map((c, idx) => (
                  <tr key={c.channel} className="hover:bg-slate-50/70">
                    <td className="py-2.5 px-3 font-medium text-slate-800 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-[10px] font-bold">
                        {idx + 1}
                      </span>
                      {c.channel}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-600 font-mono">
                      {formatCurrency(c.q2Rev)}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-800 font-mono font-medium">
                      {formatCurrency(c.q3Rev)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-semibold">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded ${
                          c.change >= 0 ? 'text-emerald-700 bg-emerald-50' : 'text-rose-700 bg-rose-50'
                        }`}
                      >
                        {c.change >= 0 ? '+' : ''}
                        {formatCurrency(c.change)}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono">
                      <span
                        className={`font-semibold ${
                          c.pctChange >= 0 ? 'text-emerald-700' : 'text-rose-700'
                        }`}
                      >
                        {formatPct(c.pctChange)}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-600 font-mono">
                      {c.q2Units.toLocaleString()} → {c.q3Units.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
