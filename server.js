import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { analyzeStock } from "./lib/analyzer.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/api/analyze/:ticker", async (req, res) => {
  const ticker = req.params.ticker.toUpperCase().trim();

  if (!/^[A-Z]{1,5}$/.test(ticker)) {
    return res.status(400).json({ error: "Invalid ticker symbol. Use 1-5 uppercase letters." });
  }

  try {
    const result = await analyzeStock(ticker);
    res.json(result);
  } catch (err) {
    console.error(`Error analyzing ${ticker}:`, err.message);
    res.status(500).json({ error: err.message || "Failed to analyze stock." });
  }
});

app.listen(PORT, () => {
  console.log(`Stock Target Pricing app running at http://localhost:${PORT}`);
});
