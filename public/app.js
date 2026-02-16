const form = document.getElementById("ticker-form");
const input = document.getElementById("ticker-input");
const btn = document.getElementById("analyze-btn");
const loadingEl = document.getElementById("loading");
const errorEl = document.getElementById("error");
const resultsEl = document.getElementById("results");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const ticker = input.value.trim().toUpperCase();
  if (!ticker) return;

  showLoading();

  try {
    const res = await fetch(`/api/analyze/${encodeURIComponent(ticker)}`);
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Something went wrong.");
    }

    renderResults(data);
  } catch (err) {
    showError(err.message);
  }
});

function showLoading() {
  loadingEl.classList.remove("hidden");
  errorEl.classList.add("hidden");
  resultsEl.classList.add("hidden");
  btn.disabled = true;
}

function showError(msg) {
  loadingEl.classList.add("hidden");
  resultsEl.classList.add("hidden");
  errorEl.classList.remove("hidden");
  errorEl.textContent = msg;
  btn.disabled = false;
}

function renderResults(data) {
  loadingEl.classList.add("hidden");
  errorEl.classList.add("hidden");
  resultsEl.classList.remove("hidden");
  btn.disabled = false;

  document.getElementById("company-name").textContent = data.companyName;
  document.getElementById("ticker-badge").textContent = data.ticker;
  document.getElementById("current-price").textContent =
    "$" + data.currentPrice.toFixed(2);
  document.getElementById("target-price").textContent =
    "$" + data.targetPrice.toFixed(2);

  const upsideEl = document.getElementById("upside");
  upsideEl.textContent =
    (data.upside >= 0 ? "+" : "") + data.upside.toFixed(1) + "%";
  upsideEl.className =
    "value " +
    (data.upside > 5
      ? "upside-positive"
      : data.upside < -5
        ? "upside-negative"
        : "upside-neutral");

  const recEl = document.getElementById("recommendation");
  recEl.textContent = data.recommendation;
  recEl.className =
    "value " +
    (data.recommendation === "BUY"
      ? "rec-buy"
      : data.recommendation === "SELL"
        ? "rec-sell"
        : "rec-hold");

  renderModelsChart(data);
  renderRationale(data.rationale);
}

function renderModelsChart(data) {
  const container = document.getElementById("models-chart");
  container.innerHTML = "";

  const allTargets = data.models.map((m) => m.target);
  const minTarget = Math.min(...allTargets, data.currentPrice) * 0.9;
  const maxTarget = Math.max(...allTargets, data.currentPrice) * 1.1;
  const range = maxTarget - minTarget;

  for (const model of data.models) {
    const pct = ((model.target - minTarget) / range) * 100;
    const isAbove = model.target >= data.currentPrice;

    const bar = document.createElement("div");
    bar.className = "model-bar";
    bar.innerHTML = `
      <span class="model-name">${model.name}</span>
      <div class="bar-track">
        <div class="bar-fill" style="width: ${pct}%; background: ${isAbove ? "var(--green)" : "var(--red)"}"></div>
      </div>
      <span class="model-target" style="color: ${isAbove ? "var(--green)" : "var(--red)"}">$${model.target.toFixed(2)}</span>
    `;
    container.appendChild(bar);
  }
}

function renderRationale(markdown) {
  const container = document.getElementById("rationale");
  container.innerHTML = marked.parse(markdown);
}
