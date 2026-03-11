'use client';

import React, { useCallback } from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import { ZoomIn, ZoomOut, RotateCcw, Ruler, Magnet, Trash2 } from 'lucide-react';

/**
 * Toolbar Component
 *
 * Provides canvas-level controls:
 * - Zoom in/out
 * - Reset zoom
 * - Delete selected element
 */
const Toolbar: React.FC = () => {
  const scale = useEditorStore((state) => state.scale);
  const setScale = useEditorStore((state) => state.setScale);
  const selectedElementId = useEditorStore((state) => state.selectedElementId);
  const deleteElement = useEditorStore((state) => state.deleteElement);
  const elements = useEditorStore((state) => state.elements);
  const showGuides = useEditorStore((state) => state.showGuides);
  const setShowGuides = useEditorStore((state) => state.setShowGuides);
  const snapToGrid = useEditorStore((state) => state.snapToGrid);
  const setSnapToGrid = useEditorStore((state) => state.setSnapToGrid);
  const selectedElement = elements.find((element) => element.id === selectedElementId);
  const isSystemBoundarySelected = !!selectedElement?.id.startsWith('system-boundary-');

  const handleZoomIn = useCallback(() => {
    setScale(Math.min(4, scale * 1.2));
  }, [scale, setScale]);

  const handleZoomOut = useCallback(() => {
    setScale(Math.max(0.2, scale / 1.2));
  }, [scale, setScale]);

  const handleReset = useCallback(() => {
    setScale(1);
  }, [setScale]);

  const handleDelete = useCallback(() => {
    if (selectedElementId && !isSystemBoundarySelected) {
      deleteElement(selectedElementId);
    }
  }, [selectedElementId, isSystemBoundarySelected, deleteElement]);

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-white border-b border-gray-200">
      {/* Zoom controls */}
      <div className="flex items-center gap-1">
        <button
          onClick={handleZoomOut}
          className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-md transition"
          title="Zoom Out"
        >
          <ZoomOut size={16} />
        </button>
        <span className="text-xs text-gray-500 min-w-[36px] text-center tabular-nums">
          {Math.round(scale * 100)}%
        </span>
        <button
          onClick={handleZoomIn}
          className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-md transition"
          title="Zoom In"
        >
          <ZoomIn size={16} />
        </button>
        <button
          onClick={handleReset}
          className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-md transition"
          title="Reset Zoom"
        >
          <RotateCcw size={14} />
        </button>
      </div>

      <div className="w-px h-4 bg-gray-200" />

      {/* Guides toggle */}
      <button
        onClick={() => setShowGuides(!showGuides)}
        className={`p-1.5 rounded-md transition ${showGuides ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'}`}
        title="Toggle Guides"
      >
        <Ruler size={16} />
      </button>

      {/* Snap toggle */}
      <button
        onClick={() => setSnapToGrid(!snapToGrid)}
        className={`p-1.5 rounded-md transition ${snapToGrid ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'}`}
        title="Toggle Snap to Grid"
      >
        <Magnet size={16} />
      </button>

      {/* Delete */}
      {selectedElementId && !isSystemBoundarySelected && (
        <>
          <div className="w-px h-4 bg-gray-200" />
          <button
            onClick={handleDelete}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition"
          >
            <Trash2 size={13} />
            Delete
          </button>
        </>
      )}
    </div>
  );
};

export default Toolbar;
