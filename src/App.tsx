/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Database,
  FileSpreadsheet,
  FileText,
  HelpCircle,
  Layers,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Upload,
  Wand2,
} from 'lucide-react';
import { AnalyticsResult, RegionDeepDive, SalesOrder } from './types';
import { SAMPLE_CSV_CONTENT, SAMPLE_DIRTY_CSV_CONTENT } from './utils/sampleData';
import { parseSalesCsv } from './utils/csvParser';
import { calculateAnalytics } from './utils/analytics';
import { Header } from './components/Header';
import { CsvUploader } from './components/CsvUploader';
import { AiSummaryCard } from './components/AiSummaryCard';
import { RevenueChart } from './components/RevenueChart';
import { RevenueTable } from './components/RevenueTable';
import { RegionalDeepDive } from './components/RegionalDeepDive';
import { RawDataDrawer } from './components/RawDataDrawer';
import { DataHygieneModal } from './components/DataHygieneModal';

export default function App() {
  const [csvRawText, setCsvRawText] = useState<string>(SAMPLE_CSV_CONTENT);
  const [currentFilename, setCurrentFilename] = useState<string>('sample_sales_orders_q1_q4.csv');
  const [isSampleActive, setIsSampleActive] = useState<boolean>(true);
  const [isDirtySampleActive, setIsDirtySampleActive] = useState<boolean>(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [isRawDataOpen, setIsRawDataOpen] = useState<boolean>(false);
  const [isHygieneModalOpen, setIsHygieneModalOpen] = useState<boolean>(false);
  const [isHygieneActive, setIsHygieneActive] = useState<boolean>(true);

  // Criterion for top changed region: absolute dollar or percentage
  const [criterion, setCriterion] = useState<'absolute_dollar' | 'percentage'>('absolute_dollar');

  // Currently inspected region for deep-dive
  const [inspectedRegionName, setInspectedRegionName] = useState<string | null>(null);

  // AI Summary State
  const [aiSummary, setAiSummary] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiSource, setAiSource] = useState<string>('gemini-3.8-flash');

  // Parse CSV (generates both cleaned orders and rawOrders along with the hygiene report)
  const parseResult = useMemo(() => {
    return parseSalesCsv(csvRawText);
  }, [csvRawText]);

  // Compute Analytics based on whether Data Hygiene cleaning is enabled
  const activeOrders = useMemo(() => {
    return isHygieneActive ? parseResult.orders : parseResult.rawOrders;
  }, [isHygieneActive, parseResult.orders, parseResult.rawOrders]);

  const analytics: AnalyticsResult = useMemo(() => {
    return calculateAnalytics(activeOrders, parseResult.rawOrders, parseResult.hygieneReport);
  }, [activeOrders, parseResult.rawOrders, parseResult.hygieneReport]);

  // Selected top region deep dive based on criterion
  const topDeepDive: RegionDeepDive = useMemo(() => {
    if (criterion === 'percentage' && analytics.topChangedRegionByPercent) {
      return analytics.topChangedRegionByPercent;
    }
    return analytics.topChangedRegionByDollar;
  }, [analytics, criterion]);

  // Active deep dive for drill-down section (either top or user-clicked region)
  const activeDeepDive: RegionDeepDive = useMemo(() => {
    if (!inspectedRegionName) return topDeepDive;
    const foundSummary = analytics.regionSummaries.find((r) => r.region === inspectedRegionName);
    if (!foundSummary) return topDeepDive;

    // Build deep dive for this inspected region
    const regionOrders = analytics.orders.filter((o) => o.region === inspectedRegionName);
    const productNames = Array.from(new Set(regionOrders.map((o) => o.product)));
    const topProducts = productNames
      .map((product) => {
        const q2Rev = regionOrders
          .filter((o) => o.product === product && o.quarter === 'Q2')
          .reduce((sum, o) => sum + o.revenue, 0);
        const q3Rev = regionOrders
          .filter((o) => o.product === product && o.quarter === 'Q3')
          .reduce((sum, o) => sum + o.revenue, 0);
        const q2Units = regionOrders
          .filter((o) => o.product === product && o.quarter === 'Q2')
          .reduce((sum, o) => sum + o.units, 0);
        const q3Units = regionOrders
          .filter((o) => o.product === product && o.quarter === 'Q3')
          .reduce((sum, o) => sum + o.units, 0);

        const change = q3Rev - q2Rev;
        const pctChange = q2Rev > 0 ? (change / q2Rev) * 100 : q3Rev > 0 ? 100 : 0;
        return {
          product,
          q2Rev,
          q3Rev,
          change,
          pctChange,
          q2Units,
          q3Units,
          unitsChange: q3Units - q2Units,
        };
      })
      .sort((a, b) => Math.abs(b.change) - Math.abs(a.change));

    const channelNames = Array.from(new Set(regionOrders.map((o) => o.channel)));
    const topChannels = channelNames
      .map((channel) => {
        const q2Rev = regionOrders
          .filter((o) => o.channel === channel && o.quarter === 'Q2')
          .reduce((sum, o) => sum + o.revenue, 0);
        const q3Rev = regionOrders
          .filter((o) => o.channel === channel && o.quarter === 'Q3')
          .reduce((sum, o) => sum + o.revenue, 0);
        const q2Units = regionOrders
          .filter((o) => o.channel === channel && o.quarter === 'Q2')
          .reduce((sum, o) => sum + o.units, 0);
        const q3Units = regionOrders
          .filter((o) => o.channel === channel && o.quarter === 'Q3')
          .reduce((sum, o) => sum + o.units, 0);

        const change = q3Rev - q2Rev;
        const pctChange = q2Rev > 0 ? (change / q2Rev) * 100 : q3Rev > 0 ? 100 : 0;
        return {
          channel,
          q2Rev,
          q3Rev,
          change,
          pctChange,
          q2Units,
          q3Units,
        };
      })
      .sort((a, b) => Math.abs(b.change) - Math.abs(a.change));

    const unitsChange = foundSummary.q3Units - foundSummary.q2Units;
    const unitsPercentChange =
      foundSummary.q2Units > 0
        ? (unitsChange / foundSummary.q2Units) * 100
        : foundSummary.q3Units > 0
          ? 100
          : 0;

    return {
      region: foundSummary.region,
      q2Revenue: foundSummary.q2Rev,
      q3Revenue: foundSummary.q3Rev,
      revenueChange: foundSummary.q2ToQ3Diff,
      percentChange: foundSummary.q2ToQ3PctDiff,
      q2Units: foundSummary.q2Units,
      q3Units: foundSummary.q3Units,
      unitsChange,
      unitsPercentChange,
      q2AvgDiscount: foundSummary.q2AvgDiscount,
      q3AvgDiscount: foundSummary.q3AvgDiscount,
      discountDiffPctPoints: foundSummary.discountDiffPctPoints,
      topProducts,
      topChannels,
    };
  }, [inspectedRegionName, topDeepDive, analytics]);

  // Request AI Summary from server endpoint
  const fetchAiSummary = async (deepDiveToAnalyze: RegionDeepDive) => {
    if (!analytics.hasQ2AndQ3 || !deepDiveToAnalyze || deepDiveToAnalyze.region === 'None') {
      setAiSummary('CSV data must contain both Q2 and Q3 records to calculate quarterly changes.');
      return;
    }

    setIsAiLoading(true);
    setAiError(null);

    try {
      const payload = {
        topRegion: deepDiveToAnalyze.region,
        criterion,
        metrics: deepDiveToAnalyze,
        allRegionsSummary: analytics.regionSummaries.map((r) => ({
          region: r.region,
          q2Revenue: r.q2Rev,
          q3Revenue: r.q3Rev,
          revenueChange: r.q2ToQ3Diff,
          percentChange: r.q2ToQ3PctDiff,
        })),
      };

      const res = await fetch('/api/analyze-shift', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }

      const data = await res.json();
      setAiSummary(data.summary || '');
      setAiSource(data.source || 'gemini-3.8-flash');
    } catch (err: any) {
      console.error('Failed to fetch AI summary:', err);
      setAiError(err.message || 'Error generating AI summary');
    } finally {
      setIsAiLoading(false);
    }
  };

  // Trigger AI summary whenever topDeepDive changes
  useEffect(() => {
    if (topDeepDive && topDeepDive.region !== 'None' && analytics.hasQ2AndQ3) {
      fetchAiSummary(topDeepDive);
    }
  }, [topDeepDive.region, criterion, analytics.hasQ2AndQ3, isHygieneActive]);

  // Handle dataset replacement
  const handleDataParsed = (csvText: string, filename?: string) => {
    setCsvRawText(csvText);
    setCurrentFilename(filename || 'uploaded_orders.csv');
    setIsSampleActive(false);
    setIsDirtySampleActive(false);
    setInspectedRegionName(null);
  };

  const handleLoadSample = () => {
    setCsvRawText(SAMPLE_CSV_CONTENT);
    setCurrentFilename('sample_sales_orders_q1_q4.csv');
    setIsSampleActive(true);
    setIsDirtySampleActive(false);
    setInspectedRegionName(null);
  };

  const handleLoadDirtySample = () => {
    setCsvRawText(SAMPLE_DIRTY_CSV_CONTENT);
    setCurrentFilename('messy_sample_west_casing.csv');
    setIsSampleActive(false);
    setIsDirtySampleActive(true);
    setInspectedRegionName(null);
  };

  const handleDownloadTemplate = () => {
    const templateContent = `quarter,region,channel,product,units,discount_pct,revenue
Q1,North America,Direct Enterprise,Enterprise Cloud Suite,120,0.10,360000
Q1,Europe,Online Store,Developer Pro Tools,310,0.05,93000
Q2,North America,Direct Enterprise,Enterprise Cloud Suite,145,0.10,435000
Q2,Europe,Online Store,Developer Pro Tools,340,0.05,102000
Q3,North America,Direct Enterprise,Enterprise Cloud Suite,160,0.10,480000
Q3,Europe,Online Store,Developer Pro Tools,420,0.05,126000
Q4,North America,Direct Enterprise,Enterprise Cloud Suite,185,0.10,555000
Q4,Europe,Online Store,Developer Pro Tools,460,0.05,138000`;

    const blob = new Blob([templateContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'sales_orders_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100/90 via-purple-100/80 to-fuchsia-100/90 text-slate-900 flex flex-col font-sans selection:bg-pink-500 selection:text-white relative">
      {/* Pink and purple ambient atmospheric background glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10" aria-hidden="true">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-pink-300/35 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-32 w-[28rem] h-[28rem] bg-purple-300/35 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 left-1/4 w-96 h-96 bg-fuchsia-300/30 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <Header
        onLoadSample={handleLoadSample}
        onLoadDirtySample={handleLoadDirtySample}
        onDownloadTemplate={handleDownloadTemplate}
        onOpenUpload={() => setIsUploadModalOpen(true)}
        onOpenHygieneModal={() => setIsHygieneModalOpen(true)}
        rowCount={parseResult.orders.length}
        regionCount={analytics.regions.length}
        topRegionName={topDeepDive?.region}
        isSampleActive={isSampleActive}
        isDirtySampleActive={isDirtySampleActive}
        hygieneReport={parseResult.hygieneReport}
        isHygieneActive={isHygieneActive}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-5">
        {/* Data Hygiene Notification Banner */}
        {parseResult.hygieneReport.totalFixes > 0 && (
          <div
            className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs transition-all ${
              isHygieneActive
                ? 'bg-emerald-50/90 border-emerald-200 text-emerald-900'
                : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div
                className={`p-1.5 rounded-lg ${
                  isHygieneActive ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                }`}
              >
                {isHygieneActive ? (
                  <ShieldCheck className="w-4 h-4" />
                ) : (
                  <ShieldAlert className="w-4 h-4" />
                )}
              </div>
              <div>
                <p className="font-semibold text-slate-900 flex items-center gap-1.5 flex-wrap">
                  <span>
                    {isHygieneActive
                      ? 'Automated Data Hygiene Active'
                      : 'Data Hygiene Paused (Viewing Raw Inputs)'}
                  </span>
                  <span className="font-normal text-slate-600">
                    — Sanitized {parseResult.hygieneReport.totalFixes} inconsistent text entries (
                    {parseResult.hygieneReport.casingFixes} casing standardizations,{' '}
                    {parseResult.hygieneReport.whitespaceFixes} whitespace trims)
                  </span>
                </p>
                {parseResult.hygieneReport.consolidatedRegions.length > 0 && (
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Merged regional variations into canonical names:{' '}
                    {parseResult.hygieneReport.consolidatedRegions.map((cr) => (
                      <strong key={cr.unified} className="text-emerald-800 font-medium mr-2">
                        &ldquo;{cr.unified}&rdquo; (consolidated {cr.variants.join(', ')})
                      </strong>
                    ))}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setIsHygieneActive(!isHygieneActive)}
                className="px-2.5 py-1 rounded-md text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
              >
                {isHygieneActive ? 'Switch to Raw Uncleaned' : 'Enable Sanitization'}
              </button>

              <button
                onClick={() => setIsHygieneModalOpen(true)}
                className="px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-700 text-white hover:bg-emerald-800 transition-colors shadow-2xs"
              >
                View Audit Log
              </button>
            </div>
          </div>
        )}

        {/* Parsing errors banner */}
        {parseResult.errors.length > 0 && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-3 shadow-xs">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold">CSV Parsing Errors Encountered:</p>
              {parseResult.errors.map((e, idx) => (
                <p key={idx}>{e}</p>
              ))}
              <div className="pt-2">
                <button
                  onClick={handleLoadSample}
                  className="px-3 py-1 bg-rose-600 text-white rounded font-medium hover:bg-rose-700 transition-colors"
                >
                  Restore Sample Sales Orders CSV
                </button>
              </div>
            </div>
          </div>
        )}

        {!analytics.hasQ2AndQ3 && parseResult.orders.length > 0 && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-3 shadow-xs">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Notice: Missing Q2 or Q3 Quarters</p>
              <p className="mt-0.5">
                The uploaded dataset currently contains quarters:{' '}
                <strong className="font-mono">{analytics.quarters.join(', ') || 'None'}</strong>. Both Q2 and
                Q3 are required to compute the Q2→Q3 regional revenue shift.
              </p>
            </div>
          </div>
        )}

        {/* SECTION 1: AI Executive 3-Sentence Summary Card */}
        <section aria-label="AI Executive Shift Summary">
          <AiSummaryCard
            summary={aiSummary}
            isLoading={isAiLoading}
            onRegenerate={() => fetchAiSummary(topDeepDive)}
            deepDive={topDeepDive}
            analytics={analytics}
            selectedCriterion={criterion}
            onCriterionChange={setCriterion}
            error={aiError}
            source={aiSource}
          />
        </section>

        {/* SECTION 2: Chart & Quick Stats Overview */}
        <section aria-label="Revenue Chart Overview">
          <RevenueChart
            analytics={analytics}
            topRegionName={topDeepDive?.region}
          />
        </section>

        {/* SECTION 3: Regional Revenue Cross-Tabulation Matrix Table */}
        <section aria-label="Revenue Matrix Table">
          <RevenueTable
            analytics={analytics}
            topRegionName={topDeepDive?.region}
            selectedRegion={activeDeepDive?.region}
            onSelectRegion={(region) => setInspectedRegionName(region)}
          />
        </section>

        {/* SECTION 4: Regional Variance Driver Attribution Deep-Dive (Why it changed) */}
        {analytics.hasQ2AndQ3 && activeDeepDive && activeDeepDive.region !== 'None' && (
          <section aria-label="Variance Driver Deep Dive">
            <RegionalDeepDive
              deepDive={activeDeepDive}
              analytics={analytics}
              onSelectRegion={(reg) => setInspectedRegionName(reg)}
            />
          </section>
        )}

        {/* Quick Link bar for Raw CSV Data */}
        <div className="p-4 rounded-xl bg-white/90 backdrop-blur-xs border border-pink-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-600">
            <Database className="w-4 h-4 text-purple-600" />
            <span>
              Loaded dataset: <strong className="text-slate-900 font-medium">{currentFilename}</strong> ({parseResult.orders.length} order lines)
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsHygieneModalOpen(true)}
              className="text-emerald-700 hover:text-emerald-900 font-semibold hover:underline inline-flex items-center gap-1"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Hygiene Audit ({parseResult.hygieneReport.totalFixes} cleaned)</span>
            </button>
            <span className="text-slate-300">|</span>
            <button
              onClick={() => setIsRawDataOpen(true)}
              className="text-purple-600 hover:text-purple-800 font-medium hover:underline inline-flex items-center gap-1"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Browse All Records</span>
            </button>
            <span className="text-slate-300">|</span>
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="text-slate-600 hover:text-slate-900 font-medium hover:underline inline-flex items-center gap-1"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Different File</span>
            </button>
          </div>
        </div>
      </main>

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <CsvUploader
          onDataParsed={handleDataParsed}
          onClose={() => setIsUploadModalOpen(false)}
          currentFilename={currentFilename}
          isModal={true}
        />
      )}

      {/* Raw Data Preview Modal */}
      <RawDataDrawer
        orders={activeOrders}
        isOpen={isRawDataOpen}
        onClose={() => setIsRawDataOpen(false)}
      />

      {/* Data Hygiene Audit Modal */}
      <DataHygieneModal
        isOpen={isHygieneModalOpen}
        onClose={() => setIsHygieneModalOpen(false)}
        report={parseResult.hygieneReport}
        isHygieneActive={isHygieneActive}
        onToggleHygiene={setIsHygieneActive}
      />

      {/* Footer */}
      <footer className="border-t border-pink-200/80 bg-white/75 backdrop-blur-xs py-5 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© Regional Sales Orders Analyzer • Automated Data Sanitization Active</p>
          <div className="flex items-center gap-3 text-slate-400">
            <span>Columns: quarter, region, channel, product, units, discount_pct, revenue</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
