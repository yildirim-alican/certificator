import { create } from 'zustand';
import { CertificateTemplate, CertificateElement } from '@/types/CertificateTemplate';

interface EditorStoreState {
  // Template State
  template: CertificateTemplate | null;
  setTemplate: (template: CertificateTemplate) => void;
  updateTemplateMetadata: (name: string, description?: string) => void;

  // Elements State (Single Source of Truth)
  elements: CertificateElement[];
  addElement: (element: CertificateElement) => void;
  updateElement: (id: string, updates: Partial<CertificateElement>) => void;
  deleteElement: (id: string) => void;
  deleteElements: (ids: string[]) => void;
  reorderElements: (newElements: CertificateElement[]) => void;

  // Undo/Redo History
  history: CertificateElement[][];
  historyIndex: number;
  addToHistory: () => void;
  undo: () => void;
  redo: () => void;

  // Selection State — single + multi
  selectedElementId: string | null;          // primary selection (single)
  setSelectedElementId: (id: string | null) => void;
  selectedElementIds: string[];              // multi-select set
  setSelectedElementIds: (ids: string[]) => void;
  toggleElementSelection: (id: string) => void; // shift+click

  // Canvas State
  scale: number;
  setScale: (scale: number) => void;
  offset: { x: number; y: number };
  setOffset: (offset: { x: number; y: number }) => void;

  // View State
  isDragging: boolean;
  setIsDragging: (isDragging: boolean) => void;
  showGuides: boolean;
  setShowGuides: (showGuides: boolean) => void;
  snapToGrid: boolean;
  setSnapToGrid: (snapToGrid: boolean) => void;
  selectionColor: string;
  setSelectionColor: (selectionColor: string) => void;

  // Reset
  reset: () => void;
}

export const useEditorStore = create<EditorStoreState>((set) => ({
  template: null,
  setTemplate: (template) => set({ template }),
  updateTemplateMetadata: (name, description) =>
    set((state) => ({
      template: state.template
        ? { ...state.template, name, description: description || state.template.description }
        : null,
    })),

  elements: [],
  addElement: (element) =>
    set((state) => ({
      elements: [...state.elements, element],
      history: [
        ...state.history.slice(0, state.historyIndex + 1),
        [...state.elements, element],
      ],
      historyIndex: state.historyIndex + 1,
    })),

  updateElement: (id, updates) =>
    set((state) => {
      const updatedElements = state.elements.map((el) => (el.id === id ? { ...el, ...updates } : el));
      return {
        elements: updatedElements,
        history: [
          ...state.history.slice(0, state.historyIndex + 1),
          updatedElements,
        ],
        historyIndex: state.historyIndex + 1,
      };
    }),

  deleteElement: (id) =>
    set((state) => {
      const filteredElements = state.elements.filter((el) => el.id !== id);
      return {
        elements: filteredElements,
        selectedElementId: state.selectedElementId === id ? null : state.selectedElementId,
        selectedElementIds: state.selectedElementIds.filter((sid) => sid !== id),
        history: [
          ...state.history.slice(0, state.historyIndex + 1),
          filteredElements,
        ],
        historyIndex: state.historyIndex + 1,
      };
    }),

  deleteElements: (ids) =>
    set((state) => {
      const idSet = new Set(ids);
      const filteredElements = state.elements.filter((el) => !idSet.has(el.id));
      return {
        elements: filteredElements,
        selectedElementId: idSet.has(state.selectedElementId ?? '') ? null : state.selectedElementId,
        selectedElementIds: state.selectedElementIds.filter((sid) => !idSet.has(sid)),
        history: [
          ...state.history.slice(0, state.historyIndex + 1),
          filteredElements,
        ],
        historyIndex: state.historyIndex + 1,
      };
    }),

  reorderElements: (newElements) => set((state) => ({
    elements: newElements,
    history: [
      ...state.history.slice(0, state.historyIndex + 1),
      newElements,
    ],
    historyIndex: state.historyIndex + 1,
  })),

  history: [],
  historyIndex: -1,
  addToHistory: () =>
    set((state) => ({
      history: [
        ...state.history.slice(0, state.historyIndex + 1),
        state.elements,
      ],
      historyIndex: state.historyIndex + 1,
    })),

  undo: () =>
    set((state) => {
      if (state.historyIndex > 0) {
        const newIndex = state.historyIndex - 1;
        return {
          elements: state.history[newIndex],
          historyIndex: newIndex,
        };
      }
      return state;
    }),

  redo: () =>
    set((state) => {
      if (state.historyIndex < state.history.length - 1) {
        const newIndex = state.historyIndex + 1;
        return {
          elements: state.history[newIndex],
          historyIndex: newIndex,
        };
      }
      return state;
    }),

  selectedElementId: null,
  setSelectedElementId: (id) =>
    set({ selectedElementId: id, selectedElementIds: id ? [id] : [] }),

  selectedElementIds: [],
  setSelectedElementIds: (ids) =>
    set({ selectedElementIds: ids, selectedElementId: ids[0] ?? null }),

  toggleElementSelection: (id) =>
    set((state) => {
      const already = state.selectedElementIds.includes(id);
      const next = already
        ? state.selectedElementIds.filter((sid) => sid !== id)
        : [...state.selectedElementIds, id];
      return {
        selectedElementIds: next,
        selectedElementId: next[0] ?? null,
      };
    }),

  scale: 1,
  setScale: (scale) => set({ scale }),

  offset: { x: 0, y: 0 },
  setOffset: (offset) => set({ offset }),

  isDragging: false,
  setIsDragging: (isDragging) => set({ isDragging }),

  showGuides: true,
  setShowGuides: (showGuides) => set({ showGuides }),

  snapToGrid: true,
  setSnapToGrid: (snapToGrid) => set({ snapToGrid }),

  selectionColor: '#3b82f6',
  setSelectionColor: (selectionColor) => set({ selectionColor }),

  reset: () =>
    set({
      template: null,
      elements: [],
      selectedElementId: null,
      selectedElementIds: [],
      scale: 1,
      offset: { x: 0, y: 0 },
      isDragging: false,
      showGuides: true,
      snapToGrid: true,
      selectionColor: '#3b82f6',
      history: [],
      historyIndex: -1,
    }),
}));
