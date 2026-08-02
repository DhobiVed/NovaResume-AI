import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * Fallback browser print trigger that opens a print dialog set to A4
 */
export function triggerPrintPdf(element: HTMLElement, filename: string): void {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    window.print();
    return;
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${filename}</title>
        <style>
          @page { size: A4 portrait; margin: 0; }
          html, body { margin: 0; padding: 0; background: #ffffff; width: 210mm; height: 297mm; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          * { box-sizing: border-box; }
        </style>
      </head>
      <body>
        <div style="width: 794px; min-height: 1123px; margin: 0; padding: 0;">
          ${element.innerHTML}
        </div>
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          };
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
}

/**
 * Single-page A4 PDF Exporter using html2canvas & jsPDF with lossless PNG & exact A4 bounds
 */
export async function exportSinglePagePdf(
  element: HTMLElement,
  filename: string = 'resume'
): Promise<void> {
  try {
    // 1. Convert remote profile images to inline data URLs to prevent CORS taints
    const images = element.querySelectorAll('img');
    const imagePromises = Array.from(images).map(async (img) => {
      try {
        if (img.src.startsWith('http') && !img.src.startsWith(window.location.origin)) {
          const response = await fetch(img.src, { mode: 'cors' });
          const blob = await response.blob();
          return new Promise<void>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              img.src = reader.result as string;
              resolve();
            };
            reader.onerror = () => resolve();
            reader.readAsDataURL(blob);
          });
        }
      } catch {
        // Keep original if fetch fails
      }
    });

    await Promise.all(imagePromises);

    // 2. Capture crisp canvas at exact 794px x 1123px bounds with onclone optimization
    const canvas = await html2canvas(element, {
      scale: 3,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      width: 794,
      height: 1123,
      windowWidth: 794,
      windowHeight: 1123,
      x: 0,
      y: 0,
      scrollX: 0,
      scrollY: 0,
      onclone: (clonedDoc) => {
        // Ensure cloned body and element have zero margins or extra offsets
        const clonedBody = clonedDoc.body;
        if (clonedBody) {
          clonedBody.style.margin = '0';
          clonedBody.style.padding = '0';
          clonedBody.style.overflow = 'hidden';
        }
        // Normalize letter spacing & sanitize oklch colors for html2canvas compatibility
        const allElements = clonedDoc.querySelectorAll('*');
        allElements.forEach((el) => {
          const htmlEl = el as HTMLElement;
          if (htmlEl.style) {
            (htmlEl.style as any).webkitFontSmoothing = 'antialiased';
            if (htmlEl.style.letterSpacing && htmlEl.style.letterSpacing.includes('em')) {
              htmlEl.style.letterSpacing = '0.5px';
            }
          }
          try {
            const comp = window.getComputedStyle(htmlEl);
            if (comp.color && comp.color.includes('oklch')) {
              htmlEl.style.color = comp.color.startsWith('oklch') ? '#0f172a' : comp.color;
            }
            if (comp.backgroundColor && comp.backgroundColor.includes('oklch')) {
              htmlEl.style.backgroundColor = comp.backgroundColor.startsWith('oklch') ? '#ffffff' : comp.backgroundColor;
            }
            if (comp.borderColor && comp.borderColor.includes('oklch')) {
              htmlEl.style.borderColor = comp.borderColor.startsWith('oklch') ? '#e2e8f0' : comp.borderColor;
            }
          } catch {
            // Ignore style computation errors on detached elements
          }
        });
      }
    });

    // 3. Lossless PNG Data URL for 100% sharp text & zero border artifacts
    const imgData = canvas.toDataURL('image/png');

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    // Exact A4 Dimensions: 210mm x 297mm with zero margins
    pdf.addImage(imgData, 'PNG', 0, 0, 210, 297, undefined, 'FAST');
    pdf.save(`${filename}.pdf`);
  } catch (error) {
    console.warn('html2canvas export error, switching to print fallback:', error);
    triggerPrintPdf(element, filename);
  }
}

/**
 * Multi-page A4 PDF Exporter
 */
export async function exportToPdf(
  element: HTMLElement,
  filename: string = 'resume'
): Promise<void> {
  return exportSinglePagePdf(element, filename);
}
