'use client';
// lib/pdf-export.ts

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const SCALE = 1.5;          // Down from 2 — still 144 DPI on A4, far smaller file
const JPEG_QUALITY = 0.87;  // JPEG vs PNG: ~90% smaller files
const PDF_W = 210;          // A4 width in mm
const PDF_H = 297;          // A4 height in mm
const SECTION_GAP = 4;      // mm gap drawn between consecutive sections on the same page

// #0f172a decomposed for jsPDF setFillColor
const BG_R = 15, BG_G = 23, BG_B = 42;

function fillPageDark(pdf: jsPDF): void {
  pdf.setFillColor(BG_R, BG_G, BG_B);
  pdf.rect(0, 0, PDF_W, PDF_H, 'F');
}

/**
 * Renders each [data-pdf-page] element to a JPEG canvas and assembles an A4 PDF.
 *
 * Key improvements over the previous version:
 *  - JPEG compression (not PNG) → ~90% smaller files
 *  - scale 1.5 instead of 2 → 44% fewer pixels, still sharp
 *  - Bin-packing: short sections share a page — no half-empty pages
 *  - Dark background filled on every PDF page so gaps between sections are dark
 *  - Page numbers added after all pages are assembled
 *  - onclone moves the off-screen container to position:static so text spacing renders correctly
 */
export async function exportReportToPDF(
  containerElement: HTMLElement,
  brandName: string,
  onProgress?: (pct: number, label: string) => void
): Promise<void> {
  const pageElements = Array.from(
    containerElement.querySelectorAll<HTMLElement>('[data-pdf-page]')
  );
  const total = pageElements.length;

  if (total === 0) {
    console.warn('[pdf-export] No [data-pdf-page] elements found.');
    return;
  }

  const pdf = new jsPDF('p', 'mm', 'a4');
  fillPageDark(pdf);

  let currentY = 0; // mm from top of the current page

  for (let i = 0; i < total; i++) {
    const pageEl = pageElements[i];

    onProgress?.(Math.round((i / total) * 88), `Rendering section ${i + 1} of ${total}`);

    const canvas = await html2canvas(pageEl, {
      scale: SCALE,
      useCORS: true,
      backgroundColor: '#0f172a',
      logging: false,
      onclone: (clonedDoc: Document) => {
        const container = clonedDoc.querySelector<HTMLElement>('[data-pdf-container]');
        if (container) {
          container.style.position = 'static';
          container.style.left = 'auto';
          container.style.top = 'auto';
        }
      },
    });

    const pixPerMM = canvas.width / PDF_W;
    const sectionH = canvas.height / pixPerMM; // section height in mm

    if (sectionH <= PDF_H) {
      // ── Short section: try to pack it onto the current page ──────────────
      const gap = currentY > 0 ? SECTION_GAP : 0;
      if (currentY > 0 && currentY + gap + sectionH > PDF_H) {
        // Doesn't fit — start a new page
        pdf.addPage();
        fillPageDark(pdf);
        currentY = 0;
      }
      const drawY = currentY + (currentY > 0 ? SECTION_GAP : 0);
      const imgData = canvas.toDataURL('image/jpeg', JPEG_QUALITY);
      pdf.addImage(imgData, 'JPEG', 0, drawY, PDF_W, sectionH);
      currentY = drawY + sectionH;
    } else {
      // ── Tall section: slice it across multiple pages ──────────────────────
      let offsetPx = 0;

      while (offsetPx < canvas.height) {
        const remainingPx = canvas.height - offsetPx;
        const availableH = offsetPx === 0 ? PDF_H - currentY : PDF_H;
        const availablePx = Math.round(availableH * pixPerMM);
        const slicePx = Math.min(availablePx, remainingPx);

        // Skip a tiny trailing sliver (< 5% of a page)
        const isLast = offsetPx + slicePx >= canvas.height;
        if (isLast && slicePx < availablePx * 0.05) break;

        const sliceCanvas = document.createElement('canvas');
        sliceCanvas.width = canvas.width;
        sliceCanvas.height = slicePx;
        const ctx = sliceCanvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(canvas, 0, offsetPx, canvas.width, slicePx, 0, 0, canvas.width, slicePx);
        }

        const sliceH = slicePx / pixPerMM;
        const sliceImg = sliceCanvas.toDataURL('image/jpeg', JPEG_QUALITY);
        pdf.addImage(sliceImg, 'JPEG', 0, currentY, PDF_W, sliceH);

        offsetPx += slicePx;
        currentY += sliceH;

        if (offsetPx < canvas.height) {
          pdf.addPage();
          fillPageDark(pdf);
          currentY = 0;
        }
      }
    }
  }

  // ── Page numbers ──────────────────────────────────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pageCount: number = (pdf as any).internal.getNumberOfPages();
  for (let p = 1; p <= pageCount; p++) {
    pdf.setPage(p);
    pdf.setFontSize(7.5);
    pdf.setTextColor(100, 116, 139); // #64748b slate-500
    pdf.text(
      `${brandName}  ·  GEO Raydar  ·  Page ${p} of ${pageCount}`,
      PDF_W / 2,
      PDF_H - 4,
      { align: 'center' }
    );
  }

  onProgress?.(100, 'Saving PDF...');

  const dateStr = new Date().toISOString().split('T')[0];
  const safeBrandName = brandName.replace(/\s+/g, '-');
  pdf.save(`${safeBrandName}-GEO-Report-${dateStr}.pdf`);
}

/**
 * Opens the rendered report HTML in a new browser tab.
 */
export function openReportAsHTML(
  containerElement: HTMLElement,
  brandName: string
): void {
  const clone = containerElement.cloneNode(true) as HTMLElement;

  clone.style.position = 'static';
  clone.style.left = 'auto';
  clone.style.top = 'auto';
  clone.style.width = '794px';
  clone.style.margin = '0 auto';
  clone.style.padding = '40px 0';
  clone.style.background = '#0f172a';

  const dateStr = new Date().toLocaleDateString('en-GB');
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${brandName} — GEO Visibility Report · ${dateStr}</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #060f1e;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 32px 16px 64px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }
    [data-pdf-page] {
      margin-bottom: 32px;
      border-radius: 16px;
      box-shadow: 0 4px 40px rgba(0,0,0,0.5);
      overflow: hidden;
    }
    svg { overflow: visible; }
  </style>
</head>
<body>
  ${clone.outerHTML}
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
