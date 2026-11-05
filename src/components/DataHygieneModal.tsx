import React from 'react';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  FileCheck2,
  Filter,
  ShieldCheck,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  X,
} from 'lucide-react';
import { DataHygieneReport } from '../types';

interface DataHygieneModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: DataHygieneReport;
  isHygieneActive: boolean;
  onToggleHygiene: (active: boolean) => void;
}

export const DataHygieneModal: React.FC<DataHygieneModalProps> = ({
  isOpen,
  onClose,
  report,
  isHygieneActive,
  onToggleHygiene,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  Data Hygiene &amp; Human-Error Sanitization
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                  {report.totalFixes} Inconsistencies Sanitized
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Automatically resolves human data entry errors (such as &ldquo;West&rdquo; vs &ldquo;west&rdquo;, whitespace, and casing) to ensure accurate rollups.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Toggle Clean vs Raw */}
            <div className="flex items-center gap-2 bg-white px-2.5 py-1 rounded-lg border border-slate-200 text-xs">
              <span className="text-slate-600 font-medium">Cleaning Engine:</span>
              <button
                onClick={() => onToggleHygiene(!isHygieneActive)}
                className={`font-semibold flex items-center gap-1 ${
                  isHygieneActive ? 'text-emerald-700' : 'text-slate-400'
                }`}
              >
                {isHygieneActive ? (
                  <>
                    <span>ON</span>
                    <ToggleRight className="w-5 h-5 text-emerald-600" />
                  </>
                ) : (
                  <>
                    <span>OFF</span>
                    <ToggleLeft className="w-5 h-5 text-slate-400" />
                  </>
                )}
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Hygiene Stats Cards */}
        <div className="p-5 border-b border-slate-100 bg-white grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-[11px] text-slate-500 font-medium block">Casing Standardized</span>
            <span className="text-lg font-bold text-slate-900 font-mono">{report.casingFixes}</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">e.g. &ldquo;west&rdquo; → &ldquo;West&rdquo;</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-[11px] text-slate-500 font-medium block">Whitespace Trimmed</span>
            <span className="text-lg font-bold text-slate-900 font-mono">{report.whitespaceFixes}</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Leading, trailing &amp; double spaces</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-[11px] text-slate-500 font-medium block">Quarter Harmonized</span>
            <span className="text-lg font-bold text-slate-900 font-mono">{report.quarterFixes}</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">e.g. &ldquo;q2&rdquo; → &ldquo;Q2&rdquo;</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-[11px] text-slate-500 font-medium block">Regions Consolidated</span>
            <span className="text-lg font-bold text-indigo-600 font-mono">
              {report.consolidatedRegions.length}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Multi-variant regions merged</span>
          </div>
        </div>

        {/* Consolidated Multi-Variant Regions (e.g. West vs west) */}
        {report.consolidatedRegions.length > 0 && (
          <div className="p-5 border-b border-slate-100 bg-emerald-50/40">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Consolidated Regional Case &amp; Space Variants
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {report.consolidatedRegions.map((reg) => (
                <div
                  key={reg.unified}
                  className="p-2.5 bg-white rounded-lg border border-emerald-200/80 shadow-2xs text-xs flex flex-col gap-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-sm">{reg.unified}</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-medium">
                      Canonical Target
                    </span>
                  </div>
                  <div className="text-slate-500 text-[11px] flex items-center gap-1 flex-wrap">
                    <span>Merged variants:</span>
                    {reg.variants.map((v) => (
                      <span
                        key={v}
                        className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-700 text-[10px] border border-slate-200"
                      >
                        &ldquo;{v}&rdquo;
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Detailed Fixes Audit Table */}
        <div className="flex-1 overflow-auto p-5">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Data Cleaning Transformation Log ({report.records.length} distinct rules applied)
            </h4>
            <span className="text-xs text-slate-400">All text columns protected</span>
          </div>

          {report.records.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              No human errors or casing discrepancies detected in the loaded dataset.
            </div>
          ) : (
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <tr>
                    <th className="py-2.5 px-3">Column</th>
                    <th className="py-2.5 px-3">Original Raw Input</th>
                    <th className="py-2.5 px-3">Sanitized Target</th>
                    <th className="py-2.5 px-3">Reason / Transformation</th>
                    <th className="py-2.5 px-3 text-right">Occurrences</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-sans">
                  {report.records.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/70">
                      <td className="py-2 px-3 font-semibold text-indigo-700 font-mono capitalize">
                        {r.column}
                      </td>
                      <td className="py-2 px-3 text-rose-700 font-mono bg-rose-50/40">
                        &ldquo;{r.original}&rdquo;
                      </td>
                      <td className="py-2 px-3 text-emerald-700 font-mono font-medium bg-emerald-50/40">
                        &ldquo;{r.cleaned}&rdquo;
                      </td>
                      <td className="py-2 px-3 text-slate-600">{r.reason}</td>
                      <td className="py-2 px-3 text-right font-mono font-semibold text-slate-900">
                        {r.count}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-600">
          <span>
            {isHygieneActive ? (
              <strong className="text-emerald-700">✓ Data sanitization applied to calculations, charts, tables, and AI summary.</strong>
            ) : (
              <strong className="text-amber-700">⚠ Data sanitization disabled (showing raw uncleaned entries).</strong>
            )}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors text-xs font-medium"
          >
            Close Audit
          </button>
        </div>
      </div>
    </div>
  );
};
