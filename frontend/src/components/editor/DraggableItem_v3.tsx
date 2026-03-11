'use client';

import React, { useRef, useMemo, useState, useEffect, useCallback } from 'react';
import { CertificateElement } from '@/types/CertificateTemplate';
import { useEditorStore } from '@/store/useEditorStore';
import { AdvancedPointerSensitivity, VelocityTracker } from '@/utils/pointerSensitivityAdvanced';

interface DraggableItemProps {
  element: CertificateElement;
  isSelected: boolean;
  onSelect: (e: React.MouseEvent) => void;
  scale: number;
  canvasWidth: number;
  canvasHeight: number;
  canvasRect: DOMRect | null;
}

type ResizeHandle = 'nw' | 'ne' | 'se' | 'sw' | 'n' | 'e' | 's' | 'w' | null;

/**
 * DraggableItem v3 - Production-ready drag/resize with real-time sync
 * Based on Flutter Figma Clone pattern + Supabase Realtime
 */
const DraggableItem = React.memo<DraggableItemProps>(
  ({
    element,
    isSelected,
    onSelect,
    scale,
    canvasWidth,
    canvasHeight,
    canvasRect,
  }) => {
    const selectionColor = useEditorStore((state) => state.selectionColor);
    const updateElement = useEditorStore((state) => state.updateElement);
    const selectedElementIds = useEditorStore((state) => state.selectedElementIds);
    const toggleElementSelection = useEditorStore((state) => state.toggleElementSelection);

    const isMultiSelected = selectedElementIds.includes(element.id) && selectedElementIds.length > 1;

    // State management
    const [isTextEditing, setIsTextEditing] = useState(false);
    const [textDraft, setTextDraft] = useState(element.content || '');
    const [isDragging, setIsDragging] = useState(false);
    const [resizeHandle, setResizeHandle] = useState<ResizeHandle>(null);

    // Refs for precise drag/resize tracking
    const elementRef = useRef<HTMLDivElement>(null);
    const velocityTrackerRef = useRef(new VelocityTracker(8));

    // Pan state (like Flutter example)
    const panStateRef = useRef({
      isActive: false,
      startClientX: 0,
      startClientY: 0,
      currentClientX: 0,
      currentClientY: 0,
      lastClientX: 0,
      lastClientY: 0,
      startElementX: 0,
      startElementY: 0,
      startElementWidth: 0,
      startElementHeight: 0,
      lastUpdateTime: 0,
      threshold: AdvancedPointerSensitivity.DRAG_THRESHOLD,
      moved: false,
    });

    const frameRef = useRef<number | null>(null);
    const isSystemBoundary = element.id.startsWith('system-boundary-');

    // Sync text draft with element content
    useEffect(() => {
      if (!isTextEditing) {
        setTextDraft(element.content || '');
      }
    }, [element.content, isTextEditing]);

    /**
     * Convert canvas pixel coordinates to percentage
     */
    const pixelsToPercent = useCallback(
      (px: number, dimension: 'x' | 'y') => {
        return dimension === 'x'
          ? (px / canvasWidth) * 100
          : (px / canvasHeight) * 100;
      },
      [canvasWidth, canvasHeight]
    );

    /**
     * Convert percentage coordinates to canvas pixels
     */
    const percentToPixels = useCallback(
      (pct: number, dimension: 'x' | 'y') => {
        return dimension === 'x'
          ? (pct / 100) * canvasWidth
          : (pct / 100) * canvasHeight;
      },
      [canvasWidth, canvasHeight]
    );

    /**
     * Get cursor position relative to canvas
     * Handles scale and canvas offset
     */
    const getCanvasRelativePosition = useCallback(
      (clientX: number, clientY: number) => {
        if (!canvasRect) {
          return { x: clientX, y: clientY };
        }

        const relX = (clientX - canvasRect.left) / scale;
        const relY = (clientY - canvasRect.top) / scale;

        return {
          x: Math.max(0, Math.min(relX, canvasWidth)),
          y: Math.max(0, Math.min(relY, canvasHeight)),
        };
      },
      [canvasRect, scale, canvasWidth, canvasHeight]
    );

    /**
     * START DRAG - Pan down pattern (like Flutter)
     */
    const handleDragStart = useCallback(
      (e: React.MouseEvent) => {
        if (isSystemBoundary || isTextEditing) return;

        e.preventDefault();
        e.stopPropagation();
        onSelect(e);


        panStateRef.current = {
          isActive: true,
          startClientX: e.clientX,
          startClientY: e.clientY,
          currentClientX: e.clientX,
          currentClientY: e.clientY,
          lastClientX: e.clientX,
          lastClientY: e.clientY,
          startElementX: percentToPixels(element.x, 'x'),
          startElementY: percentToPixels(element.y, 'y'),
          startElementWidth: percentToPixels(element.width, 'x'),
          startElementHeight: percentToPixels(element.height, 'y'),
          lastUpdateTime: performance.now(),
          threshold: AdvancedPointerSensitivity.DRAG_THRESHOLD,
          moved: false,
        };

        setIsDragging(true);
        document.body.style.userSelect = 'none';
        document.body.style.cursor = 'grabbing';
      },
      [isSystemBoundary, isTextEditing, onSelect, element, percentToPixels, getCanvasRelativePosition]
    );

    /**
     * START RESIZE - Pan down on handle (like Flutter)
     */
    const handleResizeStart = useCallback(
      (handle: ResizeHandle) => (e: React.MouseEvent) => {
        if (isSystemBoundary) return;

        e.preventDefault();
        e.stopPropagation();
        onSelect(e);

        const startWidthPx = percentToPixels(element.width, 'x');
        const startHeightPx = percentToPixels(element.height, 'y');

        panStateRef.current = {
          isActive: true,
          startClientX: e.clientX,
          startClientY: e.clientY,
          currentClientX: e.clientX,
          currentClientY: e.clientY,
          lastClientX: e.clientX,
          lastClientY: e.clientY,
          startElementX: percentToPixels(element.x, 'x'),
          startElementY: percentToPixels(element.y, 'y'),
          startElementWidth: startWidthPx,
          startElementHeight: startHeightPx,
          lastUpdateTime: performance.now(),
          threshold: 0, // No threshold for resize
          moved: false,
        };

        setResizeHandle(handle);
        setIsDragging(true);
        document.body.style.userSelect = 'none';
        document.body.style.cursor = `${handle}-resize`;
      },
      [isSystemBoundary, element, percentToPixels, onSelect]
    );

    /**
     * PAN UPDATE - Mouse move handler
     * Continuously syncs to store (like Flutter broadcast)
     */
    useEffect(() => {
      if (!isDragging || !panStateRef.current.isActive) return;

      // IMPORTANT: Define cleanup before handlers so it can be called from handlers
      const performCleanup = () => {
        panStateRef.current.isActive = false;
        panStateRef.current.moved = false;
        setIsDragging(false);
        setResizeHandle(null);
        if (frameRef.current !== null) {
          cancelAnimationFrame(frameRef.current);
          frameRef.current = null;
        }
        velocityTrackerRef.current.reset();
        document.body.style.userSelect = '';
        document.body.style.cursor = '';
      };

      const handleMouseMove = (event: MouseEvent) => {
        event.preventDefault();

        panStateRef.current.currentClientX = event.clientX;
        panStateRef.current.currentClientY = event.clientY;

        // RAF-batched update
        if (frameRef.current !== null) {
          cancelAnimationFrame(frameRef.current);
        }

        frameRef.current = requestAnimationFrame(() => {
          const now = performance.now();
          const deltaTime = Math.max(1, now - panStateRef.current.lastUpdateTime);
          panStateRef.current.lastUpdateTime = now;

          const deltaX = panStateRef.current.currentClientX - panStateRef.current.startClientX;
          const deltaY = panStateRef.current.currentClientY - panStateRef.current.startClientY;

          // Check threshold
          const distance = Math.hypot(deltaX, deltaY);
          if (!panStateRef.current.moved && distance < panStateRef.current.threshold) {
            return;
          }

          panStateRef.current.moved = true;

          // Calculate velocity for momentum
          const { vx, vy } = AdvancedPointerSensitivity.calculateVelocity(
            panStateRef.current.lastClientX,
            panStateRef.current.lastClientY,
            panStateRef.current.currentClientX,
            panStateRef.current.currentClientY,
            deltaTime
          );

          velocityTrackerRef.current.addSample(vx, vy);

          panStateRef.current.lastClientX = panStateRef.current.currentClientX;
          panStateRef.current.lastClientY = panStateRef.current.currentClientY;

          // Apply scale factor for actual pixel movement
          const scaledDeltaX = deltaX / scale;
          const scaledDeltaY = deltaY / scale;

          if (resizeHandle) {
            // ===== RESIZE LOGIC =====
            let newWidth = panStateRef.current.startElementWidth;
            let newHeight = panStateRef.current.startElementHeight;
            let newX = panStateRef.current.startElementX;
            let newY = panStateRef.current.startElementY;

            // Calculate new dimensions based on handle
            if (resizeHandle.includes('e')) {
              newWidth = Math.max(20, panStateRef.current.startElementWidth + scaledDeltaX);
            }
            if (resizeHandle.includes('w')) {
              newWidth = Math.max(20, panStateRef.current.startElementWidth - scaledDeltaX);
              newX = panStateRef.current.startElementX + (panStateRef.current.startElementWidth - newWidth);
            }
            if (resizeHandle.includes('s')) {
              newHeight = Math.max(20, panStateRef.current.startElementHeight + scaledDeltaY);
            }
            if (resizeHandle.includes('n')) {
              newHeight = Math.max(20, panStateRef.current.startElementHeight - scaledDeltaY);
              newY = panStateRef.current.startElementY + (panStateRef.current.startElementHeight - newHeight);
            }

            // Proportional resize (Shift key)
            if (event.shiftKey) {
              const ratio = panStateRef.current.startElementHeight > 0
                ? panStateRef.current.startElementWidth / panStateRef.current.startElementHeight
                : 1;

              const isCorner = (resizeHandle.length === 2);
              if (isCorner) {
                const isHorizontalLed = Math.abs(scaledDeltaX) > Math.abs(scaledDeltaY);
                if (isHorizontalLed) {
                  newHeight = newWidth / ratio;
                  if (resizeHandle.includes('n')) {
                    newY = panStateRef.current.startElementY + (panStateRef.current.startElementHeight - newHeight);
                  }
                } else {
                  newWidth = newHeight * ratio;
                  if (resizeHandle.includes('w')) {
                    newX = panStateRef.current.startElementX + (panStateRef.current.startElementWidth - newWidth);
                  }
                }
              }
            }

            // Bounds check
            newX = Math.max(0, newX);
            newY = Math.max(0, newY);
            if (newX + newWidth > canvasWidth) newX = canvasWidth - newWidth;
            if (newY + newHeight > canvasHeight) newY = canvasHeight - newHeight;

            // Convert to percentage and update
            updateElement(element.id, {
              x: pixelsToPercent(newX, 'x'),
              y: pixelsToPercent(newY, 'y'),
              width: pixelsToPercent(newWidth, 'x'),
              height: pixelsToPercent(newHeight, 'y'),
            });
          } else {
            // ===== DRAG LOGIC =====
            const newX = panStateRef.current.startElementX + scaledDeltaX;
            const newY = panStateRef.current.startElementY + scaledDeltaY;

            const elementWidthPx = percentToPixels(element.width, 'x');
            const elementHeightPx = percentToPixels(element.height, 'y');
            const constrainedX = Math.max(0, Math.min(newX, canvasWidth - elementWidthPx));
            const constrainedY = Math.max(0, Math.min(newY, canvasHeight - elementHeightPx));

            updateElement(element.id, {
              x: pixelsToPercent(constrainedX, 'x'),
              y: pixelsToPercent(constrainedY, 'y'),
            });

            // Move all OTHER multi-selected elements by the same pixel delta
            const multiIds = useEditorStore.getState().selectedElementIds;
            if (multiIds.length > 1) {
              const dxPct = pixelsToPercent(constrainedX, 'x') - element.x;
              const dyPct = pixelsToPercent(constrainedY, 'y') - element.y;
              multiIds.forEach((mid) => {
                if (mid === element.id) return;
                const other = useEditorStore.getState().elements.find((e) => e.id === mid);
                if (!other || other.id.startsWith('system-boundary-')) return;
                useEditorStore.getState().updateElement(mid, {
                  x: Math.max(0, Math.min(100 - other.width, other.x + dxPct)),
                  y: Math.max(0, Math.min(100 - other.height, other.y + dyPct)),
                });
              });
            }
          }

          frameRef.current = null;
        });
      };

      const handleMouseUp = (event: MouseEvent) => {
        // Reject non-left-click mouse up (right click, middle click, etc)
        if (event.button !== 0) return;

        // ALWAYS clean up immediately on mouse up
        const isResizing = resizeHandle !== null;
        const hasMoved = panStateRef.current.moved;

        // Apply momentum if dragging (not resizing) and we have velocity
        if (!isResizing && hasMoved) {
          const { vx, vy } = velocityTrackerRef.current.getSmoothedVelocity();

          if (
            !AdvancedPointerSensitivity.isVelocityNegligible(vx) ||
            !AdvancedPointerSensitivity.isVelocityNegligible(vy)
          ) {
            const momentumFrames = AdvancedPointerSensitivity.generateMomentumFrames(vx, vy, 30);

            let frameIndex = 0;
            const applyMomentumFrame = () => {
              // SAFETY CHECK: If drag was ended externally, stop momentum
              if (!panStateRef.current.moved) {
                performCleanup();
                return;
              }

              if (frameIndex < momentumFrames.length) {
                const { dx, dy } = momentumFrames[frameIndex];

                // Apply momentum as absolute delta
                const momentumX = panStateRef.current.startElementX + (frameIndex === 0 ? 0 : dx / scale);
                const momentumY = panStateRef.current.startElementY + (frameIndex === 0 ? 0 : dy / scale);

                const elementWidthPx = percentToPixels(element.width, 'x');
                const elementHeightPx = percentToPixels(element.height, 'y');

                const constrainedX = Math.max(0, Math.min(momentumX, canvasWidth - elementWidthPx));
                const constrainedY = Math.max(0, Math.min(momentumY, canvasHeight - elementHeightPx));

                updateElement(element.id, {
                  x: pixelsToPercent(constrainedX, 'x'),
                  y: pixelsToPercent(constrainedY, 'y'),
                });

                frameIndex++;
                frameRef.current = requestAnimationFrame(applyMomentumFrame);
              } else {
                frameRef.current = null;
                performCleanup();
              }
            };

            frameRef.current = requestAnimationFrame(applyMomentumFrame);
          } else {
            // No meaningful velocity - clean up immediately
            performCleanup();
          }
        } else {
          // Resize or no movement - clean up immediately
          performCleanup();
        }
      };

      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);

      return () => {
        // Clean up event listeners
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
        
        // SAFETY: Ensure drag state is fully cleaned up on effect unmount
        if (frameRef.current !== null) {
          cancelAnimationFrame(frameRef.current);
          frameRef.current = null;
        }
      };
    }, [
      isDragging,
      resizeHandle,
      scale,
      canvasWidth,
      canvasHeight,
      element,
      updateElement,
      pixelsToPercent,
      percentToPixels,
    ]);

    /**
     * Double-click to edit text
     */
    const handleDoubleClick = useCallback(
      (e: React.MouseEvent) => {
        if (isSystemBoundary || element.type !== 'text') return;

        e.stopPropagation();
        onSelect(e);
        setIsTextEditing(true);
      },
      [isSystemBoundary, element.type, onSelect]
    );

    /**
     * Commit text edit
     */
    const commitTextEdit = useCallback(() => {
      if (textDraft !== element.content) {
        updateElement(element.id, { content: textDraft });
      }
      setIsTextEditing(false);
    }, [textDraft, element.content, element.id, updateElement]);

    /**
     * Cancel text edit
     */
    const cancelTextEdit = useCallback(() => {
      setTextDraft(element.content || '');
      setIsTextEditing(false);
    }, [element.content]);

    // Container style
    const containerStyle: React.CSSProperties = useMemo(
      () => ({
        position: 'absolute',
        left: `${element.x}%`,
        top: `${element.y}%`,
        width: `${element.width}%`,
        height: `${element.height}%`,
        transform: `rotate(${element.rotation}deg)`,
        zIndex: element.zIndex,
        opacity: element.visible ? 1 : 0.5,
        cursor: isSystemBoundary ? 'default' : isDragging ? 'grabbing' : 'grab',
        userSelect: 'none',
        touchAction: 'none',
        transition: isDragging ? 'none' : 'opacity 0.15s ease-out',
      }),
      [element.x, element.y, element.width, element.height, element.rotation, element.zIndex, element.visible, isSystemBoundary, isDragging]
    );

    // Selection border style — blue for primary, orange for multi-selected
    const borderStyle: React.CSSProperties = isSelected
      ? {
          border: `2px solid ${selectionColor}`,
          boxShadow: `inset 0 0 0 1px ${selectionColor}33, ${selectionColor}22 0 0 0 4px`,
          outlineOffset: '-2px',
        }
      : isMultiSelected
        ? {
            border: '2px solid #f97316',
            boxShadow: 'inset 0 0 0 1px #f9731633, #f9731622 0 0 0 4px',
          }
        : {
            border: '2px solid transparent',
          };

    // Resize handle component
    const ResizeHandle: React.FC<{ handle: ResizeHandle }> = ({ handle }) => (
      <div
        onMouseDown={handleResizeStart(handle)}
        style={{
          position: 'absolute',
          width: '12px',
          height: '12px',
          backgroundColor: selectionColor,
          border: '2px solid white',
          borderRadius: '3px',
          cursor: `${handle}-resize`,
          boxShadow: `${selectionColor}33 0 2px 4px`,
        }}
        className={`
          ${handle === 'nw' ? 'top-0 left-0 -translate-x-1/2 -translate-y-1/2' : ''}
          ${handle === 'ne' ? 'top-0 right-0 translate-x-1/2 -translate-y-1/2' : ''}
          ${handle === 'se' ? 'bottom-0 right-0 translate-x-1/2 translate-y-1/2' : ''}
          ${handle === 'sw' ? 'bottom-0 left-0 -translate-x-1/2 translate-y-1/2' : ''}
          ${handle === 'n' ? 'top-0 left-1/2 -translate-x-1/2 -translate-y-1/2' : ''}
          ${handle === 'e' ? 'right-0 top-1/2 translate-x-1/2 -translate-y-1/2' : ''}
          ${handle === 's' ? 'bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2' : ''}
          ${handle === 'w' ? 'left-0 top-1/2 -translate-x-1/2 -translate-y-1/2' : ''}
        `}
      />
    );

    const shadowStyle = element.shadowBlur
      ? `${element.shadowX || 0}px ${element.shadowY || 0}px ${element.shadowBlur || 0}px ${
          element.shadowColor || 'rgba(0,0,0,0.25)'
        }`
      : 'none';

    return (
      <div
        ref={elementRef}
        style={containerStyle}
        onMouseDown={handleDragStart}
        onClick={(e) => {
          e.stopPropagation();
          if (e.shiftKey && !isSystemBoundary) {
            // Shift+click → toggle multi-select
            toggleElementSelection(element.id);
          } else {
            onSelect(e);
          }
        }}
        onDoubleClick={handleDoubleClick}
      >
        <div
          style={{
            ...borderStyle,
            width: '100%',
            height: '100%',
            position: 'relative',
          }}
        >
          {/* Element Content */}
          <div style={{ width: '100%', height: '100%' }}>
            {element.type === 'text' &&
              (isTextEditing ? (
                <textarea
                  value={textDraft}
                  onChange={(e) => setTextDraft(e.target.value)}
                  onBlur={commitTextEdit}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      commitTextEdit();
                    }
                    if (e.key === 'Escape') {
                      e.preventDefault();
                      cancelTextEdit();
                    }
                  }}
                  onMouseDown={(e) => e.stopPropagation()}
                  autoFocus
                  style={{
                    fontSize: `${element.fontSize}px`,
                    fontFamily: element.fontFamily,
                    fontWeight: element.fontWeight as any,
                    color: element.color,
                    textAlign: element.textAlign as any,
                    lineHeight: element.lineHeight,
                    letterSpacing: `${element.letterSpacing || 0}px`,
                    width: '100%',
                    height: '100%',
                    padding: '8px',
                    boxSizing: 'border-box',
                    resize: 'none',
                    border: `1px solid ${selectionColor}`,
                    outline: 'none',
                    background: '#ffffff',
                    opacity: element.opacity ?? 1,
                  }}
                />
              ) : (
                <div
                  style={{
                    fontSize: `${element.fontSize}px`,
                    fontFamily: element.fontFamily,
                    fontWeight: element.fontWeight as any,
                    color: element.color,
                    textAlign: element.textAlign as any,
                    lineHeight: element.lineHeight,
                    letterSpacing: `${element.letterSpacing || 0}px`,
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent:
                      element.textAlign === 'left'
                        ? 'flex-start'
                        : element.textAlign === 'right'
                          ? 'flex-end'
                          : 'center',
                    padding: '8px',
                    boxSizing: 'border-box',
                    whiteSpace: 'pre-wrap',
                    overflowWrap: 'anywhere',
                    opacity: element.opacity ?? 1,
                    textShadow: shadowStyle,
                    pointerEvents: 'none',
                  }}
                >
                  {element.content}
                </div>
              ))}

            {element.type === 'image' && (
              <img
                src={element.src}
                alt={element.label}
                draggable={false}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: element.objectFit as any,
                  opacity: element.opacity ?? 1,
                  filter: element.shadowBlur ? `drop-shadow(${shadowStyle})` : undefined,
                  pointerEvents: 'none',
                }}
              />
            )}

            {element.type === 'shape' && (
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  background: element.gradientEnabled
                    ? `linear-gradient(${element.gradientAngle ?? 135}deg, ${element.gradientFrom ?? '#e2e8f0'}, ${element.gradientTo ?? '#94a3b8'})`
                    : (element.backgroundColor || 'transparent'),
                  border:
                    element.strokePosition === 'outside'
                      ? 'none'
                      : `${element.borderWidth || 0}px solid ${element.borderColor || '#000000'}`,
                  outline:
                    element.strokePosition === 'outside'
                      ? `${element.borderWidth || 0}px solid ${element.borderColor || '#000000'}`
                      : undefined,
                  boxSizing: element.strokePosition === 'outside' ? 'content-box' : 'border-box',
                  borderRadius: element.shapeType === 'circle'
                    ? '50%'
                    : element.borderRadius
                      ? `${element.borderRadius}px`
                      : '0',
                  clipPath: element.shapeType === 'triangle'
                    ? 'polygon(50% 0%, 0% 100%, 100% 100%)'
                    : undefined,
                  opacity: element.opacity ?? 1,
                  boxShadow: shadowStyle !== 'none' ? shadowStyle : undefined,
                  pointerEvents: 'none',
                }}
              />
            )}
          </div>

          {/* Resize Handles (only show when selected) */}
          {isSelected && !isSystemBoundary && !isTextEditing && (
            <>
              <ResizeHandle handle="nw" />
              <ResizeHandle handle="ne" />
              <ResizeHandle handle="se" />
              <ResizeHandle handle="sw" />
              <ResizeHandle handle="n" />
              <ResizeHandle handle="e" />
              <ResizeHandle handle="s" />
              <ResizeHandle handle="w" />
            </>
          )}
        </div>
      </div>
    );
  }
);

DraggableItem.displayName = 'DraggableItem';

export default DraggableItem;
