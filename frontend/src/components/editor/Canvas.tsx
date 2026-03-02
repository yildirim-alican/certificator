'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import DraggableItem from './DraggableItem_v3';

interface CanvasProps {
  orientation?: 'portrait' | 'landscape';
  backgroundColor?: string;
}

interface GuideLine {
  type: 'vertical' | 'horizontal';
  position: number;
}

interface DistanceGuide {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  label: string;
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
  const deleteElement = useEditorStore((state) => state.deleteElement);
  const addElement = useEditorStore((state) => state.addElement);
  const scale = useEditorStore((state) => state.scale);
  const showGuides = useEditorStore((state) => state.showGuides);
  const viewportRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [canvasRect, setCanvasRect] = useState<DOMRect | null>(null);
  const [fitScale, setFitScale] = useState(1);
  const [activeGuides, setActiveGuides] = useState<GuideLine[]>([]);
  const [distanceGuides, setDistanceGuides] = useState<DistanceGuide[]>([]);
  const [isAltPressed, setIsAltPressed] = useState(false);
  const [isCanvasActive, setIsCanvasActive] = useState(false);

  const A4_WIDTH_PX = 1240; // 210mm @ 150 DPI
  const A4_HEIGHT_PX = 1754; // 297mm @ 150 DPI

  const canvasWidth = orientation === 'landscape' ? A4_HEIGHT_PX : A4_WIDTH_PX;
  const canvasHeight = orientation === 'landscape' ? A4_WIDTH_PX : A4_HEIGHT_PX;
  const renderedScale = Math.min(scale, fitScale);
  const selectedElement = elements.find((element) => element.id === selectedElementId) || null;
  const sortedElements = useMemo(
    () => [...elements].sort((left, right) => left.zIndex - right.zIndex),
    [elements]
  );

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

  // Update canvas bounds for accurate position calculation
  useEffect(() => {
    const updateCanvasRect = () => {
      if (canvasRef.current) {
        setCanvasRect(canvasRef.current.getBoundingClientRect());
      }
    };

    updateCanvasRect();
    window.addEventListener('resize', updateCanvasRect);
    const intervalId = setInterval(updateCanvasRect, 100); // Update periodically

    return () => {
      window.removeEventListener('resize', updateCanvasRect);
      clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.altKey) {
        setIsAltPressed(true);
      }

      if (!isCanvasActive) {
        return;
      }

      const target = event.target as HTMLElement | null;
      const isTypingTarget =
        !!target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable);

      if (isTypingTarget) {
        return;
      }

      const selected = elements.find((entry) => entry.id === selectedElementId);
      const isSystemBoundary = !!selected?.id.startsWith('system-boundary-');

      if ((event.key === 'Delete' || event.key === 'Backspace') && selected && !isSystemBoundary) {
        event.preventDefault();
        deleteElement(selected.id);
        return;
      }

      if (event.key.startsWith('Arrow') && selected && !isSystemBoundary) {
        event.preventDefault();
        const step = event.shiftKey ? 1.5 : 0.5;
        const xDelta = event.key === 'ArrowLeft' ? -step : event.key === 'ArrowRight' ? step : 0;
        const yDelta = event.key === 'ArrowUp' ? -step : event.key === 'ArrowDown' ? step : 0;

        const nextX = Math.max(0, Math.min(100 - selected.width, selected.x + xDelta));
        const nextY = Math.max(0, Math.min(100 - selected.height, selected.y + yDelta));

        updateElement(selected.id, { x: nextX, y: nextY });
        return;
      }

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'd' && selected && !isSystemBoundary) {
        event.preventDefault();
        const duplicateId = `${selected.id}-copy-${Date.now()}`;
        const offset = 1.5;
        addElement({
          ...selected,
          id: duplicateId,
          label: `${selected.label} Copy`,
          x: Math.max(0, Math.min(100 - selected.width, selected.x + offset)),
          y: Math.max(0, Math.min(100 - selected.height, selected.y + offset)),
          zIndex: Math.max(...elements.map((entry) => entry.zIndex), 0) + 1,
        });
        setSelectedElementId(duplicateId);
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (!event.altKey) {
        setIsAltPressed(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [
    elements,
    selectedElementId,
    deleteElement,
    updateElement,
    addElement,
    setSelectedElementId,
    isCanvasActive,
  ]);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!viewportRef.current) return;
      setIsCanvasActive(viewportRef.current.contains(event.target as Node));
    };

    window.addEventListener('mousedown', handlePointerDown);
    return () => window.removeEventListener('mousedown', handlePointerDown);
  }, []);

  useEffect(() => {
    if (!isAltPressed) {
      setDistanceGuides([]);
    }
  }, [isAltPressed]);

  const handleElementSelect = useCallback(
    (elementId: string, e: React.MouseEvent) => {
      e.stopPropagation();
      setSelectedElementId(elementId);
    },
    [setSelectedElementId]
  );

  const handleCanvasClick = useCallback(() => {
    setSelectedElementId(null);
    setActiveGuides([]);
    setDistanceGuides([]);
  }, [setSelectedElementId]);

  const selectedCenterX = selectedElement ? selectedElement.x + selectedElement.width / 2 : null;
  const selectedCenterY = selectedElement ? selectedElement.y + selectedElement.height / 2 : null;
  const fallbackGuides: GuideLine[] = [];
  if (showGuides && selectedCenterX !== null && Math.abs(selectedCenterX - 50) <= 1.2) {
    fallbackGuides.push({ type: 'vertical', position: 50 });
  }
  if (showGuides && selectedCenterY !== null && Math.abs(selectedCenterY - 50) <= 1.2) {
    fallbackGuides.push({ type: 'horizontal', position: 50 });
  }
  const guidesToRender = activeGuides.length > 0 ? activeGuides : fallbackGuides;

  return (
    <div ref={viewportRef} className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 p-4 overflow-hidden min-h-[55vh] lg:min-h-0">
      <div
        ref={canvasRef}
        style={{
          width: `${canvasWidth * renderedScale}px`,
          height: `${canvasHeight * renderedScale}px`,
          aspectRatio: `${canvasWidth} / ${canvasHeight}`,
          backgroundColor,
          position: 'relative',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.15)',
          overflow: 'hidden',
          border: '1px solid #e5e7eb',
        }}
        onMouseDown={() => setIsCanvasActive(true)}
        onClick={handleCanvasClick}
      >
        {/* Guide Grid (optional) */}
        {showGuides && (
          <div
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              backgroundImage: `
                linear-gradient(0deg, transparent 24%, rgba(200, 200, 200, 0.07) 25%, rgba(200, 200, 200, 0.07) 26%, transparent 27%, transparent 74%, rgba(200, 200, 200, 0.07) 75%, rgba(200, 200, 200, 0.07) 76%, transparent 77%, transparent),
                linear-gradient(90deg, transparent 24%, rgba(200, 200, 200, 0.07) 25%, rgba(200, 200, 200, 0.07) 26%, transparent 27%, transparent 74%, rgba(200, 200, 200, 0.07) 75%, rgba(200, 200, 200, 0.07) 76%, transparent 77%, transparent)
              `,
              backgroundSize: `${50 * renderedScale}px ${50 * renderedScale}px`,
              pointerEvents: 'none',
              zIndex: 0,
            }}
          />
        )}

        {guidesToRender.map((guide, index) =>
          guide.type === 'vertical' ? (
            <div
              key={`guide-v-${index}`}
              style={{
                position: 'absolute',
                top: 0,
                left: `${guide.position}%`,
                transform: 'translateX(-50%)',
                width: '1px',
                height: '100%',
                backgroundColor: '#3b82f6',
                zIndex: 3,
                pointerEvents: 'none',
              }}
            />
          ) : (
            <div
              key={`guide-h-${index}`}
              style={{
                position: 'absolute',
                left: 0,
                top: `${guide.position}%`,
                transform: 'translateY(-50%)',
                width: '100%',
                height: '1px',
                backgroundColor: '#3b82f6',
                zIndex: 3,
                pointerEvents: 'none',
              }}
            />
          )
        )}

        {distanceGuides.map((guide, index) => {
          const isHorizontal = Math.abs(guide.y1 - guide.y2) < 0.01;
          const left = Math.min(guide.x1, guide.x2);
          const top = Math.min(guide.y1, guide.y2);
          const width = Math.abs(guide.x2 - guide.x1);
          const height = Math.abs(guide.y2 - guide.y1);

          return (
            <React.Fragment key={`distance-${index}`}>
              <div
                style={{
                  position: 'absolute',
                  left: `${left}%`,
                  top: `${top}%`,
                  width: isHorizontal
                    ? `${Math.max(width, 0.1)}%`
                    : `${Math.max(1 / renderedScale, 1)}px`,
                  height: isHorizontal
                    ? `${Math.max(1 / renderedScale, 1)}px`
                    : `${Math.max(height, 0.1)}%`,
                  backgroundColor: '#10b981',
                  zIndex: 4,
                  pointerEvents: 'none',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  left: `${isHorizontal ? left + width / 2 : guide.x1 + 0.8}%`,
                  top: `${isHorizontal ? guide.y1 + 0.8 : top + height / 2}%`,
                  transform: 'translate(-50%, -50%)',
                  fontSize: `${Math.max(10, 11 * renderedScale)}px`,
                  color: '#047857',
                  backgroundColor: '#ecfdf5',
                  border: '1px solid #6ee7b7',
                  borderRadius: '4px',
                  padding: '1px 4px',
                  zIndex: 5,
                  pointerEvents: 'none',
                  whiteSpace: 'nowrap',
                }}
              >
                {guide.label}
              </div>
            </React.Fragment>
          );
        })}

        {/* Elements Layer */}
        <div style={{ position: 'relative', width: '100%', height: '100%', zIndex: 1 }}>
          {sortedElements.map((element) => (
            <DraggableItem
              key={element.id}
              element={element}
              isSelected={selectedElementId === element.id}
              onSelect={(e) => handleElementSelect(element.id, e)}
              scale={renderedScale}
              canvasWidth={canvasWidth}
              canvasHeight={canvasHeight}
              canvasRect={canvasRect}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Canvas;
