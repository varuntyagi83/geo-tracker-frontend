'use client';
// lib/pdf-export.ts
// Exports the GEO Visibility PDF Report by rendering [data-pdf-page] sections with html2canvas

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Renders each [data-pdf-page] element inside containerElement to a JPEG canvas
 * and assembles them into a multi-page A4 PDF, then triggers a browser download.
 *
 * @param containerElement - The root DOM element that wraps all report sections
 * @param brandName        - Used to generate the PDF filename
 * @param onProgress       - Optional callback receiving (percent 0-100, label string)
 */
export async function exportReportToPDF(
  containerElement: HTMLElement,
  brandName: string,
  onProgress?: (pct: number, label: string) => void
): Promise<void> {
  // A4 dimensions in mm
  const pdfWidth = 210;
  const pdfHeight = 297;

  // Collect all page sections
  const pageElements = Array.from(
    containerElement.querySelectorAll<HTMLElement>('[data-pdf-page]')
  );
  const total = pageElements.length;

  if (total === 0) {
    console.warn('[pdf-export] No [data-pdf-page] elements found inside containerElement.');
    return;
  }

  const pdf = new jsPDF('p', 'mm', 'a4');

  for (let i = 0; i < total; i++) {
    const pageEl = pageElements[i];

    // Report progress before rendering each section
    onProgress?.(
      Math.round((i / total) * 85),
      `Rendering section ${i + 1} of ${total}`
    );

    // Render the section to a canvas
    const canvas = await html2canvas(pageEl, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#0f172a',
      logging: false,
    });

    // Convert to JPEG data URL
    const imgData = canvas.toDataURL('image/jpeg', 0.92);

    // Calculate the rendered image height in mm at A4 width
    const imgHeightMM = (canvas.height / canvas.width) * pdfWidth;

    // Add a new page for every section after the first
    if (i > 0) {
      pdf.addPage();
    }

    if (imgHeightMM <= pdfHeight) {
      // Content fits on a single A4 page
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, imgHeightMM);
    } else {
      // Content is taller than one A4 page — slice into multiple pages
      // We work in canvas-pixel space and map slices to mm
      const pixelsPerMM = canvas.width / pdfWidth;
      const sliceHeightPx = Math.round(pdfHeight * pixelsPerMM);
      let offsetPx = 0;

      while (offsetPx < canvas.height) {
        // Create a temporary canvas for this slice
        const sliceCanvas = document.createElement('canvas');
        const remainingPx = canvas.height - offsetPx;
        const thisSlicePx = Math.min(sliceHeightPx, remainingPx);

        sliceCanvas.width = canvas.width;
        sliceCanvas.height = thisSlicePx;

        const ctx = sliceCanvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(
            canvas,
            0,
            offsetPx,
            canvas.width,
            thisSlicePx,
            0,
            0,
            canvas.width,
            thisSlicePx
          );
        }

        const sliceImgData = sliceCanvas.toDataURL('image/jpeg', 0.92);
        const sliceHeightMM = (thisSlicePx / canvas.width) * pdfWidth;

        if (offsetPx > 0) {
          pdf.addPage();
        }

        pdf.addImage(sliceImgData, 'JPEG', 0, 0, pdfWidth, sliceHeightMM);

        offsetPx += thisSlicePx;
      }
    }
  }

  // Signal completion and save
  onProgress?.(100, 'Saving PDF...');

  const dateStr = new Date().toISOString().split('T')[0];
  const safeBrandName = brandName.replace(/\s+/g, '-');
  pdf.save(`${safeBrandName}-GEO-Report-${dateStr}.pdf`);
}
