'use client';

import React, { useCallback } from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

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
    setScale(Math.min(2, scale * 1.1));
  }, [scale, setScale]);

  const handleZoomOut = useCallback(() => {
    setScale(Math.max(0.5, scale / 1.1));
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
    <div className="flex items-center gap-3 p-4 bg-white border-b border-gray-200">
      <div className="flex items-center gap-2">
        <button
          onClick={handleZoomIn}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
          title="Zoom In"
        >
          <ZoomIn size={20} />
        </button>
        <span className="text-sm text-gray-600 min-w-max">{Math.round(scale * 100)}%</span>
        <button
          onClick={handleZoomOut}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
          title="Zoom Out"
        >
          <ZoomOut size={20} />
        </button>
        <button
          onClick={handleReset}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
          title="Reset Zoom"
        >
          <RotateCcw size={20} />
        </button>
      </div>

      <div className="border-l border-gray-200 h-6" />

      <button
        onClick={() => setShowGuides(!showGuides)}
        className={`px-3 py-2 text-sm rounded-lg transition ${showGuides ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}
      >
        Guides
      </button>

      <button
        onClick={() => setSnapToGrid(!snapToGrid)}
        className={`px-3 py-2 text-sm rounded-lg transition ${snapToGrid ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}
      >
        Snap
      </button>

      <div className="min-w-[140px]">
        {selectedElementId ? (
          <button
            onClick={handleDelete}
            disabled={isSystemBoundarySelected}
            className="w-full px-3 py-2 text-sm text-white bg-red-500 hover:bg-red-600 rounded-lg transition disabled:bg-gray-400"
          >
            {isSystemBoundarySelected ? 'Boundary Locked' : 'Delete Element'}
          </button>
        ) : (
          <div className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 text-gray-400 bg-gray-50 text-center">
            No Selection
          </div>
        )}
      </div>

      <div className="ml-auto hidden xl:flex items-center gap-2 text-xs text-gray-500">
        <span className="px-2 py-1 bg-gray-100 rounded border">Del</span>
        <span>Delete</span>
        <span className="px-2 py-1 bg-gray-100 rounded border">Arrow</span>
        <span>Nudge</span>
        <span className="px-2 py-1 bg-gray-100 rounded border">Shift+Arrow</span>
        <span>Fast Nudge</span>
        <span className="px-2 py-1 bg-gray-100 rounded border">Ctrl/Cmd+D</span>
        <span>Duplicate</span>
      </div>
    </div>
  );
};

export default Toolbar;
