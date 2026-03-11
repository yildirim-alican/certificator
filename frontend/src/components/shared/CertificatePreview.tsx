'use client';

import React from 'react';
import { CertificateTemplate, CertificateElement } from '@/types/CertificateTemplate';

interface CertificatePreviewProps {
  template: CertificateTemplate;
  /** Optional variable substitutions */
  data?: Record<string, string>;
  /** Display width in pixels (height is auto from aspect ratio) */
  displayWidth?: number;
  className?: string;
}

function substituteText(text: string, data: Record<string, string>): string {
  let result = text;
  for (const [key, value] of Object.entries(data)) {
    result = result.split(key).join(value || key);
  }
  return result;
}

function ElementRenderer({
  element,
  data,
}: {
  element: CertificateElement;
  data: Record<string, string>;
}) {
  if (element.visible === false) return null;

  const baseStyle: React.CSSProperties = {
    position: 'absolute',
    left: `${element.x}%`,
    top: `${element.y}%`,
    width: `${element.width}%`,
    height: `${element.height}%`,
    transform: `rotate(${element.rotation}deg)`,
    zIndex: element.zIndex,
    boxSizing: 'border-box',
    opacity: element.visible ? 1 : 0.4,
  };

  if (element.type === 'text') {
    const justifyMap: Record<string, string> = {
      left: 'flex-start',
      center: 'center',
      right: 'flex-end',
    };
    return (
      <div style={baseStyle}>
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: justifyMap[element.textAlign || 'left'] || 'flex-start',
            fontFamily: element.fontFamily || 'Arial',
            fontSize: `${element.fontSize || 16}px`,
            fontWeight: element.fontWeight as React.CSSProperties['fontWeight'],
            color: element.color || '#000000',
            textAlign: element.textAlign as React.CSSProperties['textAlign'],
            lineHeight: element.lineHeight,
            letterSpacing: `${element.letterSpacing || 0}px`,
            padding: '8px',
            boxSizing: 'border-box',
            whiteSpace: 'pre-wrap',
            overflowWrap: 'anywhere',
            opacity: element.opacity ?? 1,
          }}
        >
          {substituteText(element.content || '', data)}
        </div>
      </div>
    );
  }

  if (element.type === 'image') {
    return (
      <div style={baseStyle}>
        {element.src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={element.src}
            alt={element.label}
            style={{
              width: '100%',
              height: '100%',
              objectFit: (element.objectFit as React.CSSProperties['objectFit']) || 'contain',
              opacity: element.opacity ?? 1,
              display: 'block',
            }}
          />
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: '#f3f4f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '10px',
              color: '#9ca3af',
            }}
          >
            IMG
          </div>
        )}
      </div>
    );
  }

  if (element.type === 'shape') {
    const bg = element.gradientEnabled
      ? `linear-gradient(${element.gradientAngle ?? 135}deg, ${element.gradientFrom ?? '#e2e8f0'}, ${element.gradientTo ?? '#94a3b8'})`
      : element.backgroundColor || 'transparent';
    const br =
      element.shapeType === 'circle'
        ? '50%'
        : element.borderRadius
          ? `${element.borderRadius}px`
          : '0';

    return (
      <div style={baseStyle}>
        <div
          style={{
            width: '100%',
            height: '100%',
            background: bg,
            border:
              (element.borderWidth || 0) > 0
                ? `${element.borderWidth}px solid ${element.borderColor || '#000'}`
                : 'none',
            borderRadius: br,
            clipPath:
              element.shapeType === 'triangle'
                ? 'polygon(50% 0%, 0% 100%, 100% 100%)'
                : undefined,
            opacity: element.opacity ?? 1,
            boxSizing: 'border-box',
          }}
        />
      </div>
    );
  }

  return null;
}

/**
 * CertificatePreview
 *
 * Renders a certificate template as a pure HTML/CSS scaled preview.
 * No canvas capture required — works immediately with zero async.
 * Suitable for thumbnails in CertCard and full preview in ExportModal.
 */
const CertificatePreview: React.FC<CertificatePreviewProps> = ({
  template,
  data = {},
  displayWidth = 320,
  className = '',
}) => {
  const isLandscape = template.orientation === 'landscape';
  // Canvas logical resolution (A4 @ 150 DPI)
  const logicalW = isLandscape ? 1754 : 1240;
  const logicalH = isLandscape ? 1240 : 1754;
  const scale = displayWidth / logicalW;
  const displayHeight = Math.round(logicalH * scale);

  const sorted = [...(template.elements || [])].sort((a, b) => a.zIndex - b.zIndex);

  return (
    <div
      className={className}
      style={{
        width: displayWidth,
        height: displayHeight,
        overflow: 'hidden',
        position: 'relative',
        flexShrink: 0,
      }}
    >
      {/* Scaled inner canvas */}
      <div
        style={{
          width: logicalW,
          height: logicalH,
          backgroundColor: template.backgroundColor || '#ffffff',
          position: 'relative',
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          pointerEvents: 'none',
        }}
      >
        {sorted.map((el) => (
          <ElementRenderer key={el.id} element={el} data={data} />
        ))}
      </div>
    </div>
  );
};

export default CertificatePreview;
