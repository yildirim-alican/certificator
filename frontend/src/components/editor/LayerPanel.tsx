'use client';

import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  Eye,
  EyeOff,
  Trash2,
  Layers,
  ChevronRight,
  GripVertical,
  Type,
  Square,
  Circle,
  Image as ImageIcon,
} from 'lucide-react';
import { useEditorStore } from '@/store/useEditorStore';
import { CertificateElement } from '@/types/CertificateTemplate';

// ─── Icon helpers ──────────────────────────────────────────────

function ElementIcon({ element }: { element: CertificateElement }) {
  if (element.type === 'text')
    return <Type size={12} className="text-blue-500 flex-shrink-0" />;
  if (element.type === 'image')
    return <ImageIcon size={12} className="text-green-500 flex-shrink-0" />;
  if (element.shapeType === 'circle')
    return <Circle size={12} className="text-purple-500 flex-shrink-0" />;
  return <Square size={12} className="text-orange-500 flex-shrink-0" />;
}

// ─── Layer row ──────────────────────────────────────────────────

interface LayerRowProps {
  element: CertificateElement;
  isSelected: boolean;
  isMultiSelected: boolean;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onDragOver: (e: React.DragEvent, id: string) => void;
  onDrop: (e: React.DragEvent, id: string) => void;
}

function LayerRow({
  element,
  isSelected,
  isMultiSelected,
  onDragStart,
  onDragOver,
  onDrop,
}: LayerRowProps) {
  const setSelectedElementId = useEditorStore((s) => s.setSelectedElementId);
  const toggleElementSelection = useEditorStore((s) => s.toggleElementSelection);
  const updateElement = useEditorStore((s) => s.updateElement);
  const deleteElement = useEditorStore((s) => s.deleteElement);
  const isBoundary = element.id.startsWith('system-boundary-');

  const bg = isSelected
    ? 'bg-gray-900 text-white'
    : isMultiSelected
      ? 'bg-orange-50 text-orange-800 border-l-2 border-orange-400'
      : 'text-gray-700 hover:bg-gray-50';

  return (
    <div
      className={`group flex items-center gap-1.5 px-2 py-1.5 rounded cursor-pointer transition-colors select-none ${bg}`}
      draggable={!isBoundary}
      onDragStart={(e) => onDragStart(e, element.id)}
      onDragOver={(e) => onDragOver(e, element.id)}
      onDrop={(e) => onDrop(e, element.id)}
      onClick={(e) => {
        if (e.shiftKey && !isBoundary) {
          toggleElementSelection(element.id);
        } else {
          setSelectedElementId(element.id);
        }
      }}
    >
      {/* Drag handle */}
      {!isBoundary && (
        <GripVertical
          size={12}
          className={`flex-shrink-0 ${isSelected ? 'text-white/40' : 'text-gray-300 group-hover:text-gray-500'}`}
        />
      )}
      {isBoundary && <div className="w-3 flex-shrink-0" />}

      {/* Element icon */}
      <ElementIcon element={element} />

      {/* Label */}
      <span className="flex-1 text-[11px] truncate">{element.label}</span>

      {/* zIndex badge */}
      <span className={`text-[9px] flex-shrink-0 ${isSelected ? 'text-white/40' : 'text-gray-400'}`}>
        z{element.zIndex}
      </span>

      {/* Visibility toggle */}
      <button
        className={`flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity ${isSelected ? 'opacity-100 text-white/70 hover:text-white' : 'text-gray-400 hover:text-gray-700'}`}
        onClick={(e) => {
          e.stopPropagation();
          updateElement(element.id, { visible: !(element.visible !== false) });
        }}
        title={element.visible !== false ? 'Hide' : 'Show'}
      >
        {element.visible !== false ? <Eye size={12} /> : <EyeOff size={12} />}
      </button>

      {/* Delete */}
      {!isBoundary && (
        <button
          className={`flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity ${isSelected ? 'opacity-100 text-white/70 hover:text-red-300' : 'text-gray-400 hover:text-red-500'}`}
          onClick={(e) => {
            e.stopPropagation();
            deleteElement(element.id);
          }}
          title="Delete"
        >
          <Trash2 size={12} />
        </button>
      )}
    </div>
  );
}

// ─── Main panel ─────────────────────────────────────────────────

interface LayerPanelProps {
  isOpen: boolean;
  onToggle: () => void;
}

const LayerPanel: React.FC<LayerPanelProps> = ({ isOpen, onToggle }) => {
  const elements = useEditorStore((s) => s.elements);
  const selectedElementId = useEditorStore((s) => s.selectedElementId);
  const selectedElementIds = useEditorStore((s) => s.selectedElementIds);
  const deleteElements = useEditorStore((s) => s.deleteElements);
  const reorderElements = useEditorStore((s) => s.reorderElements);
  const setSelectedElementIds = useEditorStore((s) => s.setSelectedElementIds);

  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const dragSourceId = useRef<string | null>(null);

  const sorted = useMemo(
    () => [...elements].sort((a, b) => b.zIndex - a.zIndex),
    [elements]
  );

  const handleDragStart = useCallback((_e: React.DragEvent, id: string) => {
    dragSourceId.current = id;
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, id: string) => {
    e.preventDefault();
    setDragOverId(id);
  }, []);

  const handleDrop = useCallback(
    (_e: React.DragEvent, targetId: string) => {
      setDragOverId(null);
      const srcId = dragSourceId.current;
      if (!srcId || srcId === targetId) return;

      const reordered = [...sorted];
      const srcIdx = reordered.findIndex((el) => el.id === srcId);
      const tgtIdx = reordered.findIndex((el) => el.id === targetId);
      if (srcIdx === -1 || tgtIdx === -1) return;

      const [moved] = reordered.splice(srcIdx, 1);
      reordered.splice(tgtIdx, 0, moved);

      // Reassign zIndex values
      const withNewZ = reordered.reverse().map((el, i) => ({ ...el, zIndex: i }));
      reorderElements(withNewZ);
      dragSourceId.current = null;
    },
    [sorted, reorderElements]
  );

  const multiNonBoundary = selectedElementIds.filter(
    (id) => !id.startsWith('system-boundary-')
  );

  return (
    <div
      className="flex-shrink-0 bg-white border-l border-gray-200 flex flex-col overflow-hidden transition-all duration-200"
      style={{ width: isOpen ? 200 : 32 }}
    >
      {/* Toggle button */}
      <button
        onClick={onToggle}
        className="flex items-center justify-center w-full py-2.5 border-b border-gray-200 hover:bg-gray-50 transition-colors flex-shrink-0"
        title={isOpen ? 'Close layers' : 'Open layers'}
      >
        {isOpen ? (
          <div className="flex items-center gap-1.5 px-2 w-full">
            <Layers size={14} className="text-gray-600 flex-shrink-0" />
            <span className="text-xs font-medium text-gray-700 flex-1">Layers</span>
            <ChevronRight size={13} className="text-gray-400" />
          </div>
        ) : (
          <Layers size={14} className="text-gray-500" />
        )}
      </button>

      {isOpen && (
        <>
          {/* Multi-select action bar */}
          {multiNonBoundary.length > 1 && (
            <div className="px-2 py-1.5 border-b border-gray-100 flex items-center justify-between bg-orange-50">
              <span className="text-[10px] text-orange-700 font-medium">
                {multiNonBoundary.length} selected
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setSelectedElementIds([])}
                  className="text-[10px] text-gray-500 hover:text-gray-700 px-1"
                >
                  Clear
                </button>
                <button
                  onClick={() => deleteElements(multiNonBoundary)}
                  className="text-[10px] text-red-600 hover:text-red-800 flex items-center gap-0.5"
                  title="Delete selected"
                >
                  <Trash2 size={11} />
                </button>
              </div>
            </div>
          )}

          {/* Layer list */}
          <div className="flex-1 overflow-y-auto py-1 px-1 [scrollbar-gutter:stable]">
            {sorted.length === 0 ? (
              <p className="text-[10px] text-gray-400 text-center mt-4 px-2">
                No elements yet
              </p>
            ) : (
              sorted.map((el) => (
                <div
                  key={el.id}
                  className={dragOverId === el.id ? 'border-t-2 border-blue-400' : ''}
                >
                  <LayerRow
                    element={el}
                    isSelected={selectedElementId === el.id}
                    isMultiSelected={selectedElementIds.includes(el.id) && selectedElementIds.length > 1}
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                  />
                </div>
              ))
            )}
          </div>

          {/* Footer: element count */}
          <div className="flex-shrink-0 border-t border-gray-100 px-3 py-1.5">
            <span className="text-[10px] text-gray-400">
              {elements.length} element{elements.length !== 1 ? 's' : ''}
            </span>
          </div>
        </>
      )}
    </div>
  );
};

export default LayerPanel;
