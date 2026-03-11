'use client';

import { useCallback } from 'react';
import { CertificateTemplate } from '@/types/CertificateTemplate';
import { useToastStore } from '@/store/useToastStore';

// A4 render dimensions at 150 DPI (matches canvas editor)
const RENDER_DIM = {
  landscape: { width: 1754, height: 1240 },
  portrait:  { width: 1240, height: 1754 },
};

/** Build an off-screen div that mirrors the template layout for html2canvas capture */
async function renderTemplateToPDFBlob(
  template: CertificateTemplate,
  data: Record<string, string>
): Promise<Blob> {
  const [html2canvas, { jsPDF }] = await Promise.all([
    import('html2canvas').then((m) => m.default),
    import('jspdf'),
  ]);

  const isLandscape = template.orientation === 'landscape';
  const { width: renderWidth, height: renderHeight } =
    RENDER_DIM[isLandscape ? 'landscape' : 'portrait'];

  // Canvas design resolution (A4 @ 150 DPI). Since PDF render is also @ 150 DPI,
  // no scaling is needed — pixelScale is 1.0
  const canvasWidth  = isLandscape ? 1754 : 1240;
  const pixelScale   = renderWidth / canvasWidth; // = 1.0

  const container = document.createElement('div');
  Object.assign(container.style, {
    position: 'fixed',
    top: '-99999px',
    left: '-99999px',
    width: `${renderWidth}px`,
    height: `${renderHeight}px`,
    overflow: 'hidden',
    backgroundColor: template.backgroundColor || '#ffffff',
    zIndex: '-1',
  });

  const sorted = [...template.elements].sort((a, b) => a.zIndex - b.zIndex);

  for (const element of sorted) {
    if (element.visible === false) continue;
    const el = document.createElement('div');
    Object.assign(el.style, {
      position: 'absolute',
      left:   `${(element.x      / 100) * renderWidth}px`,
      top:    `${(element.y      / 100) * renderHeight}px`,
      width:  `${(element.width  / 100) * renderWidth}px`,
      height: `${(element.height / 100) * renderHeight}px`,
      transform: `rotate(${element.rotation}deg)`,
      zIndex: String(element.zIndex),
      boxSizing: 'border-box',
    });

    if (element.type === 'text') {
      let text = element.content || '';
      Object.entries(data).forEach(([key, value]) => {
        text = text.split(key).join(value || key);
      });
      const justifyMap: Record<string, string> = {
        left: 'flex-start', center: 'center', right: 'flex-end',
      };
      const scaledFontSize = Math.round((element.fontSize || 16) * pixelScale);
      const scaledLS       = ((element.letterSpacing || 0) * pixelScale).toFixed(2);
      const scaledPad      = Math.round(8 * pixelScale);
      Object.assign(el.style, {
        fontFamily:     element.fontFamily  || 'Arial',
        fontSize:       `${scaledFontSize}px`,
        fontWeight:     element.fontWeight  || 'normal',
        color:          element.color       || '#000000',
        textAlign:      element.textAlign   || 'left',
        lineHeight:     String(element.lineHeight || 1.5),
        letterSpacing:  `${scaledLS}px`,
        display:        'flex',
        alignItems:     'center',
        justifyContent: justifyMap[element.textAlign || 'left'] || 'flex-start',
        padding:        `${scaledPad}px`,
        wordBreak:      'break-word',
        whiteSpace:     'pre-wrap',
        opacity:        String(element.opacity ?? 1),
      });
      el.textContent = text;
    } else if (element.type === 'image') {
      const img = document.createElement('img');
      img.src = element.src || '';
      img.crossOrigin = 'anonymous';
      Object.assign(img.style, {
        width:     '100%',
        height:    '100%',
        objectFit: element.objectFit || 'contain',
        opacity:   String(element.opacity ?? 1),
        display:   'block',
      });
      el.appendChild(img);
    } else if (element.type === 'shape') {
      const scaledBW = Math.round((element.borderWidth || 0) * pixelScale);
      const bg = element.gradientEnabled
        ? `linear-gradient(${element.gradientAngle ?? 135}deg, ${element.gradientFrom ?? '#e2e8f0'}, ${element.gradientTo ?? '#94a3b8'})`
        : (element.backgroundColor || 'transparent');
      const br = element.shapeType === 'circle'
        ? '50%'
        : element.borderRadius
          ? `${Math.round(element.borderRadius * pixelScale)}px`
          : '0';
      Object.assign(el.style, {
        background:    bg,
        border:        scaledBW > 0 ? `${scaledBW}px solid ${element.borderColor || '#000000'}` : 'none',
        borderRadius:  br,
        clipPath:      element.shapeType === 'triangle' ? 'polygon(50% 0%, 0% 100%, 100% 100%)' : '',
        opacity:       String(element.opacity ?? 1),
      });
    }

    container.appendChild(el);
  }

  document.body.appendChild(container);

  try {
    const images = Array.from(container.querySelectorAll('img'));
    await Promise.all(
      images.map(
        (img) =>
          new Promise<void>((resolve) => {
            if (img.complete && img.naturalWidth > 0) resolve();
            else { img.onload = () => resolve(); img.onerror = () => resolve(); }
          })
      )
    );

    const canvas = await html2canvas(container, {
      scale: 1, useCORS: true, allowTaint: true,
      width: renderWidth, height: renderHeight,
      backgroundColor: template.backgroundColor || '#ffffff',
      logging: false,
    });

    const imgData  = canvas.toDataURL('image/jpeg', 0.92);
    const a4Width  = isLandscape ? 297 : 210;
    const a4Height = isLandscape ? 210 : 297;

    const pdf = new jsPDF({ orientation: isLandscape ? 'landscape' : 'portrait', unit: 'mm', format: 'a4' });
    pdf.addImage(imgData, 'JPEG', 0, 0, a4Width, a4Height);
    return pdf.output('blob');
  } finally {
    document.body.removeChild(container);
  }
}

function triggerDownload(blob: Blob, fileName: string): void {
  const url  = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url; link.download = fileName;
  document.body.appendChild(link); link.click();
  document.body.removeChild(link); URL.revokeObjectURL(url);
}

// ─── Public hook ─────────────────────────────────────────────────────────────

export const usePrinter = () => {
  const { addToast } = useToastStore();

  /** Generate and download a single PDF */
  const generatePDF = useCallback(
    async (
      template: CertificateTemplate,
      data: Record<string, string> = {},
      options: { fileName?: string } = {}
    ) => {
      try {
        const { fileName = `${template.name}.pdf` } = options;
        const blob = await renderTemplateToPDFBlob(template, data);
        triggerDownload(blob, fileName);
        addToast(`PDF downloaded: ${fileName}`, 'success');
        return { success: true, message: 'PDF downloaded', fileName };
      } catch (error) {
        addToast('Error generating PDF', 'error');
        throw error;
      }
    },
    [addToast]
  );

  /** Generate a preview and return its object URL (for iframe display) */
  const generatePreview = useCallback(
    async (template: CertificateTemplate, data: Record<string, string> = {}) => {
      const blob = await renderTemplateToPDFBlob(template, data);
      const url  = URL.createObjectURL(blob);
      return { success: true, url, blob };
    },
    []
  );

  /** Generate multiple PDFs and package them as a ZIP file */
  const generateBulkPDFs = useCallback(
    async (
      template: CertificateTemplate,
      dataArray: Record<string, string>[],
      options: { fileName?: string } = {}
    ) => {
      try {
        const { fileName = 'certificates.zip' } = options;
      const JSZip = (await import('jszip')).default;
      const zip   = new JSZip();

      for (let i = 0; i < dataArray.length; i++) {
        const rowData = dataArray[i];
        const blob    = await renderTemplateToPDFBlob(template, rowData);
        const name    =
          rowData['[recipient.name]'] ||
          rowData['name']             ||
          rowData['Name']             ||
          `certificate-${i + 1}`;
        zip.file(`${name}.pdf`, blob);
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      triggerDownload(zipBlob, fileName);
      addToast(`Generated ${dataArray.length} certificates`, 'success');

      return { success: true, message: `Generated ${dataArray.length} certificates`, count: dataArray.length };
      } catch (error) {
        addToast('Error generating bulk certificates', 'error');
        throw error;
      }
    },
    [addToast]
  );

  return { generatePDF, generatePreview, generateBulkPDFs };
};
