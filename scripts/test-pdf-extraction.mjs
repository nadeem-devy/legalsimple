/**
 * Test script: verifies pdfjs-dist extraction produces all pages/lines from a PDF.
 * Usage: node scripts/test-pdf-extraction.mjs <path-to-pdf>
 *        node scripts/test-pdf-extraction.mjs  (uses a generated test PDF)
 */
import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

async function extractPdfPages(buffer) {
  const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");

  const data = new Uint8Array(buffer);
  const doc = await pdfjsLib.getDocument({ data, useSystemFonts: true }).promise;

  console.log(`\n=== PDF has ${doc.numPages} pages ===\n`);

  const pages = [];
  const allText = [];

  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();

    const items = content.items.filter(
      (item) => "str" in item && "transform" in item
    );

    console.log(`Page ${i}: ${items.length} text items`);

    if (items.length === 0) {
      pages.push({ num: i, lines: [], text: "" });
      continue;
    }

    // Sort by y (descending = top to bottom) then x (left to right)
    const sorted = [...items].sort((a, b) => {
      const yDiff = b.transform[5] - a.transform[5];
      if (Math.abs(yDiff) > 2) return yDiff;
      return a.transform[4] - b.transform[4];
    });

    // Group into lines — items within 3 units of y are same line
    const rawLines = [];
    let currentLineY = sorted[0].transform[5];
    let currentLineText = [];
    let currentFontSize = sorted[0].height || 12;

    for (const item of sorted) {
      const y = item.transform[5];
      if (Math.abs(y - currentLineY) > 3) {
        const lineText = currentLineText.join("").trim();
        if (lineText) {
          rawLines.push({ text: lineText, y: currentLineY, fontSize: currentFontSize });
        }
        currentLineY = y;
        currentLineText = [item.str];
        currentFontSize = item.height || 12;
      } else {
        currentLineText.push(item.str);
      }
    }
    const lastText = currentLineText.join("").trim();
    if (lastText) {
      rawLines.push({ text: lastText, y: currentLineY, fontSize: currentFontSize });
    }

    console.log(`  -> ${rawLines.length} raw lines`);

    // Convert to string lines with paragraph breaks
    const lines = [];
    for (let j = 0; j < rawLines.length; j++) {
      const line = rawLines[j];
      if (j > 0) {
        const prevY = rawLines[j - 1].y;
        const gap = prevY - line.y;
        const avgFontSize = (rawLines[j - 1].fontSize + line.fontSize) / 2;
        if (gap > avgFontSize * 1.8) {
          lines.push("");
        }
      }
      lines.push(line.text);
    }

    const pageText = lines.join("\n");
    pages.push({ num: i, lines, text: pageText });
    allText.push(pageText);

    // Show first 3 and last 3 lines
    const nonEmpty = rawLines.map(l => l.text);
    if (nonEmpty.length <= 6) {
      nonEmpty.forEach((l, idx) => console.log(`  [${idx}] ${l}`));
    } else {
      nonEmpty.slice(0, 3).forEach((l, idx) => console.log(`  [${idx}] ${l}`));
      console.log(`  ... (${nonEmpty.length - 6} more lines) ...`);
      nonEmpty.slice(-3).forEach((l, idx) => console.log(`  [${nonEmpty.length - 3 + idx}] ${l}`));
    }
  }

  const fullText = allText.join("\n\n");

  // Now do the block splitting
  const blocks = [];
  for (const page of pages) {
    const paragraphs = page.text
      .split(/\n\s*\n/)
      .map((p) => p.replace(/\n/g, " ").replace(/\s+/g, " ").trim())
      .filter((p) => p.length > 0);

    if (paragraphs.length === 0 && page.text.trim()) {
      for (const line of page.lines) {
        if (line.trim()) {
          blocks.push({
            id: `b-${blocks.length}`,
            text: line.trim(),
            pageNum: page.num,
          });
        }
      }
    } else {
      for (const para of paragraphs) {
        blocks.push({
          id: `b-${blocks.length}`,
          text: para,
          pageNum: page.num,
        });
      }
    }
  }

  console.log(`\n=== SUMMARY ===`);
  console.log(`Total pages: ${pages.length}`);
  console.log(`Total blocks: ${blocks.length}`);
  console.log(`Full text length: ${fullText.length} chars`);
  console.log(`Blocks per page:`);
  const pageCounts = {};
  blocks.forEach(b => { pageCounts[b.pageNum] = (pageCounts[b.pageNum] || 0) + 1; });
  Object.entries(pageCounts).forEach(([p, c]) => console.log(`  Page ${p}: ${c} blocks`));

  // Write full text to file for inspection
  writeFileSync("scripts/extracted-text.txt", fullText);
  console.log(`\nFull text written to scripts/extracted-text.txt`);

  // Write blocks to JSON for inspection
  writeFileSync("scripts/extracted-blocks.json", JSON.stringify(blocks, null, 2));
  console.log(`Blocks written to scripts/extracted-blocks.json`);
}

// Main
const pdfPath = process.argv[2];
if (!pdfPath) {
  console.log("Usage: node scripts/test-pdf-extraction.mjs <path-to-pdf>");
  console.log("\nNo PDF provided. Please provide a path to a PDF file.");
  process.exit(1);
}

const absPath = resolve(pdfPath);
console.log(`Reading PDF: ${absPath}`);
const buffer = readFileSync(absPath);
await extractPdfPages(buffer);
