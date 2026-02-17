// Lightweight markdown-to-HTML fallback when the CDN-hosted `marked` library
// is unavailable (e.g. no internet).  Covers headings, bold, italic, tables,
// unordered lists, horizontal rules, and paragraphs — enough for our rationale.

function markdownToHtml(src) {
  const lines = src.split("\n");
  let html = "";
  let inTable = false;
  let inList = false;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    // Horizontal rule
    if (/^---+$/.test(line.trim())) {
      if (inList) { html += "</ul>"; inList = false; }
      if (inTable) { html += "</tbody></table>"; inTable = false; }
      html += "<hr>";
      continue;
    }

    // Headings
    const headingMatch = line.match(/^(#{1,6})\s+(.*)/);
    if (headingMatch) {
      if (inList) { html += "</ul>"; inList = false; }
      if (inTable) { html += "</tbody></table>"; inTable = false; }
      const level = headingMatch[1].length;
      html += `<h${level}>${inline(headingMatch[2])}</h${level}>`;
      continue;
    }

    // Table row
    if (line.trim().startsWith("|")) {
      // Separator row (|---|---|)
      if (/^\|[\s\-:|]+\|$/.test(line.trim())) continue;

      const cells = line.split("|").slice(1, -1).map((c) => c.trim());
      if (!inTable) {
        if (inList) { html += "</ul>"; inList = false; }
        html += "<table><thead><tr>";
        cells.forEach((c) => (html += `<th>${inline(c)}</th>`));
        html += "</tr></thead><tbody>";
        inTable = true;
      } else {
        html += "<tr>";
        cells.forEach((c) => (html += `<td>${inline(c)}</td>`));
        html += "</tr>";
      }
      continue;
    }

    if (inTable) { html += "</tbody></table>"; inTable = false; }

    // Unordered list
    if (/^[-*]\s+/.test(line.trim())) {
      if (!inList) { html += "<ul>"; inList = true; }
      html += `<li>${inline(line.trim().replace(/^[-*]\s+/, ""))}</li>`;
      continue;
    }

    if (inList) { html += "</ul>"; inList = false; }

    // Blank line
    if (line.trim() === "") continue;

    // Paragraph
    html += `<p>${inline(line)}</p>`;
  }

  if (inList) html += "</ul>";
  if (inTable) html += "</tbody></table>";
  return html;
}

function inline(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`(.+?)`/g, "<code>$1</code>");
}

// Expose as global so app.js can use it regardless of whether `marked` loaded
window.renderMarkdown = typeof marked !== "undefined"
  ? (src) => marked.parse(src)
  : markdownToHtml;
