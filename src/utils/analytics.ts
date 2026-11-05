import { AnalyticsResult, DataHygieneReport, RegionDeepDive, RegionSummary, SalesOrder } from '../types';

export function calculateAnalytics(
  orders: SalesOrder[],
  rawOrders: SalesOrder[] = orders,
  hygieneReport: DataHygieneReport = {
    totalFixes: 0,
    casingFixes: 0,
    whitespaceFixes: 0,
    aliasFixes: 0,
    quarterFixes: 0,
    records: [],
    consolidatedRegions: [],
  }
): AnalyticsResult {
  const regionsSet = new Set<string>();
  const quartersSet = new Set<string>();

  orders.forEach((o) => {
    if (o.region) regionsSet.add(o.region);
    if (o.quarter) quartersSet.add(o.quarter);
  });

  // Sort quarters in canonical order Q1 -> Q2 -> Q3 -> Q4, then any others
  const standardQ = ['Q1', 'Q2', 'Q3', 'Q4'];
  const quarters = Array.from(quartersSet).sort((a, b) => {
    const idxA = standardQ.indexOf(a);
    const idxB = standardQ.indexOf(b);
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    if (idxA !== -1) return -1;
    if (idxB !== -1) return 1;
    return a.localeCompare(b);
  });

  const regions = Array.from(regionsSet).sort();

  // Region aggregation maps
  const regionSummaries: RegionSummary[] = regions.map((region) => {
    const regionOrders = orders.filter((o) => o.region === region);

    const getQRev = (q: string) =>
      regionOrders.filter((o) => o.quarter === q).reduce((acc, o) => acc + o.revenue, 0);

    const getQUnits = (q: string) =>
      regionOrders.filter((o) => o.quarter === q).reduce((acc, o) => acc + o.units, 0);

    const getQDiscountAvg = (q: string) => {
      const qOrders = regionOrders.filter((o) => o.quarter === q);
      const totalRev = qOrders.reduce((sum, o) => sum + o.revenue, 0);
      if (totalRev <= 0) {
        if (qOrders.length === 0) return 0;
        return qOrders.reduce((sum, o) => sum + o.discount_pct, 0) / qOrders.length;
      }
      // Revenue-weighted average discount
      return qOrders.reduce((sum, o) => sum + o.discount_pct * o.revenue, 0) / totalRev;
    };

    const q1Rev = getQRev('Q1');
    const q2Rev = getQRev('Q2');
    const q3Rev = getQRev('Q3');
    const q4Rev = getQRev('Q4');
    const totalRev = regionOrders.reduce((acc, o) => acc + o.revenue, 0);

    const q1Units = getQUnits('Q1');
    const q2Units = getQUnits('Q2');
    const q3Units = getQUnits('Q3');
    const q4Units = getQUnits('Q4');
    const totalUnits = regionOrders.reduce((acc, o) => acc + o.units, 0);

    const q2AvgDiscount = getQDiscountAvg('Q2');
    const q3AvgDiscount = getQDiscountAvg('Q3');
    const discountDiffPctPoints = q3AvgDiscount - q2AvgDiscount;

    const q2ToQ3Diff = q3Rev - q2Rev;
    const q2ToQ3PctDiff = q2Rev > 0 ? ((q3Rev - q2Rev) / q2Rev) * 100 : q3Rev > 0 ? 100 : 0;

    return {
      region,
      q1Rev,
      q2Rev,
      q3Rev,
      q4Rev,
      totalRev,
      q1Units,
      q2Units,
      q3Units,
      q4Units,
      totalUnits,
      q2ToQ3Diff,
      q2ToQ3PctDiff,
      q2AvgDiscount,
      q3AvgDiscount,
      discountDiffPctPoints,
    };
  });

  // Calculate Grand Totals across all regions
  const grandTotal = {
    q1Rev: regionSummaries.reduce((sum, r) => sum + r.q1Rev, 0),
    q2Rev: regionSummaries.reduce((sum, r) => sum + r.q2Rev, 0),
    q3Rev: regionSummaries.reduce((sum, r) => sum + r.q3Rev, 0),
    q4Rev: regionSummaries.reduce((sum, r) => sum + r.q4Rev, 0),
    totalRev: regionSummaries.reduce((sum, r) => sum + r.totalRev, 0),
    q2ToQ3Diff: 0,
    q2ToQ3PctDiff: 0,
  };
  grandTotal.q2ToQ3Diff = grandTotal.q3Rev - grandTotal.q2Rev;
  grandTotal.q2ToQ3PctDiff =
    grandTotal.q2Rev > 0 ? ((grandTotal.q3Rev - grandTotal.q2Rev) / grandTotal.q2Rev) * 100 : 0;

  // Has Q2 and Q3 data
  const hasQ2AndQ3 = quartersSet.has('Q2') && quartersSet.has('Q3');

  // Helper to build deep dive for any region
  function buildDeepDive(region: string): RegionDeepDive {
    const summary = regionSummaries.find((r) => r.region === region)!;
    const regionOrders = orders.filter((o) => o.region === region);

    // Group by product
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
      // sort by absolute dollar change descending
      .sort((a, b) => Math.abs(b.change) - Math.abs(a.change));

    // Group by channel
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

    const unitsChange = summary.q3Units - summary.q2Units;
    const unitsPercentChange =
      summary.q2Units > 0
        ? (unitsChange / summary.q2Units) * 100
        : summary.q3Units > 0
          ? 100
          : 0;

    return {
      region: summary.region,
      q2Revenue: summary.q2Rev,
      q3Revenue: summary.q3Rev,
      revenueChange: summary.q2ToQ3Diff,
      percentChange: summary.q2ToQ3PctDiff,
      q2Units: summary.q2Units,
      q3Units: summary.q3Units,
      unitsChange,
      unitsPercentChange,
      q2AvgDiscount: summary.q2AvgDiscount,
      q3AvgDiscount: summary.q3AvgDiscount,
      discountDiffPctPoints: summary.discountDiffPctPoints,
      topProducts,
      topChannels,
    };
  }

  // Find region that changed most by absolute dollar change: |Q3 - Q2|
  let topChangedRegionByDollar: RegionDeepDive;
  if (regionSummaries.length > 0) {
    const sortedByDollar = [...regionSummaries].sort(
      (a, b) => Math.abs(b.q2ToQ3Diff) - Math.abs(a.q2ToQ3Diff)
    );
    topChangedRegionByDollar = buildDeepDive(sortedByDollar[0].region);
  } else {
    topChangedRegionByDollar = {
      region: 'None',
      q2Revenue: 0,
      q3Revenue: 0,
      revenueChange: 0,
      percentChange: 0,
      q2Units: 0,
      q3Units: 0,
      unitsChange: 0,
      unitsPercentChange: 0,
      q2AvgDiscount: 0,
      q3AvgDiscount: 0,
      discountDiffPctPoints: 0,
      topProducts: [],
      topChannels: [],
    };
  }

  // Also determine region by percentage change
  let topChangedRegionByPercent: RegionDeepDive | undefined;
  if (regionSummaries.length > 0) {
    const sortedByPct = [...regionSummaries].sort(
      (a, b) => Math.abs(b.q2ToQ3PctDiff) - Math.abs(a.q2ToQ3PctDiff)
    );
    topChangedRegionByPercent = buildDeepDive(sortedByPct[0].region);
  }

  return {
    orders,
    rawOrders,
    quarters,
    regions,
    regionSummaries,
    grandTotal,
    topChangedRegionByDollar,
    topChangedRegionByPercent,
    hasQ2AndQ3,
    hygieneReport,
  };
}
