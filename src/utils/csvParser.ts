import Papa from 'papaparse';
import { DataHygieneReport, SalesOrder } from '../types';
import { sanitizeSalesOrders } from './dataSanitizer';

export interface ParseResult {
  orders: SalesOrder[];
  rawOrders: SalesOrder[];
  errors: string[];
  warnings: string[];
  rowCount: number;
  hygieneReport: DataHygieneReport;
}

function normalizeHeader(h: string): string {
  return h.trim().toLowerCase().replace(/[\s_-]+/g, '');
}

function parseNumeric(val: any): number {
  if (val === undefined || val === null) return 0;
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  const str = String(val).trim().replace(/[$,]/g, '');
  if (str.endsWith('%')) {
    const num = parseFloat(str.replace('%', ''));
    return isNaN(num) ? 0 : num / 100;
  }
  const num = parseFloat(str);
  return isNaN(num) ? 0 : num;
}

function parseDiscountPct(val: any): number {
  if (val === undefined || val === null) return 0;
  const num = parseNumeric(val);
  // If user passed 15 for 15%, or 0.15 for 15%:
  // Standardize so if it's > 1, it's already a percent (e.g. 15 -> 15%)
  // If it's <= 1 and > 0, it was a fraction e.g. 0.15 -> 15%
  if (num > 0 && num <= 1) {
    return num * 100;
  }
  return num;
}

const emptyHygieneReport: DataHygieneReport = {
  totalFixes: 0,
  casingFixes: 0,
  whitespaceFixes: 0,
  aliasFixes: 0,
  quarterFixes: 0,
  records: [],
  consolidatedRegions: [],
};

export function parseSalesCsv(csvText: string): ParseResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const rawOrders: SalesOrder[] = [];

  const parsed = Papa.parse(csvText, {
    header: true,
    skipEmptyLines: 'greedy',
    dynamicTyping: false,
  });

  if (parsed.errors && parsed.errors.length > 0) {
    parsed.errors.forEach((err) => {
      warnings.push(`Row ${err.row ?? '?'}: ${err.message}`);
    });
  }

  const rawData = parsed.data as Record<string, any>[];
  if (!rawData || rawData.length === 0) {
    return {
      orders: [],
      rawOrders: [],
      errors: ['CSV file is empty or could not be parsed.'],
      warnings,
      rowCount: 0,
      hygieneReport: emptyHygieneReport,
    };
  }

  // Map header keys flexibly
  const firstRow = rawData[0];
  const headerKeys = Object.keys(firstRow);
  const normalizedKeyMap: Record<string, string> = {};
  headerKeys.forEach((key) => {
    normalizedKeyMap[normalizeHeader(key)] = key;
  });

  // Find corresponding keys
  const quarterKey = normalizedKeyMap['quarter'] || normalizedKeyMap['qtr'] || normalizedKeyMap['period'];
  const regionKey = normalizedKeyMap['region'] || normalizedKeyMap['territory'] || normalizedKeyMap['geo'] || normalizedKeyMap['area'];
  const channelKey = normalizedKeyMap['channel'] || normalizedKeyMap['saleschannel'] || normalizedKeyMap['route'];
  const productKey = normalizedKeyMap['product'] || normalizedKeyMap['item'] || normalizedKeyMap['productname'] || normalizedKeyMap['sku'];
  const unitsKey = normalizedKeyMap['units'] || normalizedKeyMap['quantity'] || normalizedKeyMap['qty'] || normalizedKeyMap['volume'];
  const discountKey =
    normalizedKeyMap['discountpct'] ||
    normalizedKeyMap['discount'] ||
    normalizedKeyMap['discountrate'] ||
    normalizedKeyMap['discountpercent'] ||
    normalizedKeyMap['discountpercentage'];
  const revenueKey = normalizedKeyMap['revenue'] || normalizedKeyMap['sales'] || normalizedKeyMap['totalrevenue'] || normalizedKeyMap['amount'];

  // Check required columns
  const missingCols: string[] = [];
  if (!quarterKey) missingCols.push('quarter');
  if (!regionKey) missingCols.push('region');
  if (!channelKey) missingCols.push('channel');
  if (!productKey) missingCols.push('product');
  if (!unitsKey) missingCols.push('units');
  if (!discountKey) missingCols.push('discount_pct');
  if (!revenueKey) missingCols.push('revenue');

  if (missingCols.length > 0) {
    errors.push(
      `Missing required column(s): ${missingCols.join(', ')}. Please ensure the CSV has columns: quarter, region, channel, product, units, discount_pct, revenue.`
    );
    return {
      orders: [],
      rawOrders: [],
      errors,
      warnings,
      rowCount: rawData.length,
      hygieneReport: emptyHygieneReport,
    };
  }

  rawData.forEach((row, idx) => {
    const rawQuarter = String(row[quarterKey!] ?? '').trim();
    const rawRegion = String(row[regionKey!] ?? '').trim();
    const rawChannel = String(row[channelKey!] ?? '').trim();
    const rawProduct = String(row[productKey!] ?? '').trim();
    const rawUnits = row[unitsKey!];
    const rawDiscount = row[discountKey!];
    const rawRevenue = row[revenueKey!];

    if (!rawQuarter && !rawRegion && !rawRevenue) {
      return;
    }

    const units = Math.max(0, Math.round(parseNumeric(rawUnits)));
    const discount_pct = parseDiscountPct(rawDiscount);
    const revenue = parseNumeric(rawRevenue);

    rawOrders.push({
      id: `row-${idx + 1}`,
      quarter: rawQuarter || 'Unknown',
      region: rawRegion || 'Unspecified',
      channel: rawChannel || 'Unspecified',
      product: rawProduct || 'Unspecified',
      units,
      discount_pct,
      revenue,
      rawQuarter,
      rawRegion,
      rawChannel,
      rawProduct,
    });
  });

  // Apply automatic human error data sanitization (casing, whitespace, acronyms, aliases)
  const { cleanedOrders, hygieneReport } = sanitizeSalesOrders(rawOrders);

  return {
    orders: cleanedOrders,
    rawOrders,
    errors,
    warnings,
    rowCount: cleanedOrders.length,
    hygieneReport,
  };
}
