import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, FileSpreadsheet, Search, SlidersHorizontal, X } from 'lucide-react';
import { SalesOrder } from '../types';

interface RawDataDrawerProps {
  orders: SalesOrder[];
  isOpen: boolean;
  onClose: () => void;
}

export const RawDataDrawer: React.FC<RawDataDrawerProps> = ({ orders, isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedQuarter, setSelectedQuarter] = useState<string>('ALL');
  const [selectedRegion, setSelectedRegion] = useState<string>('ALL');
  const [page, setPage] = useState(1);
  const pageSize = 15;

  if (!isOpen) return null;

  const quarters = Array.from(new Set(orders.map((o) => o.quarter))).sort();
  const regions = Array.from(new Set(orders.map((o) => o.region))).sort();

  const filteredOrders = orders.filter((o) => {
    if (selectedQuarter !== 'ALL' && o.quarter !== selectedQuarter) return false;
    if (selectedRegion !== 'ALL' && o.region !== selectedRegion) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        o.product.toLowerCase().includes(term) ||
        o.channel.toLowerCase().includes(term) ||
        o.region.toLowerCase().includes(term)
      );
    }
    return true;
  });

  const totalPages = Math.ceil(filteredOrders.length / pageSize) || 1;
  const paginated = filteredOrders.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Sales Order Records Preview ({orders.length} Rows)
              </h3>
              <p className="text-xs text-slate-500">
                Raw parsed CSV records with quarter, region, channel, product, units, discount_pct, and revenue.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-white">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search product, channel, region..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 w-64"
              />
            </div>

            <select
              value={selectedQuarter}
              onChange={(e) => {
                setSelectedQuarter(e.target.value);
                setPage(1);
              }}
              className="text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700"
            >
              <option value="ALL">All Quarters</option>
              {quarters.map((q) => (
                <option key={q} value={q}>
                  {q}
                </option>
              ))}
            </select>

            <select
              value={selectedRegion}
              onChange={(e) => {
                setSelectedRegion(e.target.value);
                setPage(1);
              }}
              className="text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700"
            >
              <option value="ALL">All Regions</option>
              {regions.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div className="text-xs text-slate-500">
            Showing <strong className="text-slate-800">{filteredOrders.length}</strong> matching rows
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold z-10">
              <tr>
                <th className="py-2.5 px-3">#</th>
                <th className="py-2.5 px-3">Quarter</th>
                <th className="py-2.5 px-3">Region</th>
                <th className="py-2.5 px-3">Channel</th>
                <th className="py-2.5 px-3">Product</th>
                <th className="py-2.5 px-3 text-right">Units</th>
                <th className="py-2.5 px-3 text-right">Discount %</th>
                <th className="py-2.5 px-3 text-right">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {paginated.map((o, idx) => (
                <tr key={o.id || idx} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 text-slate-400 font-mono text-[11px]">
                    {(page - 1) * pageSize + idx + 1}
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-indigo-600 font-mono">{o.quarter}</td>
                  <td className="py-2.5 px-3 font-medium text-slate-900">{o.region}</td>
                  <td className="py-2.5 px-3 text-slate-600">{o.channel}</td>
                  <td className="py-2.5 px-3 text-slate-800 font-medium">{o.product}</td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-700">
                    {o.units.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-700">
                    {o.discount_pct.toFixed(1)}%
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-semibold text-emerald-700">
                    ${Math.round(o.revenue).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination */}
        <div className="p-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-600">
          <span>
            Page {page} of {totalPages}
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-1 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
