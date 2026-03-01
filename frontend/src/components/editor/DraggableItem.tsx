'use client';

import React, { useRef, useMemo, useState, useEffect } from 'react';
import { CertificateElement } from '@/types/CertificateTemplate';
import { useEditorStore } from '@/store/useEditorStore';

interface DraggableItemProps {
  element: CertificateElement;
  isSelected: boolean;
  onSelect: (e: React.MouseEvent) => void;
  onDrag: (deltaX: number, deltaY: number) => void;
  onResize: (resize: { width: number; height: number; x: number; y: number }) => void;
  onDragEnd?: () => void;
  scale: number;
  canvasWidth: number;
  canvasHeight: number;
}

type ResizeHandle = 'nw' | 'ne' | 'se' | 'sw' | 'n' | 'e' | 's' | 'w' | null;

/**
 * DraggableItem Component with Resize Handles
 *
 * Memoized component for dragging and resizing elements.
 * Handles:
 * - Left-click drag to move
 * - Corners/edges drag to resize
 * - Selection highlighting
 *
 * Prevents unnecessary re-renders of non-selected elements.
 */
const DraggableItem = React.memo<DraggableItemProps>(
  ({
    element,
    isSelected,
    onSelect,
    onDrag,
    onResize,
    onDragEnd,
    scale,
    canvasWidth,
    canvasHeight,
  }) => {
    const selectionColor = useEditorStore((state) => state.selectionColor);
    const updateElement = useEditorStore((state) => state.updateElement);
    const [isInteracting, setIsInteracting] = useState(false);
    const [resizeHandle, setResizeHandle] = useState<ResizeHandle>(null);
    const [isTextEditing, setIsTextEditing] = useState(false);
    const [textDraft, setTextDraft] = useState(element.content || '');
    const elementRef = useRef<HTMLDivElement>(null);
    const dragStartRef = useRef({ x: 0, y: 0 });
    const frameRef = useRef<number | null>(null);
    const rectRef = useRef({ x: 0, y: 0, width: 0, height: 0, ratio: 1 });
    const isSystemBoundary = element.id.startsWith('system-boundary-');

    useEffect(() => {
      if (!isTextEditing) {
        setTextDraft(element.content || '');
      }
    }, [element.content, isTextEditing]);

    const handleMouseDown = (e: React.MouseEvent, handle?: ResizeHandle) => {
      if (isSystemBoundary) {
        return;
      }

      if (isTextEditing) {
        return;
      }

      e.preventDefault();
      e.stopPropagation();
      onSelect(e);

      if (handle) {
        setResizeHandle(handle);
        dragStartRef.current = { x: e.clientX, y: e.clientY };
        const startWidth = (element.width / 100) * canvasWidth;
        const startHeight = (element.height / 100) * canvasHeight;
        const startX = (element.x / 100) * canvasWidth;
        const startY = (element.y / 100) * canvasHeight;
        rectRef.current = {
          x: startX,
          y: startY,
          width: startWidth,
          height: startHeight,
          ratio: startHeight > 0 ? startWidth / startHeight : 1,
        };
      } else {
        dragStartRef.current = { x: e.clientX, y: e.clientY };
      }

      setIsInteracting(true);
    };

    useEffect(() => {
      if (!isInteracting) return;

      const handleWindowMove = (event: MouseEvent) => {
        const deltaX = event.clientX - dragStartRef.current.x;
        const deltaY = event.clientY - dragStartRef.current.y;

        if (Math.abs(deltaX) < 0.01 && Math.abs(deltaY) < 0.01) {
          return;
        }

        if (!resizeHandle) {
          onDrag(deltaX / scale, deltaY / scale);
          dragStartRef.current = { x: event.clientX, y: event.clientY };
          return;
        }

        let newX = rectRef.current.x;
        let newY = rectRef.current.y;
        let newWidth = rectRef.current.width;
        let newHeight = rectRef.current.height;

        if (resizeHandle.includes('e')) {
          newWidth += deltaX / scale;
        }
        if (resizeHandle.includes('w')) {
          newWidth -= deltaX / scale;
          newX += deltaX / scale;
        }
        if (resizeHandle.includes('s')) {
          newHeight += deltaY / scale;
        }
        if (resizeHandle.includes('n')) {
          newHeight -= deltaY / scale;
          newY += deltaY / scale;
        }

        const minSize = 20;

        if (newWidth < minSize && resizeHandle.includes('w')) {
          newX -= minSize - newWidth;
        }
        if (newHeight < minSize && resizeHandle.includes('n')) {
          newY -= minSize - newHeight;
        }

        newWidth = Math.max(minSize, newWidth);
        newHeight = Math.max(minSize, newHeight);

        if (event.shiftKey) {
          const ratio = rectRef.current.ratio || 1;
          const horizontalOnly = resizeHandle === 'e' || resizeHandle === 'w';
          const verticalOnly = resizeHandle === 'n' || resizeHandle === 's';

          if (horizontalOnly) {
            newHeight = Math.max(20, newWidth / ratio);
          } else if (verticalOnly) {
            newWidth = Math.max(20, newHeight * ratio);
          } else {
            const useX = Math.abs(deltaX) >= Math.abs(deltaY);
            if (useX) {
              newHeight = Math.max(20, newWidth / ratio);
              if (resizeHandle.includes('n')) {
                newY = rectRef.current.y + (rectRef.current.height - newHeight);
              }
            } else {
              newWidth = Math.max(20, newHeight * ratio);
              if (resizeHandle.includes('w')) {
                newX = rectRef.current.x + (rectRef.current.width - newWidth);
              }
            }
          }
        }

        if (frameRef.current !== null) {
          cancelAnimationFrame(frameRef.current);
        }
        frameRef.current = requestAnimationFrame(() => {
          onResize({ width: newWidth, height: newHeight, x: newX, y: newY });
        });

        rectRef.current.width = newWidth;
        rectRef.current.height = newHeight;
        rectRef.current.x = newX;
        rectRef.current.y = newY;
        dragStartRef.current = { x: event.clientX, y: event.clientY };
      };

      const handleWindowUp = () => {
        document.body.style.userSelect = '';
        document.body.style.cursor = '';
        setIsInteracting(false);
        setResizeHandle(null);
        onDragEnd?.();
      };

      document.body.style.userSelect = 'none';
      document.body.style.cursor = resizeHandle ? `${resizeHandle}-resize` : 'grabbing';

      window.addEventListener('mousemove', handleWindowMove);
      window.addEventListener('mouseup', handleWindowUp);

      return () => {
        document.body.style.userSelect = '';
        document.body.style.cursor = '';
        if (frameRef.current !== null) {
          cancelAnimationFrame(frameRef.current);
          frameRef.current = null;
        }
        window.removeEventListener('mousemove', handleWindowMove);
        window.removeEventListener('mouseup', handleWindowUp);
      };
    }, [isInteracting, resizeHandle, onDrag, onResize, onDragEnd, scale]);

    const commitTextDraft = () => {
      updateElement(element.id, { content: textDraft });
      setIsTextEditing(false);
    };

    const cancelTextDraft = () => {
      setTextDraft(element.content || '');
      setIsTextEditing(false);
    };

    const handleContainerClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      onSelect(e);
    };

    const handleDoubleClick = (e: React.MouseEvent) => {
      if (isSystemBoundary || element.type !== 'text') {
        return;
      }
      e.stopPropagation();
      onSelect(e);
      setIsTextEditing(true);
    };

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
        cursor: isSystemBoundary ? 'default' : isInteracting ? 'grabbing' : 'grab',
        userSelect: 'none',
        touchAction: 'none',
      }),
      [
        element.x,
        element.y,
        element.width,
        element.height,
        element.rotation,
        element.zIndex,
        element.visible,
        isSystemBoundary,
        isInteracting,
      ]
    );

    const borderStyle: React.CSSProperties = isSelected
      ? {
          border: `2px solid ${selectionColor}`,
          boxShadow: `inset 0 0 0 1px ${selectionColor}33`,
          outlineOffset: '-2px',
        }
      : {
          border: '2px solid transparent',
        };

    // Resize handles
    const ResizeHandle: React.FC<{ handle: ResizeHandle }> = ({ handle }) => (
      <div
        onMouseDown={(e) => handleMouseDown(e, handle)}
        style={{
          position: 'absolute',
          width: '10px',
          height: '10px',
          backgroundColor: selectionColor,
          border: '1px solid white',
          borderRadius: '2px',
          cursor: `${handle}-resize`,
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
        onMouseDown={handleMouseDown}
        onClick={handleContainerClick}
        onDoubleClick={handleDoubleClick}
        className="transition-opacity"
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
          <div style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
            {element.type === 'text' &&
              (isTextEditing ? (
                <textarea
                  value={textDraft}
                  onChange={(e) => setTextDraft(e.target.value)}
                  onBlur={commitTextDraft}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      commitTextDraft();
                    }
                    if (e.key === 'Escape') {
                      e.preventDefault();
                      cancelTextDraft();
                    }
                  }}
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
                    justifyContent: 'center',
                    padding: '8px',
                    boxSizing: 'border-box',
                    wordWrap: 'break-word',
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
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: element.objectFit as any,
                  opacity: element.opacity ?? 1,
                  filter: element.shadowBlur ? `drop-shadow(${shadowStyle})` : undefined,
                }}
              />
            )}

            {element.type === 'shape' && (
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  backgroundColor: element.backgroundColor,
                  border:
                    element.strokePosition === 'outside'
                      ? 'none'
                      : `${element.borderWidth || 0}px solid ${element.borderColor || '#000000'}`,
                  outline:
                    element.strokePosition === 'outside'
                      ? `${element.borderWidth || 0}px solid ${element.borderColor || '#000000'}`
                      : undefined,
                  boxSizing: element.strokePosition === 'inside' ? 'border-box' : 'content-box',
                  borderRadius: element.shapeType === 'circle' ? '50%' : '0',
                  opacity: element.opacity ?? 1,
                  boxShadow: shadowStyle,
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
