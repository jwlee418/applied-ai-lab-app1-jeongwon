import React, { useMemo, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Download,
  Flame,
  Search,
  Table as TableIcon,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { AnalyticsResult, RegionSummary } from '../types';

interface RevenueTableProps {
  analytics: AnalyticsResult;
  topRegionName?: string;
  selectedRegion?: string;
  onSelectRegion?: (region: string) => void;
}

type SortField = 'region' | 'q1Rev' | 'q2Rev' | 'q3Rev' | 'q4Rev' | 'totalRev' | 'q2ToQ3Diff' | 'q2ToQ3PctDiff';
type SortDirection = 'asc' | 'desc';

export const RevenueTable: React.FC<RevenueTableProps> = ({
  analytics,
  topRegionName,
  selectedRegion,
  onSelectRegion,
}) => {
  const [sortField, setSortField] = useState<SortField>('totalRev');
  const [sortDir, setSortDir] = useState<SortDirection>('desc');
  const [searchQuery, setSearchQuery] = useState('');

  const { regionSummaries, grandTotal } = analytics;

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const filteredAndSortedRows = useMemo(() => {
    return regionSummaries
      .filter((row) => row.region.toLowerCase().includes(searchQuery.toLowerCase().trim()))
      .sort((a, b) => {
        let valA: any = a[sortField];
        let valB: any = b[sortField];

        if (typeof valA === 'string') {
          return sortDir === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }

        return sortDir === 'asc' ? valA - valB : valB - valA;
      });
  }, [regionSummaries, sortField, sortDir, searchQuery]);

  const formatCurrency = (val: number) => `$${Math.round(val).toLocaleString()}`;
  const formatPct = (val: number) => `${val >= 0 ? '+' : ''}${val.toFixed(1)}%`;

  const downloadTableCsv = () => {
    const headers = ['Region', 'Q1 Revenue', 'Q2 Revenue', 'Q3 Revenue', 'Q4 Revenue', 'Total Revenue', 'Q2 to Q3 Change ($)', 'Q2 to Q3 Change (%)'];
    const rows = regionSummaries.map((r) => [
      `"${r.region}"`,
      r.q1Rev,
      r.q2Rev,
      r.q3Rev,
      r.q4Rev,
      r.totalRev,
      r.q2ToQ3Diff,
      `${r.q2ToQ3PctDiff.toFixed(2)}%`,
    ]);
    // Add Grand Total
    rows.push([
      '"Grand Total"',
      grandTotal.q1Rev,
      grandTotal.q2Rev,
      grandTotal.q3Rev,
      grandTotal.q4Rev,
      grandTotal.totalRev,
      grandTotal.q2ToQ3Diff,
      `${grandTotal.q2ToQ3PctDiff.toFixed(2)}%`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'regional_quarterly_revenue_matrix.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderSortIndicator = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500 ml-1 inline" />;
    }
    return sortDir === 'asc' ? (
      <ArrowUp className="w-3.5 h-3.5 text-indigo-600 ml-1 inline" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-indigo-600 ml-1 inline" />
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header & Search */}
      <div className="p-6 pb-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
              <TableIcon className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Regional Revenue Matrix by Quarter</h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Cross-tabulated quarterly sales totals with calculated Q2→Q3 dollar and percentage variances.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search region..."
              className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-44"
            />
          </div>

          <button
            onClick={downloadTableCsv}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors shadow-2xs"
            title="Download table data as CSV"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
              <th
                onClick={() => handleSort('region')}
                className="py-3 px-4 cursor-pointer hover:bg-slate-100/80 transition-colors group select-none"
              >
                Region {renderSortIndicator('region')}
              </th>
              <th
                onClick={() => handleSort('q1Rev')}
                className="py-3 px-4 text-right cursor-pointer hover:bg-slate-100/80 transition-colors group select-none"
              >
                Q1 Revenue {renderSortIndicator('q1Rev')}
              </th>
              <th
                onClick={() => handleSort('q2Rev')}
                className="py-3 px-4 text-right cursor-pointer hover:bg-slate-100/80 transition-colors group select-none"
              >
                Q2 Revenue {renderSortIndicator('q2Rev')}
              </th>
              <th
                onClick={() => handleSort('q3Rev')}
                className="py-3 px-4 text-right cursor-pointer hover:bg-slate-100/80 transition-colors group select-none"
              >
                Q3 Revenue {renderSortIndicator('q3Rev')}
              </th>
              <th
                onClick={() => handleSort('q4Rev')}
                className="py-3 px-4 text-right cursor-pointer hover:bg-slate-100/80 transition-colors group select-none"
              >
                Q4 Revenue {renderSortIndicator('q4Rev')}
              </th>
              <th
                onClick={() => handleSort('totalRev')}
                className="py-3 px-4 text-right cursor-pointer hover:bg-slate-100/80 transition-colors group select-none bg-indigo-50/40 text-indigo-900"
              >
                Total Revenue {renderSortIndicator('totalRev')}
              </th>
              <th
                onClick={() => handleSort('q2ToQ3Diff')}
                className="py-3 px-4 text-right cursor-pointer hover:bg-slate-100/80 transition-colors group select-none"
              >
                Q2→Q3 Shift ($) {renderSortIndicator('q2ToQ3Diff')}
              </th>
              <th
                onClick={() => handleSort('q2ToQ3PctDiff')}
                className="py-3 px-4 text-right cursor-pointer hover:bg-slate-100/80 transition-colors group select-none"
              >
                Q2→Q3 Shift (%) {renderSortIndicator('q2ToQ3PctDiff')}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredAndSortedRows.map((row) => {
              const isTop = row.region === topRegionName;
              const isSelected = row.region === selectedRegion;

              return (
                <tr
                  key={row.region}
                  onClick={() => onSelectRegion && onSelectRegion(row.region)}
                  className={`transition-colors cursor-pointer ${
                    isTop
                      ? 'bg-indigo-50/40 hover:bg-indigo-50/70 font-medium'
                      : isSelected
                        ? 'bg-slate-50 hover:bg-slate-100/80'
                        : 'hover:bg-slate-50/60'
                  }`}
                >
                  <td className="py-3 px-4 text-slate-900 font-semibold flex items-center gap-2">
                    {row.region}
                    {isTop && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-600 text-white shadow-2xs">
                        <Flame className="w-2.5 h-2.5 text-amber-300" />
                        Top Mover
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right text-slate-600 font-mono">
                    {formatCurrency(row.q1Rev)}
                  </td>
                  <td className="py-3 px-4 text-right text-slate-700 font-mono font-medium">
                    {formatCurrency(row.q2Rev)}
                  </td>
                  <td className="py-3 px-4 text-right text-slate-900 font-mono font-semibold">
                    {formatCurrency(row.q3Rev)}
                  </td>
                  <td className="py-3 px-4 text-right text-slate-600 font-mono">
                    {formatCurrency(row.q4Rev)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 bg-indigo-50/20">
                    {formatCurrency(row.totalRev)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-medium">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md ${
                        row.q2ToQ3Diff >= 0
                          ? 'text-emerald-700 bg-emerald-50'
                          : 'text-rose-700 bg-rose-50'
                      }`}
                    >
                      {row.q2ToQ3Diff >= 0 ? (
                        <TrendingUp className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <TrendingDown className="w-3 h-3 text-rose-600" />
                      )}
                      {row.q2ToQ3Diff >= 0 ? '+' : ''}
                      {formatCurrency(row.q2ToQ3Diff)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-medium">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-md font-semibold ${
                        row.q2ToQ3PctDiff >= 0
                          ? 'text-emerald-700 bg-emerald-50/60'
                          : 'text-rose-700 bg-rose-50/60'
                      }`}
                    >
                      {formatPct(row.q2ToQ3PctDiff)}
                    </span>
                  </td>
                </tr>
              );
            })}

            {/* Grand Total Footer Row */}
            <tr className="bg-slate-100/90 font-bold text-slate-900 border-t-2 border-slate-300">
              <td className="py-3.5 px-4 uppercase tracking-wider text-[11px] text-slate-700">
                Grand Total ({regionSummaries.length} Regions)
              </td>
              <td className="py-3.5 px-4 text-right font-mono">{formatCurrency(grandTotal.q1Rev)}</td>
              <td className="py-3.5 px-4 text-right font-mono">{formatCurrency(grandTotal.q2Rev)}</td>
              <td className="py-3.5 px-4 text-right font-mono">{formatCurrency(grandTotal.q3Rev)}</td>
              <td className="py-3.5 px-4 text-right font-mono">{formatCurrency(grandTotal.q4Rev)}</td>
              <td className="py-3.5 px-4 text-right font-mono text-indigo-700 bg-indigo-100/50">
                {formatCurrency(grandTotal.totalRev)}
              </td>
              <td className="py-3.5 px-4 text-right font-mono">
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md ${
                    grandTotal.q2ToQ3Diff >= 0
                      ? 'text-emerald-800 bg-emerald-100/80'
                      : 'text-rose-800 bg-rose-100/80'
                  }`}
                >
                  {grandTotal.q2ToQ3Diff >= 0 ? '+' : ''}
                  {formatCurrency(grandTotal.q2ToQ3Diff)}
                </span>
              </td>
              <td className="py-3.5 px-4 text-right font-mono">
                <span
                  className={`inline-block px-2 py-0.5 rounded-md ${
                    grandTotal.q2ToQ3PctDiff >= 0
                      ? 'text-emerald-800 bg-emerald-100/80'
                      : 'text-rose-800 bg-rose-100/80'
                  }`}
                >
                  {formatPct(grandTotal.q2ToQ3PctDiff)}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="p-3.5 bg-slate-50/60 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
        <span>Click any column header to sort • Click any row to inspect regional driver breakdown</span>
        <span>Showing {filteredAndSortedRows.length} of {regionSummaries.length} regions</span>
      </div>
    </div>
  );
};
