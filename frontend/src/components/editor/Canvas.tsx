'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import DraggableItem from './DraggableItem';

interface CanvasProps {
  orientation?: 'portrait' | 'landscape';
  backgroundColor?: string;
}

/**
 * Canvas Component with Drag-Drop Support
 *
 * Enhanced canvas with:
 * - Drag-to-move elements
 * - Drag corners to resize
 * - Selection highlighting
 * - A4 aspect ratio preservation
 *
 * Uses React-RnD internally via DraggableItem component.
 */
const Canvas: React.FC<CanvasProps> = ({
  orientation = 'portrait',
  backgroundColor = '#ffffff',
}) => {
  const elements = useEditorStore((state) => state.elements);
  const selectedElementId = useEditorStore((state) => state.selectedElementId);
  const setSelectedElementId = useEditorStore((state) => state.setSelectedElementId);
  const updateElement = useEditorStore((state) => state.updateElement);
  const scale = useEditorStore((state) => state.scale);
  const viewportRef = useRef<HTMLDivElement>(null);
  const [fitScale, setFitScale] = useState(1);

  const A4_WIDTH_PX = 1240; // 210mm @ 150 DPI
  const A4_HEIGHT_PX = 1754; // 297mm @ 150 DPI

  const canvasWidth = orientation === 'landscape' ? A4_HEIGHT_PX : A4_WIDTH_PX;
  const canvasHeight = orientation === 'landscape' ? A4_WIDTH_PX : A4_HEIGHT_PX;
  const renderedScale = Math.min(scale, fitScale);

  useEffect(() => {
    const recalculate = () => {
      if (!viewportRef.current) return;

      const bounds = viewportRef.current.getBoundingClientRect();
      const availableWidth = Math.max(320, bounds.width - 32);
      const availableHeight = Math.max(320, bounds.height - 32);

      const widthScale = availableWidth / canvasWidth;
      const heightScale = availableHeight / canvasHeight;
      const nextFit = Math.min(widthScale, heightScale, 1);
      setFitScale(nextFit);
    };

    recalculate();
    window.addEventListener('resize', recalculate);
    return () => window.removeEventListener('resize', recalculate);
  }, [canvasWidth, canvasHeight]);

  const handleElementSelect = useCallback(
    (elementId: string, e: React.MouseEvent) => {
      e.stopPropagation();
      setSelectedElementId(elementId);
    },
    [setSelectedElementId]
  );

  const handleCanvasClick = useCallback(() => {
    setSelectedElementId(null);
  }, [setSelectedElementId]);

  const handleElementDrag = useCallback(
    (elementId: string, deltaX: number, deltaY: number) => {
      const element = elements.find((el) => el.id === elementId);
      if (!element) return;

      // Convert pixel delta to percentage
      const percentDeltaX = (deltaX / canvasWidth) * 100;
      const percentDeltaY = (deltaY / canvasHeight) * 100;

      const newX = Math.max(0, Math.min(100, element.x + percentDeltaX));
      const newY = Math.max(0, Math.min(100, element.y + percentDeltaY));

      updateElement(elementId, { x: newX, y: newY });
    },
    [elements, canvasWidth, canvasHeight, updateElement]
  );

  const handleElementResize = useCallback(
    (elementId: string, newWidth: number, newHeight: number) => {
      // Convert pixel dimensions to percentage
      const percentWidth = (newWidth / canvasWidth) * 100;
      const percentHeight = (newHeight / canvasHeight) * 100;

      updateElement(elementId, {
        width: Math.max(5, Math.min(100, percentWidth)),
        height: Math.max(5, Math.min(100, percentHeight)),
      });
    },
    [canvasWidth, canvasHeight, updateElement]
  );

  return (
    <div ref={viewportRef} className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 p-4 overflow-hidden min-h-[55vh] lg:min-h-0">
      <div
        style={{
          width: `${canvasWidth * renderedScale}px`,
          height: `${canvasHeight * renderedScale}px`,
          backgroundColor,
          position: 'relative',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.15)',
          overflow: 'hidden',
          border: '1px solid #e5e7eb',
        }}
        onClick={handleCanvasClick}
      >
        {/* Guide Grid (optional) */}
        <div
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            backgroundImage: `
              linear-gradient(0deg, transparent 24%, rgba(200, 200, 200, 0.05) 25%, rgba(200, 200, 200, 0.05) 26%, transparent 27%, transparent 74%, rgba(200, 200, 200, 0.05) 75%, rgba(200, 200, 200, 0.05) 76%, transparent 77%, transparent),
              linear-gradient(90deg, transparent 24%, rgba(200, 200, 200, 0.05) 25%, rgba(200, 200, 200, 0.05) 26%, transparent 27%, transparent 74%, rgba(200, 200, 200, 0.05) 75%, rgba(200, 200, 200, 0.05) 76%, transparent 77%, transparent)
            `,
            backgroundSize: `${50 * renderedScale}px ${50 * renderedScale}px`,
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />

        {/* Elements Layer */}
        <div style={{ position: 'relative', width: '100%', height: '100%', zIndex: 1 }}>
          {elements.map((element) => (
            <DraggableItem
              key={element.id}
              element={element}
              isSelected={selectedElementId === element.id}
              onSelect={(e) => handleElementSelect(element.id, e)}
              onDrag={(dx, dy) => handleElementDrag(element.id, dx, dy)}
              onResize={(w, h) => handleElementResize(element.id, w, h)}
              scale={renderedScale}
              canvasWidth={canvasWidth}
              canvasHeight={canvasHeight}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Canvas;
