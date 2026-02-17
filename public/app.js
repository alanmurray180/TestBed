const form = document.getElementById("ticker-form");
const input = document.getElementById("ticker-input");
const btn = document.getElementById("analyze-btn");
const loadingEl = document.getElementById("loading");
const errorEl = document.getElementById("error");
const resultsEl = document.getElementById("results");
const acList = document.getElementById("autocomplete-list");

let acHighlight = -1;
let acItems = [];
let debounceTimer = null;
let abortController = null;

// --- Autocomplete ---

input.addEventListener("input", () => {
  clearTimeout(debounceTimer);
  const q = input.value.trim();
  if (q.length < 2) {
    hideAutocomplete();
    return;
  }
  debounceTimer = setTimeout(() => fetchSuggestions(q), 250);
});

input.addEventListener("keydown", (e) => {
  if (acList.classList.contains("hidden")) return;

  if (e.key === "ArrowDown") {
    e.preventDefault();
    acHighlight = Math.min(acHighlight + 1, acItems.length - 1);
    updateHighlight();
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    acHighlight = Math.max(acHighlight - 1, 0);
    updateHighlight();
  } else if (e.key === "Enter" && acHighlight >= 0) {
    e.preventDefault();
    selectItem(acItems[acHighlight]);
  } else if (e.key === "Escape") {
    hideAutocomplete();
  }
});

document.addEventListener("click", (e) => {
  if (!e.target.closest(".input-wrapper")) {
    hideAutocomplete();
  }
});

async function fetchSuggestions(query) {
  if (abortController) abortController.abort();
  abortController = new AbortController();

  try {
    const res = await fetch(
      `/api/search?q=${encodeURIComponent(query)}`,
      { signal: abortController.signal }
    );
    const data = await res.json();
    acItems = data;
    renderAutocomplete(data);
  } catch (err) {
    if (err.name !== "AbortError") hideAutocomplete();
  }
}

function renderAutocomplete(items) {
  acList.innerHTML = "";
  acHighlight = -1;

  if (items.length === 0) {
    hideAutocomplete();
    return;
  }

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const li = document.createElement("li");
    li.className = "ac-item";
    li.innerHTML =
      `<span class="ac-symbol">${item.symbol}</span>` +
      `<span class="ac-name">${item.name}</span>` +
      `<span class="ac-exchange">${item.exchange}</span>`;
    li.addEventListener("mouseenter", () => {
      acHighlight = i;
      updateHighlight();
    });
    li.addEventListener("click", () => selectItem(item));
    acList.appendChild(li);
  }

  acList.classList.remove("hidden");
}

function updateHighlight() {
  const children = acList.children;
  for (let i = 0; i < children.length; i++) {
    children[i].classList.toggle("ac-active", i === acHighlight);
  }
}

function selectItem(item) {
  input.value = item.symbol;
  hideAutocomplete();
  input.focus();
}

function hideAutocomplete() {
  acList.classList.add("hidden");
  acList.innerHTML = "";
  acHighlight = -1;
  acItems = [];
}

// --- Form submit ---

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  hideAutocomplete();
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
  const sym = data.currencySymbol || "$";
  document.getElementById("current-price").textContent =
    sym + data.currentPrice.toFixed(2);
  document.getElementById("target-price").textContent =
    sym + data.targetPrice.toFixed(2);

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
      <span class="model-target" style="color: ${isAbove ? "var(--green)" : "var(--red)"}">${data.currencySymbol || "$"}${model.target.toFixed(2)}</span>
    `;
    container.appendChild(bar);
  }
}

function renderRationale(markdown) {
  const container = document.getElementById("rationale");
  container.innerHTML = marked.parse(markdown);
}
