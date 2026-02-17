// Realistic mock data used when Yahoo Finance is unreachable (e.g. no network).
// Prices are approximate and for demonstration purposes only.

const MOCK_STOCKS = {
  AAPL: {
    price: {
      shortName: "Apple Inc.",
      longName: "Apple Inc.",
      symbol: "AAPL",
      currency: "USD",
      currencySymbol: "$",
      regularMarketPrice: { raw: 232.47, fmt: "232.47" },
      marketCap: { raw: 3.56e12, fmt: "3.56T" },
      trailingPE: { raw: 37.8, fmt: "37.80" },
      forwardPE: { raw: 31.2, fmt: "31.20" },
      epsTrailingTwelveMonths: { raw: 6.15, fmt: "6.15" },
      sector: "Technology",
      industry: "Consumer Electronics",
    },
    summaryDetail: {
      trailingPE: { raw: 37.8, fmt: "37.80" },
      forwardPE: { raw: 31.2, fmt: "31.20" },
      dividendYield: { raw: 0.0044, fmt: "0.44%" },
      fiftyTwoWeekLow: { raw: 169.21, fmt: "169.21" },
      fiftyTwoWeekHigh: { raw: 247.77, fmt: "247.77" },
    },
    financialData: {
      targetMeanPrice: { raw: 248.68, fmt: "248.68" },
      targetLowPrice: { raw: 200.0, fmt: "200.00" },
      targetHighPrice: { raw: 300.0, fmt: "300.00" },
      revenueGrowth: { raw: 0.049, fmt: "4.9%" },
      profitMargins: { raw: 0.264, fmt: "26.4%" },
      debtToEquity: { raw: 151.86, fmt: "151.86" },
    },
    defaultKeyStatistics: {
      trailingEps: { raw: 6.15, fmt: "6.15" },
      pegRatio: { raw: 2.69, fmt: "2.69" },
      beta: { raw: 1.24, fmt: "1.24" },
      bookValue: { raw: 4.38, fmt: "4.38" },
    },
    earnings: {
      earningsChart: {
        quarterly: [
          { actual: { raw: 1.64 }, estimate: { raw: 1.60 } },
          { actual: { raw: 1.40 }, estimate: { raw: 1.35 } },
          { actual: { raw: 1.46 }, estimate: { raw: 1.43 } },
          { actual: { raw: 2.40 }, estimate: { raw: 2.36 } },
        ],
      },
    },
    earningsTrend: null,
    calendarEvents: null,
  },

  MSFT: {
    price: {
      shortName: "Microsoft Corporation",
      longName: "Microsoft Corporation",
      symbol: "MSFT",
      currency: "USD",
      currencySymbol: "$",
      regularMarketPrice: { raw: 415.26, fmt: "415.26" },
      marketCap: { raw: 3.09e12, fmt: "3.09T" },
      trailingPE: { raw: 34.6, fmt: "34.60" },
      forwardPE: { raw: 29.8, fmt: "29.80" },
      epsTrailingTwelveMonths: { raw: 12.0, fmt: "12.00" },
      sector: "Technology",
      industry: "Software—Infrastructure",
    },
    summaryDetail: {
      trailingPE: { raw: 34.6, fmt: "34.60" },
      forwardPE: { raw: 29.8, fmt: "29.80" },
      dividendYield: { raw: 0.0073, fmt: "0.73%" },
      fiftyTwoWeekLow: { raw: 362.9, fmt: "362.90" },
      fiftyTwoWeekHigh: { raw: 468.35, fmt: "468.35" },
    },
    financialData: {
      targetMeanPrice: { raw: 502.53, fmt: "502.53" },
      targetLowPrice: { raw: 420.0, fmt: "420.00" },
      targetHighPrice: { raw: 570.0, fmt: "570.00" },
      revenueGrowth: { raw: 0.162, fmt: "16.2%" },
      profitMargins: { raw: 0.357, fmt: "35.7%" },
      debtToEquity: { raw: 36.44, fmt: "36.44" },
    },
    defaultKeyStatistics: {
      trailingEps: { raw: 12.0, fmt: "12.00" },
      pegRatio: { raw: 2.15, fmt: "2.15" },
      beta: { raw: 0.89, fmt: "0.89" },
      bookValue: { raw: 36.12, fmt: "36.12" },
    },
    earnings: {
      earningsChart: {
        quarterly: [
          { actual: { raw: 3.0 }, estimate: { raw: 2.82 } },
          { actual: { raw: 2.95 }, estimate: { raw: 2.93 } },
          { actual: { raw: 2.99 }, estimate: { raw: 2.89 } },
          { actual: { raw: 3.23 }, estimate: { raw: 3.11 } },
        ],
      },
    },
    earningsTrend: null,
    calendarEvents: null,
  },

  GOOGL: {
    price: {
      shortName: "Alphabet Inc.",
      longName: "Alphabet Inc.",
      symbol: "GOOGL",
      currency: "USD",
      currencySymbol: "$",
      regularMarketPrice: { raw: 178.95, fmt: "178.95" },
      marketCap: { raw: 2.19e12, fmt: "2.19T" },
      trailingPE: { raw: 23.4, fmt: "23.40" },
      forwardPE: { raw: 20.1, fmt: "20.10" },
      epsTrailingTwelveMonths: { raw: 7.65, fmt: "7.65" },
      sector: "Communication Services",
      industry: "Internet Content & Information",
    },
    summaryDetail: {
      trailingPE: { raw: 23.4, fmt: "23.40" },
      forwardPE: { raw: 20.1, fmt: "20.10" },
      dividendYield: { raw: 0.0046, fmt: "0.46%" },
      fiftyTwoWeekLow: { raw: 141.8, fmt: "141.80" },
      fiftyTwoWeekHigh: { raw: 202.29, fmt: "202.29" },
    },
    financialData: {
      targetMeanPrice: { raw: 210.48, fmt: "210.48" },
      targetLowPrice: { raw: 165.0, fmt: "165.00" },
      targetHighPrice: { raw: 250.0, fmt: "250.00" },
      revenueGrowth: { raw: 0.139, fmt: "13.9%" },
      profitMargins: { raw: 0.294, fmt: "29.4%" },
      debtToEquity: { raw: 10.0, fmt: "10.00" },
    },
    defaultKeyStatistics: {
      trailingEps: { raw: 7.65, fmt: "7.65" },
      pegRatio: { raw: 1.12, fmt: "1.12" },
      beta: { raw: 1.06, fmt: "1.06" },
      bookValue: { raw: 24.73, fmt: "24.73" },
    },
    earnings: {
      earningsChart: {
        quarterly: [
          { actual: { raw: 1.89 }, estimate: { raw: 1.85 } },
          { actual: { raw: 1.93 }, estimate: { raw: 1.84 } },
          { actual: { raw: 2.12 }, estimate: { raw: 1.85 } },
          { actual: { raw: 2.15 }, estimate: { raw: 2.05 } },
        ],
      },
    },
    earningsTrend: null,
    calendarEvents: null,
  },

  AMZN: {
    price: {
      shortName: "Amazon.com, Inc.",
      longName: "Amazon.com, Inc.",
      symbol: "AMZN",
      currency: "USD",
      currencySymbol: "$",
      regularMarketPrice: { raw: 218.94, fmt: "218.94" },
      marketCap: { raw: 2.32e12, fmt: "2.32T" },
      trailingPE: { raw: 42.1, fmt: "42.10" },
      forwardPE: { raw: 33.5, fmt: "33.50" },
      epsTrailingTwelveMonths: { raw: 5.2, fmt: "5.20" },
      sector: "Consumer Cyclical",
      industry: "Internet Retail",
    },
    summaryDetail: {
      trailingPE: { raw: 42.1, fmt: "42.10" },
      forwardPE: { raw: 33.5, fmt: "33.50" },
      dividendYield: null,
      fiftyTwoWeekLow: { raw: 151.61, fmt: "151.61" },
      fiftyTwoWeekHigh: { raw: 233.0, fmt: "233.00" },
    },
    financialData: {
      targetMeanPrice: { raw: 244.89, fmt: "244.89" },
      targetLowPrice: { raw: 195.0, fmt: "195.00" },
      targetHighPrice: { raw: 280.0, fmt: "280.00" },
      revenueGrowth: { raw: 0.109, fmt: "10.9%" },
      profitMargins: { raw: 0.088, fmt: "8.8%" },
      debtToEquity: { raw: 52.79, fmt: "52.79" },
    },
    defaultKeyStatistics: {
      trailingEps: { raw: 5.2, fmt: "5.20" },
      pegRatio: { raw: 1.68, fmt: "1.68" },
      beta: { raw: 1.16, fmt: "1.16" },
      bookValue: { raw: 22.54, fmt: "22.54" },
    },
    earnings: {
      earningsChart: {
        quarterly: [
          { actual: { raw: 1.29 }, estimate: { raw: 1.14 } },
          { actual: { raw: 1.43 }, estimate: { raw: 1.03 } },
          { actual: { raw: 1.26 }, estimate: { raw: 1.14 } },
          { actual: { raw: 1.86 }, estimate: { raw: 1.48 } },
        ],
      },
    },
    earningsTrend: null,
    calendarEvents: null,
  },

  TSLA: {
    price: {
      shortName: "Tesla, Inc.",
      longName: "Tesla, Inc.",
      symbol: "TSLA",
      currency: "USD",
      currencySymbol: "$",
      regularMarketPrice: { raw: 352.56, fmt: "352.56" },
      marketCap: { raw: 1.13e12, fmt: "1.13T" },
      trailingPE: { raw: 112.8, fmt: "112.80" },
      forwardPE: { raw: 95.3, fmt: "95.30" },
      epsTrailingTwelveMonths: { raw: 3.12, fmt: "3.12" },
      sector: "Consumer Cyclical",
      industry: "Auto Manufacturers",
    },
    summaryDetail: {
      trailingPE: { raw: 112.8, fmt: "112.80" },
      forwardPE: { raw: 95.3, fmt: "95.30" },
      dividendYield: null,
      fiftyTwoWeekLow: { raw: 138.8, fmt: "138.80" },
      fiftyTwoWeekHigh: { raw: 488.54, fmt: "488.54" },
    },
    financialData: {
      targetMeanPrice: { raw: 303.59, fmt: "303.59" },
      targetLowPrice: { raw: 120.0, fmt: "120.00" },
      targetHighPrice: { raw: 528.0, fmt: "528.00" },
      revenueGrowth: { raw: 0.079, fmt: "7.9%" },
      profitMargins: { raw: 0.134, fmt: "13.4%" },
      debtToEquity: { raw: 18.08, fmt: "18.08" },
    },
    defaultKeyStatistics: {
      trailingEps: { raw: 3.12, fmt: "3.12" },
      pegRatio: { raw: 5.91, fmt: "5.91" },
      beta: { raw: 2.31, fmt: "2.31" },
      bookValue: { raw: 21.35, fmt: "21.35" },
    },
    earnings: {
      earningsChart: {
        quarterly: [
          { actual: { raw: 0.72 }, estimate: { raw: 0.58 } },
          { actual: { raw: 0.52 }, estimate: { raw: 0.62 } },
          { actual: { raw: 0.72 }, estimate: { raw: 0.60 } },
          { actual: { raw: 0.73 }, estimate: { raw: 0.76 } },
        ],
      },
    },
    earningsTrend: null,
    calendarEvents: null,
  },

  NVDA: {
    price: {
      shortName: "NVIDIA Corporation",
      longName: "NVIDIA Corporation",
      symbol: "NVDA",
      currency: "USD",
      currencySymbol: "$",
      regularMarketPrice: { raw: 137.71, fmt: "137.71" },
      marketCap: { raw: 3.37e12, fmt: "3.37T" },
      trailingPE: { raw: 54.2, fmt: "54.20" },
      forwardPE: { raw: 31.5, fmt: "31.50" },
      epsTrailingTwelveMonths: { raw: 2.54, fmt: "2.54" },
      sector: "Technology",
      industry: "Semiconductors",
    },
    summaryDetail: {
      trailingPE: { raw: 54.2, fmt: "54.20" },
      forwardPE: { raw: 31.5, fmt: "31.50" },
      dividendYield: { raw: 0.0003, fmt: "0.03%" },
      fiftyTwoWeekLow: { raw: 66.25, fmt: "66.25" },
      fiftyTwoWeekHigh: { raw: 152.89, fmt: "152.89" },
    },
    financialData: {
      targetMeanPrice: { raw: 170.73, fmt: "170.73" },
      targetLowPrice: { raw: 135.0, fmt: "135.00" },
      targetHighPrice: { raw: 220.0, fmt: "220.00" },
      revenueGrowth: { raw: 0.939, fmt: "93.9%" },
      profitMargins: { raw: 0.553, fmt: "55.3%" },
      debtToEquity: { raw: 29.18, fmt: "29.18" },
    },
    defaultKeyStatistics: {
      trailingEps: { raw: 2.54, fmt: "2.54" },
      pegRatio: { raw: 1.06, fmt: "1.06" },
      beta: { raw: 1.67, fmt: "1.67" },
      bookValue: { raw: 2.37, fmt: "2.37" },
    },
    earnings: {
      earningsChart: {
        quarterly: [
          { actual: { raw: 0.60 }, estimate: { raw: 0.51 } },
          { actual: { raw: 0.68 }, estimate: { raw: 0.64 } },
          { actual: { raw: 0.78 }, estimate: { raw: 0.75 } },
          { actual: { raw: 0.81 }, estimate: { raw: 0.80 } },
        ],
      },
    },
    earningsTrend: null,
    calendarEvents: null,
  },

  META: {
    price: {
      shortName: "Meta Platforms, Inc.",
      longName: "Meta Platforms, Inc.",
      symbol: "META",
      currency: "USD",
      currencySymbol: "$",
      regularMarketPrice: { raw: 612.77, fmt: "612.77" },
      marketCap: { raw: 1.55e12, fmt: "1.55T" },
      trailingPE: { raw: 26.4, fmt: "26.40" },
      forwardPE: { raw: 22.8, fmt: "22.80" },
      epsTrailingTwelveMonths: { raw: 23.2, fmt: "23.20" },
      sector: "Communication Services",
      industry: "Internet Content & Information",
    },
    summaryDetail: {
      trailingPE: { raw: 26.4, fmt: "26.40" },
      forwardPE: { raw: 22.8, fmt: "22.80" },
      dividendYield: { raw: 0.0033, fmt: "0.33%" },
      fiftyTwoWeekLow: { raw: 414.5, fmt: "414.50" },
      fiftyTwoWeekHigh: { raw: 638.4, fmt: "638.40" },
    },
    financialData: {
      targetMeanPrice: { raw: 682.0, fmt: "682.00" },
      targetLowPrice: { raw: 540.0, fmt: "540.00" },
      targetHighPrice: { raw: 770.0, fmt: "770.00" },
      revenueGrowth: { raw: 0.218, fmt: "21.8%" },
      profitMargins: { raw: 0.358, fmt: "35.8%" },
      debtToEquity: { raw: 26.26, fmt: "26.26" },
    },
    defaultKeyStatistics: {
      trailingEps: { raw: 23.2, fmt: "23.20" },
      pegRatio: { raw: 1.32, fmt: "1.32" },
      beta: { raw: 1.27, fmt: "1.27" },
      bookValue: { raw: 66.02, fmt: "66.02" },
    },
    earnings: {
      earningsChart: {
        quarterly: [
          { actual: { raw: 5.33 }, estimate: { raw: 4.71 } },
          { actual: { raw: 5.16 }, estimate: { raw: 4.73 } },
          { actual: { raw: 6.03 }, estimate: { raw: 5.25 } },
          { actual: { raw: 8.02 }, estimate: { raw: 6.77 } },
        ],
      },
    },
    earningsTrend: null,
    calendarEvents: null,
  },

  JPM: {
    price: {
      shortName: "JPMorgan Chase & Co.",
      longName: "JPMorgan Chase & Co.",
      symbol: "JPM",
      currency: "USD",
      currencySymbol: "$",
      regularMarketPrice: { raw: 254.58, fmt: "254.58" },
      marketCap: { raw: 7.25e11, fmt: "725B" },
      trailingPE: { raw: 13.3, fmt: "13.30" },
      forwardPE: { raw: 12.8, fmt: "12.80" },
      epsTrailingTwelveMonths: { raw: 19.14, fmt: "19.14" },
      sector: "Financial Services",
      industry: "Banks—Diversified",
    },
    summaryDetail: {
      trailingPE: { raw: 13.3, fmt: "13.30" },
      forwardPE: { raw: 12.8, fmt: "12.80" },
      dividendYield: { raw: 0.0197, fmt: "1.97%" },
      fiftyTwoWeekLow: { raw: 181.0, fmt: "181.00" },
      fiftyTwoWeekHigh: { raw: 268.79, fmt: "268.79" },
    },
    financialData: {
      targetMeanPrice: { raw: 268.32, fmt: "268.32" },
      targetLowPrice: { raw: 215.0, fmt: "215.00" },
      targetHighPrice: { raw: 310.0, fmt: "310.00" },
      revenueGrowth: { raw: 0.124, fmt: "12.4%" },
      profitMargins: { raw: 0.337, fmt: "33.7%" },
      debtToEquity: null,
    },
    defaultKeyStatistics: {
      trailingEps: { raw: 19.14, fmt: "19.14" },
      pegRatio: { raw: 1.89, fmt: "1.89" },
      beta: { raw: 1.1, fmt: "1.10" },
      bookValue: { raw: 113.41, fmt: "113.41" },
    },
    earnings: {
      earningsChart: {
        quarterly: [
          { actual: { raw: 4.44 }, estimate: { raw: 4.11 } },
          { actual: { raw: 4.37 }, estimate: { raw: 4.19 } },
          { actual: { raw: 4.81 }, estimate: { raw: 4.01 } },
          { actual: { raw: 4.93 }, estimate: { raw: 4.09 } },
        ],
      },
    },
    earningsTrend: null,
    calendarEvents: null,
  },
};

// Ticker directory for autocomplete search
const TICKER_DIRECTORY = [
  { symbol: "AAPL", name: "Apple Inc.", exchange: "NASDAQ", type: "Equity" },
  { symbol: "MSFT", name: "Microsoft Corporation", exchange: "NASDAQ", type: "Equity" },
  { symbol: "GOOGL", name: "Alphabet Inc.", exchange: "NASDAQ", type: "Equity" },
  { symbol: "AMZN", name: "Amazon.com, Inc.", exchange: "NASDAQ", type: "Equity" },
  { symbol: "TSLA", name: "Tesla, Inc.", exchange: "NASDAQ", type: "Equity" },
  { symbol: "NVDA", name: "NVIDIA Corporation", exchange: "NASDAQ", type: "Equity" },
  { symbol: "META", name: "Meta Platforms, Inc.", exchange: "NASDAQ", type: "Equity" },
  { symbol: "JPM", name: "JPMorgan Chase & Co.", exchange: "NYSE", type: "Equity" },
];

function getMockStockData(ticker) {
  return MOCK_STOCKS[ticker.toUpperCase()] || null;
}

function searchMockTickers(query) {
  const q = query.toUpperCase();
  return TICKER_DIRECTORY.filter(
    (t) => t.symbol.includes(q) || t.name.toUpperCase().includes(q)
  );
}

export { getMockStockData, searchMockTickers, TICKER_DIRECTORY };
