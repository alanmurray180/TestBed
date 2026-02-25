// AlphaVantage fallback provider — used when Yahoo Finance is unavailable.
// Requires the ALPHAVANTAGE_API_KEY environment variable to be set.

const AV_BASE = "https://www.alphavantage.co/query";

const CURRENCY_SYMBOLS = {
  USD: "$",
  GBP: "£",
  GBp: "p",  // pence for LSE
  EUR: "€",
  JPY: "¥",
  CNY: "¥",
  CAD: "CA$",
  AUD: "A$",
  CHF: "CHF",
  HKD: "HK$",
  INR: "₹",
};

function getApiKey() {
  const key = process.env.ALPHAVANTAGE_API_KEY;
  if (!key) {
    throw new Error("ALPHAVANTAGE_API_KEY environment variable is not set.");
  }
  return key;
}

function wrap(value) {
  if (value === null || value === undefined || value === "None" || value === "-") return null;
  const n = Number(value);
  if (isNaN(n)) return null;
  return { raw: n, fmt: String(value) };
}

async function avFetch(params) {
  const apiKey = getApiKey();
  const qs = new URLSearchParams({ ...params, apikey: apiKey });
  const url = `${AV_BASE}?${qs}`;

  const res = await fetch(url, {
    headers: { "User-Agent": "StockTargetPricing/1.0" },
  });

  if (!res.ok) {
    throw new Error(`AlphaVantage request failed (${res.status})`);
  }

  const data = await res.json();

  // AV returns an error message inside the JSON for invalid keys / rate limits
  if (data["Error Message"]) {
    throw new Error(`AlphaVantage error: ${data["Error Message"]}`);
  }
  if (data["Note"]) {
    // Rate limit note
    throw new Error(`AlphaVantage rate limit: ${data["Note"]}`);
  }
  if (data["Information"]) {
    throw new Error(`AlphaVantage: ${data["Information"]}`);
  }

  return data;
}

/**
 * Fetch stock data from AlphaVantage and normalise it into the same shape
 * that the rest of the app expects (Yahoo Finance quoteSummary format).
 */
async function fetchAlphaVantageData(ticker) {
  // Fetch OVERVIEW and GLOBAL_QUOTE in parallel; EARNINGS as a separate call
  const [overview, quote, earnings] = await Promise.all([
    avFetch({ function: "OVERVIEW", symbol: ticker }),
    avFetch({ function: "GLOBAL_QUOTE", symbol: ticker }),
    avFetch({ function: "EARNINGS", symbol: ticker }),
  ]);

  const gq = quote["Global Quote"] || {};
  const currentPrice = Number(gq["05. price"]);

  if (!currentPrice || !overview.Symbol) {
    throw new Error(`No AlphaVantage data found for ticker "${ticker}".`);
  }

  const currency = overview.Currency || "USD";
  const currencySymbol = CURRENCY_SYMBOLS[currency] || currency;

  // --- Build price module ---
  const price = {
    shortName: overview.Name || ticker,
    longName: overview.Name || ticker,
    symbol: overview.Symbol || ticker,
    currency,
    currencySymbol,
    regularMarketPrice: wrap(currentPrice),
    marketCap: wrap(overview.MarketCapitalization),
    trailingPE: wrap(overview.TrailingPE),
    forwardPE: wrap(overview.ForwardPE),
    epsTrailingTwelveMonths: wrap(overview.EPS),
    sector: overview.Sector || null,
    industry: overview.Industry || null,
  };

  // --- Build summaryDetail module ---
  const summaryDetail = {
    trailingPE: wrap(overview.TrailingPE),
    forwardPE: wrap(overview.ForwardPE),
    dividendYield: wrap(overview.DividendYield),
    fiftyTwoWeekLow: wrap(overview["52WeekLow"]),
    fiftyTwoWeekHigh: wrap(overview["52WeekHigh"]),
  };

  // --- Build financialData module ---
  const revGrowthRaw = overview.QuarterlyRevenueGrowthYOY;
  const profitMarginRaw = overview.ProfitMargin;
  const financialData = {
    targetMeanPrice: wrap(overview.AnalystTargetPrice),
    targetLowPrice: null,   // AV OVERVIEW only provides mean target
    targetHighPrice: null,
    revenueGrowth: wrap(revGrowthRaw),
    profitMargins: wrap(profitMarginRaw),
    debtToEquity: null,     // not directly in OVERVIEW
  };

  // --- Build defaultKeyStatistics module ---
  const defaultKeyStatistics = {
    trailingEps: wrap(overview.EPS),
    pegRatio: wrap(overview.PEGRatio),
    beta: wrap(overview.Beta),
    bookValue: wrap(overview.BookValue),
  };

  // --- Build earnings module from EARNINGS endpoint ---
  let earningsModule = null;
  const quarterlyEarnings = earnings?.quarterlyEarnings;
  if (Array.isArray(quarterlyEarnings) && quarterlyEarnings.length > 0) {
    // Take the most recent 4 quarters (AV returns newest first)
    const recent = quarterlyEarnings.slice(0, 4).reverse();
    earningsModule = {
      earningsChart: {
        quarterly: recent.map((q) => ({
          actual: wrap(q.reportedEPS),
          estimate: wrap(q.estimatedEPS),
          date: q.fiscalDateEnding || "",
        })),
      },
    };
  }

  return {
    _demo: false,
    _source: "alphavantage",
    price,
    summaryDetail,
    financialData,
    defaultKeyStatistics,
    earnings: earningsModule,
    earningsTrend: null,
    calendarEvents: null,
  };
}

/**
 * Search for tickers using AlphaVantage SYMBOL_SEARCH.
 */
async function searchAlphaVantage(query) {
  const data = await avFetch({ function: "SYMBOL_SEARCH", keywords: query });
  const matches = data.bestMatches || [];

  return matches
    .filter((m) => m["3. type"] === "Equity" || m["3. type"] === "ETF")
    .map((m) => ({
      symbol: m["1. symbol"],
      name: m["2. name"],
      exchange: m["4. region"] || "",
      type: m["3. type"] || "",
    }));
}

export { fetchAlphaVantageData, searchAlphaVantage };
