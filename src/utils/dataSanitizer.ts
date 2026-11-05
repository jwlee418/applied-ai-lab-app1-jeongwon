import { CleaningRecord, DataHygieneReport, SalesOrder } from '../types';

// Known acronyms that should be kept uppercase
const KNOWN_UPPERCASE_WORDS = new Set([
  'AI',
  'APAC',
  'EMEA',
  'LATAM',
  'NA',
  'EU',
  'USA',
  'US',
  'UK',
  'MENA',
  'ANZ',
  'B2B',
  'B2C',
  'SaaS',
  'API',
  'ERP',
  'CRM',
  'IT',
  'PRO',
  'PLUS',
  'HW',
  'SW',
]);

// Minor words that stay lowercase unless at the beginning of a title
const MINOR_WORDS = new Set(['and', 'or', 'of', 'for', 'in', 'on', 'at', 'to', 'a', 'an', 'the']);

/**
 * Standardize text string:
 * 1. Trim whitespace, tabs, and non-breaking spaces (\u00A0)
 * 2. Collapse internal multiple spaces
 * 3. Strip surrounding quotation marks or trailing punctuation
 */
export function sanitizeWhitespaceAndPunctuation(text: string): { cleaned: string; wasModified: boolean } {
  if (!text) return { cleaned: 'Unspecified', wasModified: false };

  // Replace non-breaking spaces and tabs with standard space
  let s = String(text).replace(/[\u00A0\t\r\n]+/g, ' ');

  // Strip enclosing quotes (single, double, smart quotes)
  s = s.replace(/^["'“”‘’]+|["'“”‘’]+$/g, '');

  // Collapse multiple spaces
  s = s.replace(/\s+/g, ' ').trim();

  // Strip trailing commas, semicolons, dashes, periods if accidentally included
  s = s.replace(/[,;.\-_]+$/g, '').trim();

  return { cleaned: s || 'Unspecified', wasModified: s !== text };
}

/**
 * Smart Title Case with acronym preservation
 * e.g. "west" -> "West", "ai analytics engine" -> "AI Analytics Engine"
 */
export function smartTitleCase(text: string): string {
  if (!text) return '';

  // Words separated by spaces, slashes, or hyphens
  const words = text.split(/(\s+)/);

  return words
    .map((word, idx) => {
      // Preserve whitespace delimiters
      if (/^\s+$/.test(word)) return word;

      const upper = word.toUpperCase();
      // If recognized acronym
      if (KNOWN_UPPERCASE_WORDS.has(upper)) {
        return upper === 'SAAS' ? 'SaaS' : upper;
      }

      // Check hyphenated words e.g. "Asia-Pacific"
      if (word.includes('-')) {
        return word
          .split('-')
          .map((part) => smartTitleCase(part))
          .join('-');
      }

      const lower = word.toLowerCase();
      // Minor words stay lowercase if not first word
      if (idx > 0 && MINOR_WORDS.has(lower)) {
        return lower;
      }

      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join('');
}

/**
 * Normalizes Region names:
 * Harmonizes casing, hyphens, and common aliases
 * e.g. "west" -> "West", "NORTH AMERICA" -> "North America", "N. America" -> "North America"
 */
export function cleanRegion(raw: string): { cleaned: string; reason?: string } {
  const { cleaned: prepped } = sanitizeWhitespaceAndPunctuation(raw);
  const normalizedKey = prepped.toLowerCase().replace(/[\s_\-./]+/g, '');

  // Alias dictionary for common geographical human variations
  const REGION_ALIAS_MAP: Record<string, string> = {
    // North America variants
    northamerica: 'North America',
    namerica: 'North America',
    na: 'North America',
    usa: 'North America',
    us: 'North America',

    // South America / Latin America
    southamerica: 'South America',
    samerica: 'South America',
    latinamerica: 'Latin America',
    latam: 'Latin America',

    // Europe / EMEA
    europe: 'Europe',
    eu: 'Europe',
    emea: 'EMEA',

    // Asia Pacific
    asiapacific: 'Asia Pacific',
    apac: 'Asia Pacific',
    asia: 'Asia Pacific',

    // Middle East
    middleeast: 'Middle East',
    mideast: 'Middle East',
    mena: 'Middle East',

    // US Regions
    west: 'West',
    western: 'West',
    east: 'East',
    eastern: 'East',
    south: 'South',
    southern: 'South',
    midwest: 'Midwest',
    central: 'Central',
  };

  if (REGION_ALIAS_MAP[normalizedKey]) {
    const canonical = REGION_ALIAS_MAP[normalizedKey];
    if (prepped !== canonical) {
      return { cleaned: canonical, reason: prepped.toLowerCase() === canonical.toLowerCase() ? 'Case Standardized' : 'Alias Normalized' };
    }
    return { cleaned: canonical };
  }

  // Handle standard title-casing
  // Normalize hyphenated "North-America" -> "North America"
  const dehyphenated = prepped.replace(/[-_]+/g, ' ');
  const titleCased = smartTitleCase(dehyphenated);

  if (titleCased !== raw) {
    return { cleaned: titleCased, reason: 'Case & Format Cleaned' };
  }

  return { cleaned: titleCased };
}

/**
 * Normalizes Sales Channels:
 * e.g. "direct" -> "Direct Enterprise", "ecommerce" / "online" -> "Online Store"
 */
export function cleanChannel(raw: string): { cleaned: string; reason?: string } {
  const { cleaned: prepped } = sanitizeWhitespaceAndPunctuation(raw);
  const normalizedKey = prepped.toLowerCase().replace(/[\s_\-./]+/g, '');

  const CHANNEL_ALIAS_MAP: Record<string, string> = {
    online: 'Online Store',
    onlinestore: 'Online Store',
    ecommerce: 'Online Store',
    ecom: 'Online Store',
    web: 'Online Store',
    website: 'Online Store',

    direct: 'Direct Enterprise',
    directenterprise: 'Direct Enterprise',
    enterprise: 'Direct Enterprise',
    field: 'Direct Enterprise',
    enterprisedirect: 'Direct Enterprise',

    partner: 'Partner Reseller',
    partnerreseller: 'Partner Reseller',
    reseller: 'Partner Reseller',
    channel: 'Partner Reseller',
    distributor: 'Partner Reseller',

    inside: 'Inside Sales',
    insidesales: 'Inside Sales',
    telesales: 'Inside Sales',
  };

  if (CHANNEL_ALIAS_MAP[normalizedKey]) {
    const canonical = CHANNEL_ALIAS_MAP[normalizedKey];
    if (prepped !== canonical) {
      return { cleaned: canonical, reason: prepped.toLowerCase() === canonical.toLowerCase() ? 'Case Standardized' : 'Channel Harmonized' };
    }
    return { cleaned: canonical };
  }

  const titleCased = smartTitleCase(prepped.replace(/[-_]+/g, ' '));
  if (titleCased !== raw) {
    return { cleaned: titleCased, reason: 'Case Standardized' };
  }
  return { cleaned: titleCased };
}

/**
 * Normalizes Products:
 * e.g. "ai analytics engine" -> "AI Analytics Engine", strips double spaces
 */
export function cleanProduct(raw: string): { cleaned: string; reason?: string } {
  const { cleaned: prepped } = sanitizeWhitespaceAndPunctuation(raw);
  const titleCased = smartTitleCase(prepped);

  if (titleCased !== raw) {
    return { cleaned: titleCased, reason: 'Case & Formatting Standardized' };
  }
  return { cleaned: titleCased };
}

/**
 * Normalizes Quarter identifiers:
 * Handles "q1", "Q1", "Quarter 1", "2024-Q1", "2024 Q2", "3Q", "Q-3"
 */
export function cleanQuarter(raw: any): { cleaned: string; reason?: string } {
  if (raw === undefined || raw === null) return { cleaned: 'Unknown' };
  const str = String(raw).trim();
  const upper = str.toUpperCase().replace(/\s+/g, ' ');

  // Check standard Q[1-4]
  const qMatch = upper.match(/Q\s*[-_]?\s*([1-4])/i) || upper.match(/([1-4])\s*Q/i) || upper.match(/QUARTER\s*[-_]?\s*([1-4])/i);

  if (qMatch) {
    const canonical = `Q${qMatch[1]}`;
    if (str !== canonical) {
      return { cleaned: canonical, reason: 'Quarter Format Standardized' };
    }
    return { cleaned: canonical };
  }

  return { cleaned: str || 'Unknown' };
}

/**
 * Comprehensive Data Hygiene Sanitization for Sales Orders
 */
export function sanitizeSalesOrders(orders: SalesOrder[]): {
  cleanedOrders: SalesOrder[];
  hygieneReport: DataHygieneReport;
} {
  const cleaningMap = new Map<string, CleaningRecord>();
  let casingFixes = 0;
  let whitespaceFixes = 0;
  let aliasFixes = 0;
  let quarterFixes = 0;

  const recordFix = (
    column: 'region' | 'channel' | 'product' | 'quarter',
    original: string,
    cleaned: string,
    reason: string
  ) => {
    if (original === cleaned) return;
    const key = `${column}::${original}::${cleaned}`;
    if (!cleaningMap.has(key)) {
      cleaningMap.set(key, {
        id: key,
        column,
        original,
        cleaned,
        count: 1,
        reason,
      });
    } else {
      cleaningMap.get(key)!.count += 1;
    }

    if (reason.includes('Case')) casingFixes += 1;
    else if (reason.includes('Whitespace') || original.trim() !== original) whitespaceFixes += 1;
    else if (reason.includes('Alias') || reason.includes('Harmonized')) aliasFixes += 1;
    else if (reason.includes('Quarter')) quarterFixes += 1;
  };

  const cleanedOrders: SalesOrder[] = orders.map((o) => {
    // 1. Clean Region
    const regResult = cleanRegion(o.region);
    if (regResult.cleaned !== o.region) {
      recordFix('region', o.region, regResult.cleaned, regResult.reason || 'Case Standardized');
    }

    // 2. Clean Channel
    const chanResult = cleanChannel(o.channel);
    if (chanResult.cleaned !== o.channel) {
      recordFix('channel', o.channel, chanResult.cleaned, chanResult.reason || 'Channel Standardized');
    }

    // 3. Clean Product
    const prodResult = cleanProduct(o.product);
    if (prodResult.cleaned !== o.product) {
      recordFix('product', o.product, prodResult.cleaned, prodResult.reason || 'Product Formatting');
    }

    // 4. Clean Quarter
    const qResult = cleanQuarter(o.quarter);
    if (qResult.cleaned !== o.quarter) {
      recordFix('quarter', o.quarter, qResult.cleaned, qResult.reason || 'Quarter Standardized');
    }

    return {
      ...o,
      rawRegion: o.rawRegion || o.region,
      rawChannel: o.rawChannel || o.channel,
      rawProduct: o.rawProduct || o.product,
      rawQuarter: o.rawQuarter || o.quarter,
      region: regResult.cleaned,
      channel: chanResult.cleaned,
      product: prodResult.cleaned,
      quarter: qResult.cleaned,
    };
  });

  // Calculate consolidated regions report
  const regionVariantsMap = new Map<string, Set<string>>();
  orders.forEach((o, idx) => {
    const cleanedReg = cleanedOrders[idx].region;
    if (!regionVariantsMap.has(cleanedReg)) {
      regionVariantsMap.set(cleanedReg, new Set());
    }
    regionVariantsMap.get(cleanedReg)!.add(o.region);
  });

  const consolidatedRegions: Array<{ unified: string; variants: string[] }> = [];
  regionVariantsMap.forEach((variantsSet, unified) => {
    const variants = Array.from(variantsSet);
    if (variants.length > 1 || (variants.length === 1 && variants[0] !== unified)) {
      consolidatedRegions.push({ unified, variants });
    }
  });

  const records = Array.from(cleaningMap.values()).sort((a, b) => b.count - a.count);
  const totalFixes = records.reduce((sum, r) => sum + r.count, 0);

  return {
    cleanedOrders,
    hygieneReport: {
      totalFixes,
      casingFixes,
      whitespaceFixes,
      aliasFixes,
      quarterFixes,
      records,
      consolidatedRegions,
    },
  };
}
