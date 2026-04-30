'use client';
// lib/pdf-export.ts

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Renders each [data-pdf-page] element to a PNG canvas and assembles an A4 PDF.
 *
 * Key technique: the `onclone` callback moves the cloned element to a visible
 * position in the document before html2canvas renders it, preventing the
 * browser from collapsing word/letter spacing for off-screen elements.
 */
export async function exportReportToPDF(
  containerElement: HTMLElement,
  brandName: string,
  onProgress?: (pct: number, label: string) => void
): Promise<void> {
  const pdfWidth = 210;
  const pdfHeight = 297;

  const pageElements = Array.from(
    containerElement.querySelectorAll<HTMLElement>('[data-pdf-page]')
  );
  const total = pageElements.length;

  if (total === 0) {
    console.warn('[pdf-export] No [data-pdf-page] elements found.');
    return;
  }

  const pdf = new jsPDF('p', 'mm', 'a4');
  let firstPage = true;

  for (let i = 0; i < total; i++) {
    const pageEl = pageElements[i];

    onProgress?.(
      Math.round((i / total) * 85),
      `Rendering section ${i + 1} of ${total}`
    );

    const canvas = await html2canvas(pageEl, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#0f172a',
      logging: false,
      // Fix: bring the off-screen container into the viewport so the browser
      // renders text with correct word/letter spacing instead of collapsing it
      onclone: (clonedDoc: Document) => {
        const container = clonedDoc.querySelector<HTMLElement>('[data-pdf-container]');
        if (container) {
          container.style.position = 'static';
          container.style.left = 'auto';
          container.style.top = 'auto';
        }
      },
    });

    const imgHeightMM = (canvas.height / canvas.width) * pdfWidth;
    const pixelsPerMM = canvas.width / pdfWidth;
    const sliceHeightPx = Math.round(pdfHeight * pixelsPerMM);

    if (imgHeightMM <= pdfHeight) {
      // Fits on a single A4 page
      if (!firstPage) pdf.addPage();
      firstPage = false;
      const imgData = canvas.toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, imgHeightMM);
    } else {
      // Slice into multiple A4 pages
      let offsetPx = 0;
      let firstSlice = true;

      while (offsetPx < canvas.height) {
        const remainingPx = canvas.height - offsetPx;
        const thisSlicePx = Math.min(sliceHeightPx, remainingPx);

        // Skip a near-empty trailing slice (< 8% of A4) to eliminate blank pages
        const isLastSlice = offsetPx + thisSlicePx >= canvas.height;
        if (isLastSlice && thisSlicePx < sliceHeightPx * 0.08) {
          break;
        }

        const sliceCanvas = document.createElement('canvas');
        sliceCanvas.width = canvas.width;
        sliceCanvas.height = thisSlicePx;

        const ctx = sliceCanvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(
            canvas,
            0, offsetPx, canvas.width, thisSlicePx,
            0, 0, canvas.width, thisSlicePx
          );
        }

        const sliceImgData = sliceCanvas.toDataURL('image/png');
        const sliceHeightMM = (thisSlicePx / canvas.width) * pdfWidth;

        if (!firstPage || !firstSlice) pdf.addPage();
        firstPage = false;
        firstSlice = false;

        pdf.addImage(sliceImgData, 'PNG', 0, 0, pdfWidth, sliceHeightMM);
        offsetPx += thisSlicePx;
      }
    }
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

  // Strip the off-screen positioning
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
