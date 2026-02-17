const YAHOO_BASE = "https://query2.finance.yahoo.com";

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

// Yahoo Finance requires a session cookie + crumb token for API access.
// We cache them and refresh when they expire.
let cachedSession = null;
let sessionPromise = null; // deduplicates concurrent getSession() calls

async function getSession() {
  if (cachedSession && Date.now() - cachedSession.ts < 5 * 60 * 1000) {
    return cachedSession;
  }

  // If another call is already fetching a session, piggyback on it
  if (sessionPromise) return sessionPromise;

  sessionPromise = (async () => {
    // Step 1: Hit a lightweight Yahoo endpoint to get a session cookie
    const cookieRes = await fetch("https://fc.yahoo.com/", {
      headers: { "User-Agent": USER_AGENT },
      redirect: "manual",
    });
    // We expect a 404 or redirect — we just need the Set-Cookie header
    const setCookies = cookieRes.headers.getSetCookie?.() || [];
    const cookieJar = setCookies.map((c) => c.split(";")[0]).join("; ");

    // Step 2: Use the cookie to fetch a crumb token
    const crumbRes = await fetch(
      "https://query2.finance.yahoo.com/v1/test/getcrumb",
      {
        headers: {
          "User-Agent": USER_AGENT,
          Cookie: cookieJar,
        },
      }
    );
    if (!crumbRes.ok) {
      throw new Error(
        `Failed to obtain Yahoo Finance crumb (${crumbRes.status})`
      );
    }
    const crumb = await crumbRes.text();

    cachedSession = { cookie: cookieJar, crumb, ts: Date.now() };
    return cachedSession;
  })().finally(() => {
    sessionPromise = null;
  });

  return sessionPromise;
}

async function yahooFetch(url) {
  const session = await getSession();
  const separator = url.includes("?") ? "&" : "?";
  const fullUrl = `${url}${separator}crumb=${encodeURIComponent(session.crumb)}`;

  const res = await fetch(fullUrl, {
    headers: {
      "User-Agent": USER_AGENT,
      Accept: "application/json",
      Cookie: session.cookie,
    },
  });

  if (res.status === 401 || res.status === 403) {
    // Session expired — clear cache and retry once
    cachedSession = null;
    const fresh = await getSession();
    const retryUrl = `${url}${separator}crumb=${encodeURIComponent(fresh.crumb)}`;
    const retry = await fetch(retryUrl, {
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "application/json",
        Cookie: fresh.cookie,
      },
    });
    if (!retry.ok) {
      const text = await retry.text().catch(() => "");
      throw new Error(
        `Yahoo Finance request failed (${retry.status}): ${text.slice(0, 200)}`
      );
    }
    return retry.json();
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `Yahoo Finance request failed (${res.status}): ${text.slice(0, 200)}`
    );
  }
  return res.json();
}

async function fetchStockData(ticker) {
  // Use the quoteSummary endpoint which returns all modules in one call
  const modules = [
    "price",
    "summaryDetail",
    "financialData",
    "defaultKeyStatistics",
    "earnings",
    "earningsTrend",
    "calendarEvents",
  ].join(",");

  const url = `${YAHOO_BASE}/v10/finance/quoteSummary/${encodeURIComponent(ticker)}?modules=${modules}`;

  let data;
  try {
    data = await yahooFetch(url);
  } catch (err) {
    throw new Error(
      `Could not fetch data for "${ticker}". Please verify the ticker symbol is correct. (${err.message})`
    );
  }

  const result = data?.quoteSummary?.result?.[0];
  if (!result) {
    throw new Error(`No data found for ticker "${ticker}".`);
  }

  const price = result.price;
  if (!price || !price.regularMarketPrice?.raw) {
    throw new Error(`No price data available for "${ticker}".`);
  }

  return {
    price,
    summaryDetail: result.summaryDetail || null,
    financialData: result.financialData || null,
    defaultKeyStatistics: result.defaultKeyStatistics || null,
    earnings: result.earnings || null,
    earningsTrend: result.earningsTrend || null,
    calendarEvents: result.calendarEvents || null,
  };
}

function raw(obj) {
  // Yahoo returns { raw: 123.45, fmt: "123.45" } for most numeric fields
  if (obj && typeof obj === "object" && "raw" in obj) return obj.raw;
  if (typeof obj === "number") return obj;
  return null;
}

function computeTargetPrice(data) {
  const { price, summaryDetail, financialData, defaultKeyStatistics, earnings } = data;

  const currentPrice = raw(price.regularMarketPrice);
  const sym = price.currencySymbol || "$";
  const models = [];

  // --- Model 1: Analyst consensus target ---
  const targetMean = raw(financialData?.targetMeanPrice);
  const targetLow = raw(financialData?.targetLowPrice);
  const targetHigh = raw(financialData?.targetHighPrice);
  if (targetMean) {
    models.push({
      name: "Analyst Consensus",
      target: targetMean,
      weight: 3,
      description: `Wall Street analyst consensus target is ${sym}${targetMean.toFixed(2)} (range: ${sym}${(targetLow || 0).toFixed(2)} – ${sym}${(targetHigh || 0).toFixed(2)}).`,
    });
  }

  // --- Model 2: PE-based valuation ---
  const trailingPE = raw(summaryDetail?.trailingPE) || raw(price?.trailingPE);
  const forwardPE = raw(summaryDetail?.forwardPE) || raw(price?.forwardPE);
  const trailingEps = raw(defaultKeyStatistics?.trailingEps) || raw(price?.epsTrailingTwelveMonths);

  if (trailingPE && forwardPE && trailingEps) {
    const peTarget = trailingEps * forwardPE;
    if (peTarget > 0) {
      models.push({
        name: "P/E Relative Valuation",
        target: peTarget,
        weight: 2,
        description: `Forward P/E of ${forwardPE.toFixed(1)}x applied to trailing EPS of ${sym}${trailingEps.toFixed(2)} yields a value of ${sym}${peTarget.toFixed(2)}.`,
      });
    }
  }

  // --- Model 3: PEG-adjusted valuation ---
  const pegRatio = raw(defaultKeyStatistics?.pegRatio);
  if (pegRatio && trailingPE && trailingEps && pegRatio > 0) {
    const fairPEMultiple =
      pegRatio < 1
        ? trailingPE * (1 + (1 - pegRatio) * 0.15)
        : trailingPE * (1 - (pegRatio - 1) * 0.05);
    const pegTarget = Math.max(trailingEps * fairPEMultiple, 0);
    if (pegTarget > 0) {
      models.push({
        name: "PEG-Adjusted Valuation",
        target: pegTarget,
        weight: 1.5,
        description: `PEG ratio of ${pegRatio.toFixed(2)} suggests the stock is ${pegRatio < 1 ? "undervalued relative to growth" : "fully valued relative to growth"}, implying a fair value near ${sym}${pegTarget.toFixed(2)}.`,
      });
    }
  }

  // --- Model 4: Earnings momentum ---
  if (earnings?.earningsChart?.quarterly?.length) {
    const quarters = earnings.earningsChart.quarterly;
    const beats = quarters.filter(
      (q) => raw(q.actual) !== null && raw(q.estimate) !== null && raw(q.actual) > raw(q.estimate)
    ).length;
    const beatRate = beats / quarters.length;
    const momentumMultiplier = 1 + (beatRate - 0.5) * 0.1;
    const momentumTarget = currentPrice * momentumMultiplier;
    models.push({
      name: "Earnings Momentum",
      target: momentumTarget,
      weight: 1,
      description: `The company beat earnings estimates in ${beats} of the last ${quarters.length} quarters (${(beatRate * 100).toFixed(0)}% beat rate), suggesting ${beatRate > 0.5 ? "positive" : "neutral/negative"} earnings momentum.`,
    });
  }

  // --- Model 5: Revenue growth extrapolation ---
  const revGrowth = raw(financialData?.revenueGrowth);
  if (revGrowth !== null) {
    const growthTarget = currentPrice * (1 + revGrowth * 0.5);
    models.push({
      name: "Revenue Growth Projection",
      target: growthTarget,
      weight: 1,
      description: `Revenue growth of ${(revGrowth * 100).toFixed(1)}% suggests a growth-adjusted value of ${sym}${growthTarget.toFixed(2)}.`,
    });
  }

  // --- Model 6: Book value / margin of safety ---
  const bookValue = raw(defaultKeyStatistics?.bookValue);
  if (bookValue && currentPrice) {
    const priceToBook = currentPrice / bookValue;
    const fairBookMultiple = Math.min(priceToBook, 5);
    const bookTarget = bookValue * fairBookMultiple;
    models.push({
      name: "Book Value Assessment",
      target: bookTarget,
      weight: 0.5,
      description: `Book value of ${sym}${bookValue.toFixed(2)} with a P/B ratio of ${priceToBook.toFixed(1)}x provides a floor valuation reference.`,
    });
  }

  if (models.length === 0) {
    throw new Error("Insufficient financial data to compute a target price.");
  }

  const totalWeight = models.reduce((sum, m) => sum + m.weight, 0);
  const weightedTarget =
    models.reduce((sum, m) => sum + m.target * m.weight, 0) / totalWeight;

  return {
    currentPrice,
    targetPrice: Math.round(weightedTarget * 100) / 100,
    upside: ((weightedTarget - currentPrice) / currentPrice) * 100,
    models,
  };
}

function buildRationale(ticker, data, pricing) {
  const { price, summaryDetail, financialData, defaultKeyStatistics } = data;
  const { currentPrice, targetPrice, upside, models } = pricing;
  const sym = price.currencySymbol || "$";

  const direction = upside > 5 ? "BUY" : upside < -5 ? "SELL" : "HOLD";
  const directionLabel =
    direction === "BUY"
      ? "Bullish – Buy"
      : direction === "SELL"
        ? "Bearish – Sell"
        : "Neutral – Hold";

  let r = `# ${ticker} — Stock Target Price Analysis\n\n`;
  r += `## Summary\n\n`;
  r += `| Metric | Value |\n|---|---|\n`;
  r += `| **Current Price** | ${sym}${currentPrice.toFixed(2)} |\n`;
  r += `| **12-Month Target Price** | ${sym}${targetPrice.toFixed(2)} |\n`;
  r += `| **Implied Upside/Downside** | ${upside >= 0 ? "+" : ""}${upside.toFixed(1)}% |\n`;
  r += `| **Recommendation** | **${directionLabel}** |\n`;
  r += `| **Market Cap** | ${formatMarketCap(raw(price.marketCap), sym)} |\n`;

  const sector = price.sector || "N/A";
  const industry = price.industry || "N/A";
  r += `| **Sector** | ${sector} |\n`;
  r += `| **Industry** | ${industry} |\n`;

  const divYield = raw(summaryDetail?.dividendYield);
  if (divYield) {
    r += `| **Dividend Yield** | ${(divYield * 100).toFixed(2)}% |\n`;
  }

  const trailingPE = raw(summaryDetail?.trailingPE);
  if (trailingPE) {
    r += `| **Trailing P/E** | ${trailingPE.toFixed(1)}x |\n`;
  }

  const forwardPE = raw(summaryDetail?.forwardPE);
  if (forwardPE) {
    r += `| **Forward P/E** | ${forwardPE.toFixed(1)}x |\n`;
  }

  const low52 = raw(summaryDetail?.fiftyTwoWeekLow);
  const high52 = raw(summaryDetail?.fiftyTwoWeekHigh);
  if (low52 && high52) {
    r += `| **52-Week Range** | ${sym}${low52.toFixed(2)} – ${sym}${high52.toFixed(2)} |\n`;
  }

  r += `\n## Valuation Models\n\n`;
  r += `The target price of **${sym}${targetPrice.toFixed(2)}** is derived from a weighted blend of ${models.length} valuation approaches:\n\n`;

  for (const model of models) {
    r += `### ${model.name} (Weight: ${model.weight}, Target: ${sym}${model.target.toFixed(2)})\n\n`;
    r += `${model.description}\n\n`;
  }

  r += `## Risk Factors\n\n`;
  r += buildRiskSection(data, pricing);

  r += `## Conclusion\n\n`;
  r += buildConclusion(ticker, pricing, data);

  r += `\n\n---\n*This analysis is generated from publicly available financial data and is for informational purposes only. It does not constitute investment advice. Past performance is not indicative of future results. Always conduct your own research before making investment decisions.*\n`;

  return r;
}

function buildRiskSection(data, pricing) {
  const { price, financialData, defaultKeyStatistics } = data;
  const risks = [];

  const beta = raw(defaultKeyStatistics?.beta);
  if (beta && beta > 1.3) {
    risks.push(
      `- **High Volatility**: Beta of ${beta.toFixed(2)} indicates the stock is significantly more volatile than the broader market.`
    );
  } else if (beta) {
    risks.push(
      `- **Volatility**: Beta of ${beta.toFixed(2)} indicates ${beta > 1 ? "above-average" : "below-average"} market sensitivity.`
    );
  }

  const debtToEquity = raw(financialData?.debtToEquity);
  if (debtToEquity && debtToEquity > 100) {
    risks.push(
      `- **Leverage Concern**: Debt-to-equity ratio of ${debtToEquity.toFixed(0)}% suggests significant leverage.`
    );
  }

  const profitMargins = raw(financialData?.profitMargins);
  if (profitMargins !== null && profitMargins < 0) {
    risks.push(
      `- **Unprofitable**: The company currently operates at a loss with profit margins of ${(profitMargins * 100).toFixed(1)}%.`
    );
  }

  const trailingPE = raw(price?.trailingPE);
  if (trailingPE && trailingPE > 40) {
    risks.push(
      `- **Valuation Risk**: A trailing P/E of ${trailingPE.toFixed(1)}x is elevated and leaves little room for disappointment.`
    );
  }

  if (pricing.upside > 30) {
    risks.push(
      `- **Execution Risk**: The significant upside implied requires strong operational execution and favorable market conditions.`
    );
  }

  risks.push(
    `- **Market Risk**: Broader macroeconomic conditions, interest rate changes, and geopolitical events may impact stock performance.`
  );

  return risks.join("\n") + "\n\n";
}

function buildConclusion(ticker, pricing, data) {
  const { currentPrice, targetPrice, upside } = pricing;
  const sym = data.price?.currencySymbol || "$";

  if (upside > 15) {
    return `Based on our multi-model analysis, **${ticker}** appears to be meaningfully undervalued at its current price of ${sym}${currentPrice.toFixed(2)}. Our blended target of **${sym}${targetPrice.toFixed(2)}** represents **${upside.toFixed(1)}% upside potential**. The stock's fundamentals, combined with analyst expectations and growth trajectory, support a constructive outlook. Investors with appropriate risk tolerance may find this an attractive entry point.`;
  } else if (upside > 5) {
    return `Our analysis suggests **${ticker}** has moderate upside potential from its current price of ${sym}${currentPrice.toFixed(2)} to a target of **${sym}${targetPrice.toFixed(2)}** (**+${upside.toFixed(1)}%**). While not deeply undervalued, the risk/reward profile is favorable for investors who believe in the company's continued execution.`;
  } else if (upside > -5) {
    return `At ${sym}${currentPrice.toFixed(2)}, **${ticker}** appears fairly valued relative to our blended target of **${sym}${targetPrice.toFixed(2)}** (**${upside >= 0 ? "+" : ""}${upside.toFixed(1)}%**). We recommend a hold position, monitoring for catalysts that could shift the valuation materially in either direction.`;
  } else {
    return `Our analysis indicates **${ticker}** may be overvalued at its current price of ${sym}${currentPrice.toFixed(2)} relative to our target of **${sym}${targetPrice.toFixed(2)}** (**${upside.toFixed(1)}%**). Investors may want to consider reducing exposure or waiting for a more attractive entry point.`;
  }
}

function formatMarketCap(cap, sym = "$") {
  if (!cap) return "N/A";
  if (cap >= 1e12) return `${sym}${(cap / 1e12).toFixed(2)}T`;
  if (cap >= 1e9) return `${sym}${(cap / 1e9).toFixed(2)}B`;
  if (cap >= 1e6) return `${sym}${(cap / 1e6).toFixed(0)}M`;
  return `${sym}${cap.toLocaleString()}`;
}

async function analyzeStock(ticker) {
  const data = await fetchStockData(ticker);
  const pricing = computeTargetPrice(data);
  const rationale = buildRationale(ticker, data, pricing);

  const companyName =
    data.price.shortName || data.price.longName || ticker;

  const currencySymbol = data.price.currencySymbol || "$";

  return {
    ticker,
    companyName,
    currencySymbol,
    currentPrice: pricing.currentPrice,
    targetPrice: pricing.targetPrice,
    upside: Math.round(pricing.upside * 10) / 10,
    recommendation:
      pricing.upside > 5 ? "BUY" : pricing.upside < -5 ? "SELL" : "HOLD",
    models: pricing.models.map((m) => ({
      name: m.name,
      target: m.target,
      weight: m.weight,
      description: m.description,
    })),
    rationale,
  };
}

// Simple LRU-ish search cache: keeps last 50 queries for 60 seconds
const searchCache = new Map();
const SEARCH_CACHE_TTL = 60_000;
const SEARCH_CACHE_MAX = 50;

async function searchTickers(query) {
  const key = query.toLowerCase();
  const cached = searchCache.get(key);
  if (cached && Date.now() - cached.ts < SEARCH_CACHE_TTL) {
    return cached.results;
  }

  const url = `${YAHOO_BASE}/v1/finance/search?q=${encodeURIComponent(query)}&quotesCount=8&newsCount=0&listsCount=0&enableFuzzyQuery=true&quotesQueryId=tss_match_phrase_query`;
  const data = await yahooFetch(url);
  const quotes = (data.quotes || []).filter(
    (q) => q.isYahooFinance && (q.quoteType === "EQUITY" || q.quoteType === "ETF")
  );
  const results = quotes.map((q) => ({
    symbol: q.symbol,
    name: q.shortname || q.longname || q.symbol,
    exchange: q.exchDisp || q.exchange || "",
    type: q.typeDisp || q.quoteType || "",
  }));

  // Evict oldest entries if cache is full
  if (searchCache.size >= SEARCH_CACHE_MAX) {
    const oldest = searchCache.keys().next().value;
    searchCache.delete(oldest);
  }
  searchCache.set(key, { results, ts: Date.now() });

  return results;
}

export { analyzeStock, searchTickers };
