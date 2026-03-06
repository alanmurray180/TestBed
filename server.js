import "dotenv/config";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { analyzeStock, searchTickers } from "./lib/analyzer.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/api/search", async (req, res) => {
  const q = (req.query.q || "").trim();
  const provider = req.query.provider || "yahoo";
  if (!q || q.length < 1) {
    return res.json([]);
  }
  try {
    const results = await searchTickers(q, provider);
    res.json(results);
  } catch (err) {
    console.error("Search error:", err.message);
    res.json([]);
  }
});

app.get("/api/analyze/:ticker", async (req, res) => {
  const ticker = req.params.ticker.toUpperCase().trim();

  if (!/^[A-Z0-9]{1,10}([.\-][A-Z]{1,4})?$/.test(ticker)) {
    return res.status(400).json({ error: "Invalid ticker symbol. Examples: AAPL, LLOY.L, RHM.F" });
  }

  const provider = req.query.provider || "yahoo";

  try {
    const result = await analyzeStock(ticker, provider);
    res.json(result);
  } catch (err) {
    console.error(`Error analyzing ${ticker}:`, err.message);
    res.status(500).json({ error: err.message || "Failed to analyze stock." });
  }
});

app.listen(PORT, () => {
  console.log(`Stock Target Pricing app running at http://localhost:${PORT}`);
});
