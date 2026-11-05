export interface SalesOrder {
  id?: string;
  quarter: string; // e.g. "Q1", "Q2", "Q3", "Q4"
  region: string;
  channel: string;
  product: string;
  units: number;
  discount_pct: number; // e.g. 15 for 15% or 0.15 normalized to percentage
  revenue: number;
  // Raw original values before sanitization
  rawQuarter?: string;
  rawRegion?: string;
  rawChannel?: string;
  rawProduct?: string;
}

export interface CleaningRecord {
  id: string;
  column: 'region' | 'channel' | 'product' | 'quarter';
  original: string;
  cleaned: string;
  count: number;
  reason: string;
}

export interface DataHygieneReport {
  totalFixes: number;
  casingFixes: number;
  whitespaceFixes: number;
  aliasFixes: number;
  quarterFixes: number;
  records: CleaningRecord[];
  consolidatedRegions: Array<{ unified: string; variants: string[] }>;
}

export interface RegionSummary {
  region: string;
  q1Rev: number;
  q2Rev: number;
  q3Rev: number;
  q4Rev: number;
  totalRev: number;
  q1Units: number;
  q2Units: number;
  q3Units: number;
  q4Units: number;
  totalUnits: number;
  q2ToQ3Diff: number; // Q3 - Q2
  q2ToQ3PctDiff: number; // (Q3 - Q2) / Q2 * 100
  q2AvgDiscount: number;
  q3AvgDiscount: number;
  discountDiffPctPoints: number;
}

export interface ProductShift {
  product: string;
  q2Rev: number;
  q3Rev: number;
  change: number;
  pctChange: number;
  q2Units: number;
  q3Units: number;
  unitsChange: number;
}

export interface ChannelShift {
  channel: string;
  q2Rev: number;
  q3Rev: number;
  change: number;
  pctChange: number;
  q2Units: number;
  q3Units: number;
}

export interface RegionDeepDive {
  region: string;
  q2Revenue: number;
  q3Revenue: number;
  revenueChange: number;
  percentChange: number;
  q2Units: number;
  q3Units: number;
  unitsChange: number;
  unitsPercentChange: number;
  q2AvgDiscount: number;
  q3AvgDiscount: number;
  discountDiffPctPoints: number;
  topProducts: ProductShift[];
  topChannels: ChannelShift[];
}

export interface AnalyticsResult {
  orders: SalesOrder[];
  rawOrders: SalesOrder[];
  quarters: string[];
  regions: string[];
  regionSummaries: RegionSummary[];
  grandTotal: {
    q1Rev: number;
    q2Rev: number;
    q3Rev: number;
    q4Rev: number;
    totalRev: number;
    q2ToQ3Diff: number;
    q2ToQ3PctDiff: number;
  };
  topChangedRegionByDollar: RegionDeepDive;
  topChangedRegionByPercent?: RegionDeepDive;
  hasQ2AndQ3: boolean;
  hygieneReport: DataHygieneReport;
}
