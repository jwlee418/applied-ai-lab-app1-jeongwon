import React from 'react';
import {
  BarChart3,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Upload,
  Wand2,
} from 'lucide-react';
import { DataHygieneReport } from '../types';

interface HeaderProps {
  onLoadSample: () => void;
  onLoadDirtySample: () => void;
  onDownloadTemplate: () => void;
  onOpenUpload: () => void;
  onOpenHygieneModal: () => void;
  rowCount: number;
  regionCount: number;
  topRegionName?: string;
  isSampleActive: boolean;
  isDirtySampleActive: boolean;
  hygieneReport: DataHygieneReport;
  isHygieneActive: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onLoadSample,
  onLoadDirtySample,
  onDownloadTemplate,
  onOpenUpload,
  onOpenHygieneModal,
  rowCount,
  regionCount,
  topRegionName,
  isSampleActive,
  isDirtySampleActive,
  hygieneReport,
  isHygieneActive,
}) => {
  return (
    <header className="border-b border-slate-200 bg-white/95 backdrop-blur sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-sky-500 flex items-center justify-center text-white shadow-md shadow-indigo-200 shrink-0">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold tracking-tight text-slate-900">
                  Regional Sales &amp; AI Shift Analyzer
                </h1>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                  <Sparkles className="w-3 h-3 mr-1 text-indigo-500" />
                  Gemini 3.8 Flash
                </span>

                {/* Hygiene Badge */}
                <button
                  onClick={onOpenHygieneModal}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold transition-all border shadow-2xs ${
                    hygieneReport.totalFixes > 0 && isHygieneActive
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100 cursor-pointer animate-in fade-in'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 cursor-pointer'
                  }`}
                  title="Click to view detailed data cleaning audit"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>
                    Data Hygiene: {hygieneReport.totalFixes > 0 ? `${hygieneReport.totalFixes} cleaned` : 'Active'}
                  </span>
                  {hygieneReport.consolidatedRegions.length > 0 && (
                    <span className="bg-emerald-200/80 text-emerald-900 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                      {hygieneReport.consolidatedRegions.map((r) => r.unified).join(', ')} merged
                    </span>
                  )}
                </button>
              </div>
              <p className="text-xs text-slate-500 font-normal">
                Analyze quarterly revenue by region, automatically clean text inconsistencies (e.g. West vs west), and generate grounded AI shift summaries.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onLoadDirtySample}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border shadow-xs ${
                isDirtySampleActive
                  ? 'bg-amber-100 text-amber-900 border-amber-300 ring-2 ring-amber-300/50'
                  : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
              }`}
              title="Load sample dataset with mixed case 'West' vs 'west', spacing, and channel typos to test cleaning"
            >
              <Wand2 className="w-3.5 h-3.5 text-amber-600" />
              <span>Test &ldquo;West / west&rdquo; CSV</span>
            </button>

            <button
              onClick={onLoadSample}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border shadow-xs ${
                isSampleActive
                  ? 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
              title="Load standard multi-region sample sales orders"
            >
              <RefreshCw className="w-3.5 h-3.5 text-indigo-500" />
              <span>Sample CSV</span>
            </button>

            <button
              onClick={onDownloadTemplate}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors shadow-xs"
              title="Download empty CSV template with all 7 columns"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Template</span>
            </button>

            <button
              onClick={onOpenUpload}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload CSV</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
