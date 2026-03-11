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

interface AlignmentGuide {
  type: 'vertical' | 'horizontal';
  position: number;
  label: string;
  isEquidistant?: boolean;
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
  const selectedElementIds = useEditorStore((state) => state.selectedElementIds);
  const setSelectedElementIds = useEditorStore((state) => state.setSelectedElementIds);
  const deleteElements = useEditorStore((state) => state.deleteElements);
  const viewportRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [canvasRect, setCanvasRect] = useState<DOMRect | null>(null);
  const [fitScale, setFitScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const isPanningRef = useRef(false);
  const panStartRef = useRef({ clientX: 0, clientY: 0, panX: 0, panY: 0 });
  const isSpaceDownRef = useRef(false);
  const [activeGuides, setActiveGuides] = useState<GuideLine[]>([]);
  const [distanceGuides, setDistanceGuides] = useState<DistanceGuide[]>([]);
  const [alignmentGuides, setAlignmentGuides] = useState<AlignmentGuide[]>([]);
  const [isCanvasActive, setIsCanvasActive] = useState(false);
  // Rubber-band selection
  const [rubberBand, setRubberBand] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const rubberBandStartRef = useRef<{ x: number; y: number } | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isAltPressed, setIsAltPressed] = useState(false);

  const A4_WIDTH_PX = 1240; // 210mm @ 150 DPI
  const A4_HEIGHT_PX = 1754; // 297mm @ 150 DPI

  const canvasWidth = orientation === 'landscape' ? A4_HEIGHT_PX : A4_WIDTH_PX;
  const canvasHeight = orientation === 'landscape' ? A4_WIDTH_PX : A4_HEIGHT_PX;
  // scale (from store) is the user zoom multiplier (1 = fit, 2 = 2x, etc.)
  const renderedScale = fitScale * scale;
  const selectedElement = elements.find((element) => element.id === selectedElementId) || null;
  const sortedElements = useMemo(
    () => [...elements].sort((left, right) => left.zIndex - right.zIndex),
    [elements]
  );

  useEffect(() => {
    const recalculate = () => {
      if (!viewportRef.current) return;

      const bounds = viewportRef.current.getBoundingClientRect();
      const availableWidth = Math.max(320, bounds.width - 40);
      const availableHeight = Math.max(320, bounds.height - 40);

      const widthScale = availableWidth / canvasWidth;
      const heightScale = availableHeight / canvasHeight;
      const nextFit = Math.min(widthScale, heightScale, 1);
      setFitScale(nextFit);
      // Reset pan when orientation changes
      setPan({ x: 0, y: 0 });
    };

    recalculate();
    window.addEventListener('resize', recalculate);
    return () => window.removeEventListener('resize', recalculate);
  }, [canvasWidth, canvasHeight]);

  // Wheel: pan & zoom
  useEffect(() => {
    const vp = viewportRef.current;
    if (!vp) return;
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (e.ctrlKey || e.metaKey) {
        // Zoom around cursor
        const factor = e.deltaY < 0 ? 1.1 : 1 / 1.1;
        const cur = useEditorStore.getState().scale;
        useEditorStore.getState().setScale(Math.max(0.2, Math.min(4, cur * factor)));
      } else if (e.shiftKey) {
        // Horizontal pan
        setPan((p) => ({ ...p, x: p.x - e.deltaY * 0.8 }));
      } else {
        // Vertical pan
        setPan((p) => ({ ...p, y: p.y - e.deltaY * 0.8 }));
      }
    };
    vp.addEventListener('wheel', handleWheel, { passive: false });
    return () => vp.removeEventListener('wheel', handleWheel);
  }, []);

  // Space-key tracking for pan mode
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        const t = e.target as HTMLElement;
        if (t.tagName !== 'INPUT' && t.tagName !== 'TEXTAREA' && !t.isContentEditable) {
          isSpaceDownRef.current = true;
          e.preventDefault();
        }
      }
    };
    const up = (e: KeyboardEvent) => {
      if (e.code === 'Space') isSpaceDownRef.current = false;
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
  }, []);

  // Update canvas bounds for accurate position calculation
  useEffect(() => {
    const updateCanvasRect = () => {
      if (canvasRef.current) {
        setCanvasRect(canvasRef.current.getBoundingClientRect());
      }
    };

    updateCanvasRect();
    window.addEventListener('resize', updateCanvasRect);
    const intervalId = setInterval(updateCanvasRect, 200);

    return () => {
      window.removeEventListener('resize', updateCanvasRect);
      clearInterval(intervalId);
    };
  }, [pan, scale]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
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

      // Ctrl+A → select all non-boundary elements
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'a') {
        event.preventDefault();
        const allIds = elements
          .filter((el) => !el.id.startsWith('system-boundary-'))
          .map((el) => el.id);
        setSelectedElementIds(allIds);
        return;
      }

      // Escape → clear selection
      if (event.key === 'Escape') {
        setSelectedElementId(null);
        return;
      }

      const multiIds = selectedElementIds.filter(
        (id) => !id.startsWith('system-boundary-')
      );
      const selected = elements.find((entry) => entry.id === selectedElementId);
      const isSystemBoundary = !!selected?.id.startsWith('system-boundary-');

      // Delete / Backspace → delete all selected
      if (event.key === 'Delete' || event.key === 'Backspace') {
        event.preventDefault();
        if (multiIds.length > 1) {
          deleteElements(multiIds);
        } else if (selected && !isSystemBoundary) {
          deleteElement(selected.id);
        }
        return;
      }

      if (event.key.startsWith('Arrow') && selected && !isSystemBoundary) {
        event.preventDefault();
        const step = event.shiftKey ? 1.5 : 0.5;
        const xDelta = event.key === 'ArrowLeft' ? -step : event.key === 'ArrowRight' ? step : 0;
        const yDelta = event.key === 'ArrowUp' ? -step : event.key === 'ArrowDown' ? step : 0;

        if (multiIds.length > 1) {
          multiIds.forEach((id) => {
            const el = elements.find((e) => e.id === id);
            if (!el) return;
            updateElement(id, {
              x: Math.max(0, Math.min(100 - el.width, el.x + xDelta)),
              y: Math.max(0, Math.min(100 - el.height, el.y + yDelta)),
            });
          });
        } else {
          updateElement(selected.id, {
            x: Math.max(0, Math.min(100 - selected.width, selected.x + xDelta)),
            y: Math.max(0, Math.min(100 - selected.height, selected.y + yDelta)),
          });
        }
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

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    elements,
    selectedElementId,
    selectedElementIds,
    deleteElement,
    deleteElements,
    updateElement,
    addElement,
    setSelectedElementId,
    setSelectedElementIds,
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

  // Alt key tracking for distance guides
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey) setIsAltPressed(true);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (!e.altKey) {
        setIsAltPressed(false);
        setDistanceGuides([]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Distance guide tracking when Alt is pressed
  useEffect(() => {
    if (!isAltPressed || !selectedElementId) return;

    const handleMouseMove = () => {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const selected = elements.find((el) => el.id === selectedElementId);
      if (!selected) return;

      // Calculate guides
      const guides: DistanceGuide[] = [];

      // Distance to edges
      const distToLeft = (selected.x / 100) * canvasWidth;
      const distToRight = ((100 - selected.x - selected.width) / 100) * canvasWidth;
      const distToTop = (selected.y / 100) * canvasHeight;
      const distToBottom = ((100 - selected.y - selected.height) / 100) * canvasHeight;

      if (distToLeft < 50)
        guides.push({
          x1: selected.x,
          y1: selected.y + selected.height / 2,
          x2: 0,
          y2: selected.y + selected.height / 2,
          label: `${distToLeft.toFixed(0)}px`,
        });

      if (distToRight < 50)
        guides.push({
          x1: selected.x + selected.width,
          y1: selected.y + selected.height / 2,
          x2: 100,
          y2: selected.y + selected.height / 2,
          label: `${distToRight.toFixed(0)}px`,
        });

      if (distToTop < 50)
        guides.push({
          x1: selected.x + selected.width / 2,
          y1: selected.y,
          x2: selected.x + selected.width / 2,
          y2: 0,
          label: `${distToTop.toFixed(0)}px`,
        });

      if (distToBottom < 50)
        guides.push({
          x1: selected.x + selected.width / 2,
          y1: selected.y + selected.height,
          x2: selected.x + selected.width / 2,
          y2: 100,
          label: `${distToBottom.toFixed(0)}px`,
        });

      setDistanceGuides(guides);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isAltPressed, selectedElementId, elements, canvasWidth, canvasHeight]);

  // Alignment guides - simplified Adobe XD/Figma style
  // Only shows overlap alignments with other elements (no equidistant)
  useEffect(() => {
    if (!selectedElementId) {
      setAlignmentGuides([]);
      return;
    }

    const selected = elements.find((el) => el.id === selectedElementId);
    if (!selected) return;

    const guides: AlignmentGuide[] = [];
    const tolerance = 0.8; // % tolerance for alignment

    // Get other elements to compare against
    const otherElements = elements.filter(
      (el) => el.id !== selectedElementId && !el.id.startsWith('system-boundary-')
    );

    // Check horizontal center alignment (most important)
    const selectedCenterX = selected.x + selected.width / 2;
    const alignedCenterX = otherElements.find(
      (el) => Math.abs(el.x + el.width / 2 - selectedCenterX) < tolerance
    );
    if (alignedCenterX) {
      guides.push({
        type: 'vertical',
        position: selectedCenterX,
        label: '|',
      });
    }

    // Check vertical center alignment (most important)
    const selectedCenterY = selected.y + selected.height / 2;
    const alignedCenterY = otherElements.find(
      (el) => Math.abs(el.y + el.height / 2 - selectedCenterY) < tolerance
    );
    if (alignedCenterY) {
      guides.push({
        type: 'horizontal',
        position: selectedCenterY,
        label: '—',
      });
    }

    // Check left edge alignment
    const alignedLeft = otherElements.find((el) => Math.abs(el.x - selected.x) < tolerance);
    if (alignedLeft && !alignedCenterX) {
      guides.push({
        type: 'vertical',
        position: selected.x,
        label: '|',
      });
    }

    // Check right edge alignment
    const alignedRight = otherElements.find(
      (el) => Math.abs(el.x + el.width - (selected.x + selected.width)) < tolerance
    );
    if (alignedRight && !alignedCenterX && !alignedLeft) {
      guides.push({
        type: 'vertical',
        position: selected.x + selected.width,
        label: '|',
      });
    }

    // Check top edge alignment
    const alignedTop = otherElements.find((el) => Math.abs(el.y - selected.y) < tolerance);
    if (alignedTop && !alignedCenterY) {
      guides.push({
        type: 'horizontal',
        position: selected.y,
        label: '—',
      });
    }

    // Check bottom edge alignment
    const alignedBottom = otherElements.find(
      (el) => Math.abs(el.y + el.height - (selected.y + selected.height)) < tolerance
    );
    if (alignedBottom && !alignedCenterY && !alignedTop) {
      guides.push({
        type: 'horizontal',
        position: selected.y + selected.height,
        label: '—',
      });
    }

    setAlignmentGuides(guides);
  }, [selectedElementId, elements]);

  // Drag-drop image upload
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(true);
    };

    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(true);
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.target === canvas) {
        setIsDragOver(false);
      }
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);

      const files = e.dataTransfer?.files;
      if (!files) return;

      Array.from(files).forEach((file) => {
        if (!file.type.startsWith('image/')) return;

        const reader = new FileReader();
        reader.onload = () => {
          const rect = canvasRef.current?.getBoundingClientRect();
          if (!rect) return;

          // Calculate position relative to canvas
          const canvasX = (e.clientX - rect.left) / renderedScale;
          const canvasY = (e.clientY - rect.top) / renderedScale;

          // Convert to percentage
          const x = (canvasX / canvasWidth) * 100;
          const y = (canvasY / canvasHeight) * 100;

          const id = `image-${Date.now()}`;
          addElement({
            id,
            type: 'image',
            label: file.name.replace(/\.[^/.]+$/, '') || 'Image',
            x: Math.max(0, Math.min(100 - 15, x - 7.5)),
            y: Math.max(0, Math.min(100 - 12, y - 6)),
            width: 15,
            height: 12,
            rotation: 0,
            zIndex: Math.max(...elements.map((el) => el.zIndex), 0) + 1,
            visible: true,
            src: reader.result as string,
            objectFit: 'contain',
            opacity: 1,
          });
        };
        reader.readAsDataURL(file);
      });
    };

    canvas.addEventListener('dragover', handleDragOver);
    canvas.addEventListener('dragenter', handleDragEnter);
    canvas.addEventListener('dragleave', handleDragLeave);
    canvas.addEventListener('drop', handleDrop);

    return () => {
      canvas.removeEventListener('dragover', handleDragOver);
      canvas.removeEventListener('dragenter', handleDragEnter);
      canvas.removeEventListener('dragleave', handleDragLeave);
      canvas.removeEventListener('drop', handleDrop);
    };
  }, [canvasRef, addElement, elements, canvasWidth, canvasHeight, renderedScale]);

  const handleElementSelect = useCallback(
    (elementId: string, e: React.MouseEvent) => {
      e.stopPropagation();
      setSelectedElementId(elementId);
    },
    [setSelectedElementId]
  );

  const handleCanvasClick = useCallback(() => {
    if (!rubberBandStartRef.current) {
      setSelectedElementId(null);
    }
    setActiveGuides([]);
    setDistanceGuides([]);
    setAlignmentGuides([]);
  }, [setSelectedElementId]);

  // Rubber-band: track mouse on canvas background
  const handleCanvasMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      // Only on empty canvas (not on an element), left button
      if (e.button !== 0 || isPanningRef.current || isSpaceDownRef.current) return;
      if ((e.target as HTMLElement) !== e.currentTarget) return;

      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = (e.clientX - rect.left) / renderedScale;
      const y = (e.clientY - rect.top) / renderedScale;
      rubberBandStartRef.current = { x, y };
      setRubberBand({ x, y, w: 0, h: 0 });

      const onMove = (ev: MouseEvent) => {
        if (!rubberBandStartRef.current || !canvasRef.current) return;
        const r = canvasRef.current.getBoundingClientRect();
        const curX = (ev.clientX - r.left) / renderedScale;
        const curY = (ev.clientY - r.top) / renderedScale;
        const sx = rubberBandStartRef.current.x;
        const sy = rubberBandStartRef.current.y;
        setRubberBand({
          x: Math.min(sx, curX),
          y: Math.min(sy, curY),
          w: Math.abs(curX - sx),
          h: Math.abs(curY - sy),
        });
      };

      const onUp = (ev: MouseEvent) => {
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);
        if (!rubberBandStartRef.current || !canvasRef.current) return;

        const r = canvasRef.current.getBoundingClientRect();
        const curX = (ev.clientX - r.left) / renderedScale;
        const curY = (ev.clientY - r.top) / renderedScale;
        const selX = Math.min(rubberBandStartRef.current.x, curX);
        const selY = Math.min(rubberBandStartRef.current.y, curY);
        const selW = Math.abs(curX - rubberBandStartRef.current.x);
        const selH = Math.abs(curY - rubberBandStartRef.current.y);

        if (selW > 5 || selH > 5) {
          const canvasW = orientation === 'landscape' ? A4_HEIGHT_PX : A4_WIDTH_PX;
          const canvasH = orientation === 'landscape' ? A4_WIDTH_PX : A4_HEIGHT_PX;
          const selXPct = (selX / canvasW) * 100;
          const selYPct = (selY / canvasH) * 100;
          const selWPct = (selW / canvasW) * 100;
          const selHPct = (selH / canvasH) * 100;

          const hit = elements
            .filter((el) => !el.id.startsWith('system-boundary-') && el.visible !== false)
            .filter((el) =>
              el.x < selXPct + selWPct &&
              el.x + el.width > selXPct &&
              el.y < selYPct + selHPct &&
              el.y + el.height > selYPct
            )
            .map((el) => el.id);

          if (hit.length > 0) setSelectedElementIds(hit);
        }

        rubberBandStartRef.current = null;
        setRubberBand(null);
      };

      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
    },
    [elements, renderedScale, orientation, setSelectedElementIds]
  );

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
    <div
      ref={viewportRef}
      className="flex-1 flex items-center justify-center bg-gray-100 overflow-hidden"
      style={{ cursor: isPanning ? 'grabbing' : isSpaceDownRef.current ? 'grab' : 'default' }}
      onMouseDown={(e) => {
        setIsCanvasActive(true);
        // Middle-mouse or Space+left → pan mode
        if (e.button === 1 || (e.button === 0 && isSpaceDownRef.current)) {
          e.preventDefault();
          isPanningRef.current = true;
          panStartRef.current = { clientX: e.clientX, clientY: e.clientY, panX: pan.x, panY: pan.y };
          setIsPanning(true);
        }
      }}
      onMouseMove={(e) => {
        if (isPanningRef.current) {
          setPan({
            x: panStartRef.current.panX + (e.clientX - panStartRef.current.clientX),
            y: panStartRef.current.panY + (e.clientY - panStartRef.current.clientY),
          });
        }
      }}
      onMouseUp={() => {
        if (isPanningRef.current) {
          isPanningRef.current = false;
          setIsPanning(false);
        }
      }}
      onMouseLeave={() => {
        if (isPanningRef.current) {
          isPanningRef.current = false;
          setIsPanning(false);
        }
      }}
    >
      {/* Pan container */}
      <div style={{ transform: `translate(${pan.x}px, ${pan.y}px)`, willChange: 'transform' }}>
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
        onMouseDown={(e) => {
          if (e.button === 0 && !isSpaceDownRef.current) setIsCanvasActive(true);
          handleCanvasMouseDown(e);
        }}
        onClick={() => {
          if (!isPanningRef.current) handleCanvasClick();
        }}
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

        {/* Alignment Guides - Simplified */}
        {alignmentGuides.map((guide, index) => (
          guide.type === 'vertical' ? (
            <div
              key={`alignment-v-${index}`}
              style={{
                position: 'absolute',
                top: 0,
                left: `${guide.position}%`,
                transform: 'translateX(-50%)',
                width: '1px',
                height: '100%',
                backgroundColor: '#ef4444',
                zIndex: 4,
                pointerEvents: 'none',
                opacity: 0.6,
              }}
            />
          ) : (
            <div
              key={`alignment-h-${index}`}
              style={{
                position: 'absolute',
                left: 0,
                top: `${guide.position}%`,
                transform: 'translateY(-50%)',
                width: '100%',
                height: '1px',
                backgroundColor: '#ef4444',
                zIndex: 4,
                pointerEvents: 'none',
                opacity: 0.6,
              }}
            />
          )
        ))}

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

        {/* Rubber-band selection overlay */}
        {rubberBand && rubberBand.w > 3 && rubberBand.h > 3 && (
          <div
            style={{
              position: 'absolute',
              left: `${(rubberBand.x / canvasWidth) * 100}%`,
              top: `${(rubberBand.y / canvasHeight) * 100}%`,
              width: `${(rubberBand.w / canvasWidth) * 100}%`,
              height: `${(rubberBand.h / canvasHeight) * 100}%`,
              border: '1.5px dashed #3b82f6',
              backgroundColor: '#3b82f610',
              pointerEvents: 'none',
              zIndex: 50,
            }}
          />
        )}

        {/* Drag-over indicator */}
        {isDragOver && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              border: '2px dashed #3b82f6',
              pointerEvents: 'none',
              zIndex: 60,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div style={{ fontSize: '14px', color: '#3b82f6', fontWeight: 'bold' }}>
              Drop image here
            </div>
          </div>
        )}
      </div>
      </div>{/* end pan container */}
    </div>
  );
};

export default Canvas;
