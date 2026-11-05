import express, { type Request, type Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize GoogleGenAI server-side with User-Agent telemetry
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

interface ShiftMetricsPayload {
  topRegion: string;
  criterion: 'absolute_dollar' | 'percentage';
  metrics: {
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
    topProducts: Array<{
      product: string;
      q2Rev: number;
      q3Rev: number;
      change: number;
      pctChange: number;
    }>;
    topChannels: Array<{
      channel: string;
      q2Rev: number;
      q3Rev: number;
      change: number;
    }>;
  };
  allRegionsSummary: Array<{
    region: string;
    q2Revenue: number;
    q3Revenue: number;
    revenueChange: number;
    percentChange: number;
  }>;
}

// Fallback generator in case Gemini key is missing or quota exceeded
function generateDeterministicThreeSentenceSummary(payload: ShiftMetricsPayload): string {
  const m = payload.metrics;
  const region = m.region;
  const direction = m.revenueChange >= 0 ? 'increased' : 'decreased';
  const sign = m.revenueChange >= 0 ? '+' : '';
  const q2Formatted = `$${m.q2Revenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  const q3Formatted = `$${m.q3Revenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  const deltaFormatted = `${sign}$${Math.abs(m.revenueChange).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  const pctFormatted = `${sign}${m.percentChange.toFixed(1)}%`;

  // Sentence 1: Region that changed most
  const sentence1 = `${region} experienced the largest shift from Q2 to Q3, with revenue changing from ${q2Formatted} to ${q3Formatted}, representing a variance of ${deltaFormatted} (${pctFormatted}).`;

  // Sentence 2: Primary driver (products / units)
  let sentence2 = '';
  const topProduct = m.topProducts && m.topProducts[0];
  if (topProduct) {
    const prodSign = topProduct.change >= 0 ? '+' : '';
    const prodDelta = `${prodSign}$${Math.abs(topProduct.change).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
    const prodQ2 = `$${topProduct.q2Rev.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
    const prodQ3 = `$${topProduct.q3Rev.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
    sentence2 = `The primary driver was ${topProduct.product}, which ${topProduct.change >= 0 ? 'surged' : 'contracted'} by ${prodDelta} (from ${prodQ2} in Q2 to ${prodQ3} in Q3) alongside total regional order volume shifting by ${m.unitsChange >= 0 ? '+' : ''}${m.unitsChange.toLocaleString()} units (${m.unitsPercentChange >= 0 ? '+' : ''}${m.unitsPercentChange.toFixed(1)}%).`;
  } else {
    sentence2 = `The movement was primarily driven by overall sales volume changing by ${m.unitsChange >= 0 ? '+' : ''}${m.unitsChange.toLocaleString()} units from ${m.q2Units.toLocaleString()} in Q2 to ${m.q3Units.toLocaleString()} in Q3.`;
  }

  // Sentence 3: Secondary driver (discounts / channels)
  let sentence3 = '';
  const topChannel = m.topChannels && m.topChannels[0];
  const discountStr = `average discount rates moved from ${m.q2AvgDiscount.toFixed(1)}% to ${m.q3AvgDiscount.toFixed(1)}% (${m.discountDiffPctPoints >= 0 ? '+' : ''}${m.discountDiffPctPoints.toFixed(1)} percentage points)`;
  if (topChannel) {
    const chanSign = topChannel.change >= 0 ? '+' : '';
    const chanDelta = `${chanSign}$${Math.abs(topChannel.change).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
    sentence3 = `Additionally, the shift was influenced by the ${topChannel.channel} channel contributing a ${chanDelta} variance, while ${discountStr}.`;
  } else {
    sentence3 = `Furthermore, ${discountStr}, directly impacting gross realized sales for the quarter.`;
  }

  return `${sentence1} ${sentence2} ${sentence3}`;
}

// API Route for Q2 to Q3 AI Summary
app.post('/api/analyze-shift', async (req: Request, res: Response) => {
  try {
    const payload = req.body as ShiftMetricsPayload;

    if (!payload || !payload.metrics || !payload.metrics.region) {
      res.status(400).json({ error: 'Missing required metrics payload' });
      return;
    }

    const { metrics, allRegionsSummary } = payload;

    // Check if GEMINI_API_KEY is configured
    if (!process.env.GEMINI_API_KEY) {
      console.warn('GEMINI_API_KEY not configured, using verified deterministic summary');
      const fallbackSummary = generateDeterministicThreeSentenceSummary(payload);
      res.json({
        summary: fallbackSummary,
        source: 'deterministic_fallback',
        region: metrics.region,
      });
      return;
    }

    const formatCurrency = (val: number) => `$${Math.round(val).toLocaleString()}`;
    const formatPct = (val: number) => `${val >= 0 ? '+' : ''}${val.toFixed(1)}%`;

    const regionsText = allRegionsSummary
      .map(
        (r) =>
          `- ${r.region}: Q2 Revenue = ${formatCurrency(r.q2Revenue)}, Q3 Revenue = ${formatCurrency(r.q3Revenue)}, Change = ${formatCurrency(r.revenueChange)} (${formatPct(r.percentChange)})`
      )
      .join('\n');

    const productsText = (metrics.topProducts || [])
      .map(
        (p) =>
          `- ${p.product}: Q2 = ${formatCurrency(p.q2Rev)}, Q3 = ${formatCurrency(p.q3Rev)}, Change = ${formatCurrency(p.change)} (${formatPct(p.pctChange)})`
      )
      .join('\n');

    const channelsText = (metrics.topChannels || [])
      .map(
        (c) =>
          `- ${c.channel}: Q2 = ${formatCurrency(c.q2Rev)}, Q3 = ${formatCurrency(c.q3Rev)}, Change = ${formatCurrency(c.change)}`
      )
      .join('\n');

    const prompt = `You are a financial sales analyst. Based strictly and ONLY on the exact calculated numbers provided below, write a THREE-SENTENCE summary of which region changed the most from Q2 to Q3, and why.

CRITICAL RULES:
1. OUTPUT EXACTLY THREE SENTENCES. Do not write two sentences, do not write four sentences. Count sentences carefully.
2. USE ONLY NUMBERS PROVIDED IN THIS PROMPT. Do not fabricate, round inconsistently, or assume any figures not listed.
3. Sentence 1: State clearly which region changed the most from Q2 to Q3, citing its calculated Q2 revenue (${formatCurrency(metrics.q2Revenue)}), Q3 revenue (${formatCurrency(metrics.q3Revenue)}), and exact dollar change (${formatCurrency(metrics.revenueChange)}) or percentage change (${formatPct(metrics.percentChange)}).
4. Sentence 2: Explain the primary driver of WHY it changed, citing specific product-level revenue shifts (${metrics.topProducts[0]?.product || 'product lines'}) or units volume change (${metrics.q2Units.toLocaleString()} to ${metrics.q3Units.toLocaleString()} units, delta of ${metrics.unitsChange >= 0 ? '+' : ''}${metrics.unitsChange.toLocaleString()} units).
5. Sentence 3: Explain secondary contributing factors, such as discount percentage changes (${metrics.q2AvgDiscount.toFixed(1)}% to ${metrics.q3AvgDiscount.toFixed(1)}%) or channel performance (${metrics.topChannels[0]?.channel || 'sales channels'}), citing the exact figures provided.
6. Return only the raw three sentences with no headers, markdown formatting, or bullets.

CALCULATED REGIONAL REVENUE (Q2 vs Q3):
${regionsText}

REGION THAT CHANGED THE MOST:
Region: ${metrics.region}
- Q2 Total Revenue: ${formatCurrency(metrics.q2Revenue)}
- Q3 Total Revenue: ${formatCurrency(metrics.q3Revenue)}
- Revenue Variance: ${formatCurrency(metrics.revenueChange)} (${formatPct(metrics.percentChange)})
- Q2 Order Units: ${metrics.q2Units.toLocaleString()}
- Q3 Order Units: ${metrics.q3Units.toLocaleString()}
- Units Variance: ${metrics.unitsChange >= 0 ? '+' : ''}${metrics.unitsChange.toLocaleString()} (${formatPct(metrics.unitsPercentChange)})
- Q2 Average Discount: ${metrics.q2AvgDiscount.toFixed(1)}%
- Q3 Average Discount: ${metrics.q3AvgDiscount.toFixed(1)}%
- Discount Delta: ${metrics.discountDiffPctPoints >= 0 ? '+' : ''}${metrics.discountDiffPctPoints.toFixed(1)} percentage points

TOP PRODUCT BREAKDOWN IN ${metrics.region} (Q2 to Q3):
${productsText || 'No product breakdown available'}

CHANNEL BREAKDOWN IN ${metrics.region} (Q2 to Q3):
${channelsText || 'No channel breakdown available'}
`;

    // Call Gemini API with a 4.5s timeout so the app stays responsive even if outbound network is constrained
    const aiPromise = ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction:
          'You are a corporate sales performance analyst. You write concise executive summaries consisting of strictly three sentences using only verified data provided in the prompt.',
        temperature: 0.2,
      },
    });

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('AI request timeout')), 4500)
    );

    const response = await Promise.race([aiPromise, timeoutPromise]);
    const summaryText = response.text?.trim();

    if (!summaryText) {
      throw new Error('Gemini returned an empty response');
    }

    res.json({
      summary: summaryText,
      source: 'gemini-3.8-flash',
      region: metrics.region,
    });
  } catch (error: any) {
    console.error('Error generating AI shift summary:', error);
    // Provide deterministic calculation summary as resilient fallback
    const fallback = generateDeterministicThreeSentenceSummary(req.body);
    res.json({
      summary: fallback,
      source: 'deterministic_fallback',
      warning: error?.message || 'AI service unavailable, generated using calculated figures.',
      region: req.body?.metrics?.region || 'Unknown',
    });
  }
});

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    hasGeminiKey: !!process.env.GEMINI_API_KEY,
  });
});

async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
