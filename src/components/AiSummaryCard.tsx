import React, { useState } from 'react';
import {
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  Database,
  ExternalLink,
  Flame,
  Info,
  RefreshCw,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { AnalyticsResult, RegionDeepDive } from '../types';

interface AiSummaryCardProps {
  summary: string;
  isLoading: boolean;
  onRegenerate: () => void;
  deepDive: RegionDeepDive;
  analytics: AnalyticsResult;
  selectedCriterion: 'absolute_dollar' | 'percentage';
  onCriterionChange: (crit: 'absolute_dollar' | 'percentage') => void;
  error?: string | null;
  source?: string;
}

export const AiSummaryCard: React.FC<AiSummaryCardProps> = ({
  summary,
  isLoading,
  onRegenerate,
  deepDive,
  analytics,
  selectedCriterion,
  onCriterionChange,
  error,
  source,
}) => {
  const [copied, setCopied] = useState(false);
  const [showProofPanel, setShowProofPanel] = useState(false);

  const handleCopy = () => {
    if (!summary) return;
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Split summary into sentences for enhanced readability
  // Split on periods followed by space or end of string
  const rawSentences = summary
    ? summary
        .split(/(?<=[.?!])\s+/)
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  const formatCurrency = (val: number) => `$${Math.round(val).toLocaleString()}`;
  const formatPct = (val: number) => `${val >= 0 ? '+' : ''}${val.toFixed(1)}%`;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-900 text-white shadow-xl border border-indigo-500/30">
      {/* Background ambient glow effect */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-sky-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative p-6 sm:p-7">
        {/* Top Header bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/20 border border-indigo-400/30 text-indigo-300">
              <Sparkles className="w-5 h-5 text-indigo-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold tracking-wider uppercase text-indigo-300">
                  AI Shift Attribution
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Grounded with Calculated Data
                </span>
                {source === 'gemini-3.8-flash' && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    Gemini 3.8 Flash
                  </span>
                )}
              </div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Q2 → Q3 Regional Variance Summary
              </h2>
            </div>
          </div>

          {/* Metric Criterion Toggle & Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center bg-white/5 border border-white/10 rounded-lg p-0.5 text-xs">
              <button
                onClick={() => onCriterionChange('absolute_dollar')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  selectedCriterion === 'absolute_dollar'
                    ? 'bg-indigo-600 text-white font-medium shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
                title="Identify region with largest absolute dollar variance"
              >
                Top by Dollar ($)
              </button>
              <button
                onClick={() => onCriterionChange('percentage')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  selectedCriterion === 'percentage'
                    ? 'bg-indigo-600 text-white font-medium shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
                title="Identify region with largest percentage variance"
              >
                Top by % Change
              </button>
            </div>

            <button
              onClick={handleCopy}
              disabled={isLoading || !summary}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/10 hover:bg-white/15 text-slate-200 border border-white/10 transition-colors disabled:opacity-50"
              title="Copy 3-sentence summary"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>

            <button
              onClick={onRegenerate}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white transition-colors shadow-sm disabled:opacity-50"
              title="Re-run Gemini AI Shift Attribution"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'Analyzing...' : 'Regenerate'}</span>
            </button>
          </div>
        </div>

        {/* Highlighted Region Banner */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-600/30 text-indigo-300">
              <Flame className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <div className="text-xs text-slate-400">Greatest Q2→Q3 Shift Region</div>
              <div className="text-base font-bold text-white flex items-center gap-2">
                {deepDive.region}
                <span
                  className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full ${
                    deepDive.revenueChange >= 0
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  }`}
                >
                  {deepDive.revenueChange >= 0 ? (
                    <TrendingUp className="w-3 h-3 mr-1" />
                  ) : (
                    <TrendingDown className="w-3 h-3 mr-1" />
                  )}
                  {deepDive.revenueChange >= 0 ? '+' : ''}
                  {formatCurrency(deepDive.revenueChange)} ({formatPct(deepDive.percentChange)})
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="text-right">
              <span className="text-slate-400 block">Q2 Revenue</span>
              <span className="font-semibold text-slate-200">{formatCurrency(deepDive.q2Revenue)}</span>
            </div>
            <div className="text-slate-500">→</div>
            <div className="text-right">
              <span className="text-slate-400 block">Q3 Revenue</span>
              <span className="font-semibold text-slate-200">{formatCurrency(deepDive.q3Revenue)}</span>
            </div>
            <div className="h-6 w-px bg-white/10 hidden sm:block" />
            <div className="text-right hidden sm:block">
              <span className="text-slate-400 block">Volume Shift</span>
              <span className="font-semibold text-slate-200">
                {deepDive.unitsChange >= 0 ? '+' : ''}
                {deepDive.unitsChange.toLocaleString()} units ({formatPct(deepDive.unitsPercentChange)})
              </span>
            </div>
          </div>
        </div>

        {/* AI Output Section */}
        <div className="mt-5">
          {isLoading ? (
            <div className="py-8 flex flex-col items-center justify-center text-center">
              <div className="w-8 h-8 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin mb-3" />
              <p className="text-sm font-medium text-slate-200">
                Synthesizing calculated sales figures into a three-sentence executive summary...
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Grounded directly on {deepDive.region}&apos;s verified Q2 ($
                {Math.round(deepDive.q2Revenue).toLocaleString()}) and Q3 ($
                {Math.round(deepDive.q3Revenue).toLocaleString()}) revenue, units, and product mix.
              </p>
            </div>
          ) : error && !summary ? (
            <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-sm">
              <p className="font-semibold">Unable to generate AI summary</p>
              <p className="text-xs mt-1 text-rose-200">{error}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {rawSentences.length > 0 ? (
                <div className="grid grid-cols-1 gap-2.5">
                  {rawSentences.map((sentence, idx) => {
                    const sentenceLabels = [
                      { label: 'Sentence 1 • The Shift', color: 'border-l-indigo-400 bg-indigo-500/10' },
                      { label: 'Sentence 2 • Primary Driver (Product / Volume)', color: 'border-l-sky-400 bg-sky-500/10' },
                      { label: 'Sentence 3 • Secondary Factors (Channel / Discount)', color: 'border-l-teal-400 bg-teal-500/10' },
                    ];
                    const cfg = sentenceLabels[idx] || {
                      label: `Sentence ${idx + 1}`,
                      color: 'border-l-purple-400 bg-purple-500/10',
                    };

                    return (
                      <div
                        key={idx}
                        className={`p-3.5 rounded-xl border-l-4 ${cfg.color} border border-white/5 bg-white/5 transition-all hover:bg-white/10`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            {cfg.label}
                          </span>
                        </div>
                        <p className="text-sm sm:text-base leading-relaxed text-slate-100 font-normal">
                          {sentence}
                        </p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-slate-300 leading-relaxed italic bg-white/5 p-4 rounded-xl border border-white/5">
                  {summary}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Grounding Verification Panel Toggle */}
        <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5 text-indigo-300">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Strict constraint: 3 sentences generated using only computed figures.</span>
          </div>
          <button
            onClick={() => setShowProofPanel(!showProofPanel)}
            className="inline-flex items-center gap-1 text-slate-300 hover:text-white transition-colors py-1 px-2 rounded-md hover:bg-white/5"
          >
            <Database className="w-3.5 h-3.5 text-indigo-400" />
            <span>{showProofPanel ? 'Hide Grounding Numbers' : 'View Grounding Numbers'}</span>
            {showProofPanel ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Collapsible Verified Calculation Data Proof */}
        {showProofPanel && (
          <div className="mt-4 p-4 rounded-xl bg-black/40 border border-white/10 text-xs font-mono text-slate-300 space-y-3">
            <div className="flex items-center justify-between text-indigo-300 font-semibold border-b border-white/10 pb-2">
              <span>Verified Numerical Inputs Passed to AI Engine</span>
              <span className="text-[10px] bg-indigo-500/20 px-2 py-0.5 rounded text-indigo-200">
                100% Calculated Grounding
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="p-2.5 rounded-lg bg-white/5">
                <span className="text-slate-400 block text-[11px]">Region &amp; Direction</span>
                <span className="text-white font-bold">{deepDive.region}</span>
                <div className="text-slate-400 text-[10px] mt-0.5">
                  {deepDive.revenueChange >= 0 ? 'Expansion (+)' : 'Contraction (-)'}
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-white/5">
                <span className="text-slate-400 block text-[11px]">Revenue Q2 → Q3</span>
                <span className="text-emerald-400 font-bold">
                  {formatCurrency(deepDive.q2Revenue)} → {formatCurrency(deepDive.q3Revenue)}
                </span>
                <div className="text-slate-400 text-[10px] mt-0.5">
                  Delta: {formatCurrency(deepDive.revenueChange)} ({formatPct(deepDive.percentChange)})
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-white/5">
                <span className="text-slate-400 block text-[11px]">Order Units Volume</span>
                <span className="text-sky-300 font-bold">
                  {deepDive.q2Units.toLocaleString()} → {deepDive.q3Units.toLocaleString()}
                </span>
                <div className="text-slate-400 text-[10px] mt-0.5">
                  Delta: {deepDive.unitsChange >= 0 ? '+' : ''}
                  {deepDive.unitsChange.toLocaleString()} ({formatPct(deepDive.unitsPercentChange)})
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-white/5">
                <span className="text-slate-400 block text-[11px]">Avg Discount Rate</span>
                <span className="text-amber-300 font-bold">
                  {deepDive.q2AvgDiscount.toFixed(1)}% → {deepDive.q3AvgDiscount.toFixed(1)}%
                </span>
                <div className="text-slate-400 text-[10px] mt-0.5">
                  Shift: {deepDive.discountDiffPctPoints >= 0 ? '+' : ''}
                  {deepDive.discountDiffPctPoints.toFixed(1)} pp
                </div>
              </div>
            </div>

            {deepDive.topProducts && deepDive.topProducts.length > 0 && (
              <div className="pt-2 border-t border-white/5">
                <span className="text-slate-400 block mb-1 text-[11px]">
                  Top Product Drivers in {deepDive.region}:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {deepDive.topProducts.slice(0, 4).map((p) => (
                    <div key={p.product} className="p-2 rounded bg-white/5 text-[11px] flex justify-between">
                      <span className="text-slate-200 truncate mr-2">{p.product}</span>
                      <span className={p.change >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                        {p.change >= 0 ? '+' : ''}
                        {formatCurrency(p.change)} ({formatPct(p.pctChange)})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
