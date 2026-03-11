'use client';

import React, { useState, useEffect } from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import { useTemplateStore } from '@/store/useTemplateStore';
import { useParams, useRouter } from 'next/navigation';
import Canvas from '@/components/editor/Canvas';
import Toolbar from '@/components/editor/Toolbar';
import SystemLayoutPicker from '@/components/editor/SystemLayoutPicker';
import InlineElementEditor from '@/components/editor/InlineElementEditor';
import ExportModal from '@/components/editor/ExportModal';
import QuickEdit from '@/components/editor/QuickEdit';
import LayerPanel from '@/components/editor/LayerPanel';
import Button from '@/components/shared/Button';
import Input from '@/components/shared/Input';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import { Save, Download, Eye, FileText, Home, Sparkles, Type, Square, Circle, Image as ImageIcon } from 'lucide-react';
import { CertificateElement } from '@/types/CertificateTemplate';
import { QuickEditData } from '@/components/editor/QuickEdit';
import {
  LayoutOrientation,
  SystemLayoutPreset,
  systemLayoutPresets,
} from '@/components/editor/systemPresets';

/**
 * Editor Page
 *
 * Full certificate template editor with:
 * - Side panel for adding elements
 * - Canvas for editing
 * - Property panel for customization
 * - Toolbar for zoom and export
 *
 * URL: /editor/[template-id]
 */
export default function EditorPage() {
  const params = useParams();
  const router = useRouter();
  const rawTemplateId = params?.id;
  const templateId = Array.isArray(rawTemplateId)
    ? rawTemplateId[0]
    : rawTemplateId || 'untitled-template';

  const template = useEditorStore((state) => state.template);
  const setTemplate = useEditorStore((state) => state.setTemplate);
  const updateTemplateMetadata = useEditorStore((state) => state.updateTemplateMetadata);
  const reorderElements = useEditorStore((state) => state.reorderElements);
  const selectedElementId = useEditorStore((state) => state.selectedElementId);
  const setSelectedElementId = useEditorStore((state) => state.setSelectedElementId);
  const elements = useEditorStore((state) => state.elements);
  const addElement = useEditorStore((state) => state.addElement);
  const undo = useEditorStore((state) => state.undo);
  const redo = useEditorStore((state) => state.redo);
  const addTemplate = useTemplateStore((state) => state.addTemplate);
  const updateTemplateInStore = useTemplateStore((state) => state.updateTemplate);
  const templates = useTemplateStore((state) => state.templates);

  const [isSaving, setIsSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showQuickEdit, setShowQuickEdit] = useState(false);
  const [activePresetId, setActivePresetId] = useState<string | null>(() => {
    // Initialize with first digital landscape preset
    const defaultPreset = systemLayoutPresets.find(
      (p) => p.category === 'digital' && p.orientation === 'landscape'
    );
    return defaultPreset?.id || null;
  });
  const [activeOrientation, setActiveOrientation] = useState<LayoutOrientation>('landscape');
  const [brandLogos, setBrandLogos] = useState<string[]>([]);
  const [sidebarTab, setSidebarTab] = useState<'layout' | 'edit'>('layout');
  const [showLayerPanel, setShowLayerPanel] = useState(true);

  const ALLOWED_VARIABLES = ['[recipient.name]', '[recipient.surname]', '[certificate.success_rate]'];

  const selectedElement = elements.find((el) => el.id === selectedElementId) || null;
  // Auto-switch to edit tab when user selects an element
  useEffect(() => {
    if (selectedElementId) {
      setSidebarTab('edit');
    }
  }, [selectedElementId]);

  useEffect(() => {
    if (!template) {
      // Initialize with empty template
      setTemplate({
        id: templateId,
        name: 'Untitled Template',
        description: '',
        orientation: 'landscape',
        width: 297,
        height: 210,
        backgroundColor: '#ffffff',
        elements: [],
        variables: ['[recipient.name]', '[recipient.surname]'],
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  }, [templateId, template, setTemplate]);

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (template) {
        // Sync live elements into the template before persisting
        const templateToSave = { ...template, elements, updatedAt: new Date() };
        const exists = templates.some((entry) => entry.id === template.id);
        if (exists) {
          updateTemplateInStore(template.id, templateToSave);
        } else {
          addTemplate(templateToSave);
        }
        setTemplate(templateToSave);
      }
      alert('Template saved!');
    } catch (error) {
      console.error('Failed to save:', error);
      alert('Failed to save template');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownloadPDF = async () => {
    setShowExportModal(true);
  };

  const handleBulkGenerate = () => {
    if (!template) return;
    setShowQuickEdit(true);
  };

  const handleApplyPreset = (preset: SystemLayoutPreset) => {
    if (!template) return;

    const defaultLogoWidth = preset.orientation === 'landscape' ? 12 : 20;
    const defaultLogoHeight = preset.orientation === 'landscape' ? 12 : 10;
    const issuerLogoX = preset.orientation === 'landscape' ? 6 : 8;
    const sponsorLogoX = preset.orientation === 'landscape' ? 82 : 72;
    const logoY = preset.orientation === 'landscape' ? 80 : 84;

    const sanitizedPresetElements: CertificateElement[] = preset.elements.map((element) => {
      if (element.type !== 'text') {
        return element;
      }

      return {
        ...element,
        content: (element.content || '')
          .replace(/\[certificate\.issued_on\]/g, '[recipient.surname]')
          .replace(/\[certificate\.uuid\]/g, '[certificate.success_rate]'),
      };
    });

    const withBoundary = sanitizedPresetElements.some((element) =>
      element.id.startsWith('system-boundary-')
    )
      ? sanitizedPresetElements
      : [
          {
            id: `system-boundary-${preset.id}`,
            type: 'shape' as const,
            label: 'System Boundary',
            x: 2.5,
            y: 2.5,
            width: 95,
            height: 95,
            rotation: 0,
            zIndex: 0,
            visible: true,
            shapeType: 'rectangle' as const,
            backgroundColor: 'transparent',
            borderColor: '#1f2937',
            borderWidth: 2,
          },
          ...sanitizedPresetElements,
        ];

    const withCoreZones: CertificateElement[] = [...withBoundary];

    const hasLogos = withCoreZones.some((element) =>
      element.label.toLowerCase().includes('logo')
    );

    if (!hasLogos) {
      if (brandLogos.length > 0) {
        withCoreZones.push({
          id: `${preset.id}-issuer-logo`,
          type: 'image',
          label: 'Issuer Logo',
          x: issuerLogoX,
          y: logoY,
          width: defaultLogoWidth,
          height: defaultLogoHeight,
          rotation: 0,
          zIndex: 10,
          visible: true,
          src: brandLogos[0] || '',
          objectFit: 'contain',
          opacity: 1,
        });

        const sponsorBrandLogos = brandLogos.slice(1);
        sponsorBrandLogos.forEach((logoSrc, logoIndex) => {
          const spacing = defaultLogoWidth + 2;
          withCoreZones.push({
            id: `${preset.id}-sponsor-logo-${logoIndex}`,
            type: 'image',
            label: `Sponsor Logo ${logoIndex + 1}`,
            x: sponsorLogoX - (sponsorBrandLogos.length - 1) * spacing / 2 + logoIndex * spacing,
            y: logoY,
            width: defaultLogoWidth,
            height: defaultLogoHeight,
            rotation: 0,
            zIndex: 11 + logoIndex,
            visible: true,
            src: logoSrc,
            objectFit: 'contain',
            opacity: 1,
          });
        });
      } else {
        withCoreZones.push({
          id: `${preset.id}-issuer-logo`,
          type: 'image',
          label: 'Issuer Logo',
          x: issuerLogoX,
          y: logoY,
          width: defaultLogoWidth,
          height: defaultLogoHeight,
          rotation: 0,
          zIndex: 10,
          visible: true,
          src: '',
          objectFit: 'contain',
          opacity: 1,
        });
      }
    }

    if (
      !withCoreZones.some(
        (element) => element.type === 'text' && (element.content || '').includes('[recipient.surname]')
      )
    ) {
      withCoreZones.push({
        id: `${preset.id}-recipient-surname`,
        type: 'text',
        label: 'Recipient Surname',
        x: preset.orientation === 'landscape' ? 41 : 30,
        y: preset.orientation === 'landscape' ? 90 : 93,
        width: 20,
        height: 4,
        rotation: 0,
        zIndex: 12,
        visible: true,
        content: '[recipient.surname]',
        fontSize: 11,
        fontFamily: 'Arial',
        fontWeight: '600',
        color: '#4b5563',
        textAlign: 'center',
        lineHeight: 1.3,
      });
    }

    const now = Date.now();
    const withIndexes: CertificateElement[] = withCoreZones.map((element, index) => {
      const nextId = element.id.startsWith('system-boundary-')
        ? `system-boundary-${preset.id}-${now}`
        : `${preset.id}-${index}-${now}`;

      if (element.type === 'image') {
        let nextSrc = element.src;
        if (element.label.toLowerCase().includes('issuer logo')) {
          nextSrc = brandLogos[0] || element.src;
        } else if (element.label.toLowerCase().includes('sponsor logo')) {
          const sponsorMatch = element.label.match(/sponsor logo (\d+)/i);
          const logoIndex = sponsorMatch ? parseInt(sponsorMatch[1]) : 0;
          nextSrc = brandLogos[logoIndex + 1] || element.src;
        }

        return {
          ...element,
          id: nextId,
          src: nextSrc,
          zIndex: index,
        };
      }

      return {
        ...element,
        id: nextId,
        zIndex: index,
      };
    });

    const variablesFromElements = Array.from(
      new Set(
        withIndexes
          .filter((element) => element.type === 'text')
          .map((element) => (element.type === 'text' ? element.content || '' : ''))
          .filter((content) => ALLOWED_VARIABLES.includes(content))
      )
    );

    const normalizedVariables = [
      '[recipient.name]',
      '[recipient.surname]',
      ...variablesFromElements.filter(
        (variable) => variable !== '[recipient.name]' && variable !== '[recipient.surname]'
      ),
    ];

    reorderElements(withIndexes);
    setSelectedElementId(null);
    setActivePresetId(preset.id);
    setActiveOrientation(preset.orientation);
    setTemplate({
      ...template,
      orientation: preset.orientation,
      width: preset.orientation === 'landscape' ? 297 : 210,
      height: preset.orientation === 'landscape' ? 210 : 297,
      elements: withIndexes,
      variables: normalizedVariables,
      updatedAt: new Date(),
    });
  };

  const readFileAsDataUrl = (file: File, onDone: (dataUrl: string) => void) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onDone(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleBrandLogoUpload = (file: File, logoIndex: number = 0) => {
    readFileAsDataUrl(file, (dataUrl) => {
      const newLogos = [...brandLogos];
      newLogos[logoIndex] = dataUrl;
      setBrandLogos(newLogos);
      
      elements
        .filter((element) => element.type === 'image' && element.label.toLowerCase().includes('logo'))
        .forEach((element) => {
          useEditorStore.getState().updateElement(element.id, { src: dataUrl });
        });
    });
  };

  const handleRemoveBrandLogo = (index: number) => {
    const newLogos = brandLogos.filter((_, i) => i !== index);
    setBrandLogos(newLogos);
  };

  const handleQuickGenerate = (data: QuickEditData) => {
    const uploadedLogos = data.sponsorLogos || [];
    if (uploadedLogos.length > 0) {
      setBrandLogos(uploadedLogos);
      elements
        .filter((element) => element.type === 'image' && element.label.toLowerCase().includes('logo'))
        .forEach((element) => {
          let logoIndex = 0;
          if (element.label.toLowerCase().includes('issuer logo')) {
            logoIndex = 0;
          } else {
            const matched = element.label.match(/sponsor logo\s*(\d+)/i);
            logoIndex = matched ? Math.max(parseInt(matched[1], 10), 1) : 1;
          }
          const src = uploadedLogos[logoIndex - 1] || uploadedLogos[logoIndex];
          if (src) {
            useEditorStore.getState().updateElement(element.id, { src });
          }
        });
    }
  };

  const handleOrientationChange = (orientation: LayoutOrientation) => {
    if (!template) return;

    setActiveOrientation(orientation);
    setTemplate({
      ...template,
      orientation,
      width: orientation === 'landscape' ? 297 : 210,
      height: orientation === 'landscape' ? 210 : 297,
      updatedAt: new Date(),
    });
  };

  if (!template) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gray-100">
      <header className="flex-shrink-0 z-30 bg-white border-b border-gray-200">
        <div className="px-4 py-2 flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => router.push('/')}
              className="flex items-center gap-1.5"
            >
              <Home size={14} />
              Home
            </Button>
            <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-blue-50 text-blue-700 border border-blue-100 flex items-center gap-1">
              <Sparkles size={10} />
              {template.orientation === 'landscape' ? 'A4 L' : 'A4 P'}
            </span>
            <span className="hidden sm:inline-flex px-2 py-0.5 text-[10px] font-semibold rounded-full bg-gray-100 text-gray-500">
              {elements.length} items
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Input
              value={template.name}
              onChange={(e) => updateTemplateMetadata(e.target.value, template.description)}
              className="w-48 text-xs"
              placeholder="Template name"
            />
          </div>

          <nav className="flex items-center gap-1.5">
            <Button
              size="sm"
              variant="primary"
              onClick={handleSave}
              disabled={isSaving || !template.name.trim()}
              className="flex items-center gap-1.5"
            >
              <Save size={14} />
              {isSaving ? 'Saving…' : 'Save'}
            </Button>
            <Button
              size="sm"
              variant={showPreview ? 'primary' : 'secondary'}
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center gap-1.5"
            >
              <Eye size={14} />
              {showPreview ? 'Edit' : 'Preview'}
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={handleDownloadPDF}
              className="flex items-center gap-1.5"
            >
              <Download size={14} />
              Export
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={handleBulkGenerate}
              className="flex items-center gap-1.5"
            >
              <FileText size={14} />
              Bulk
            </Button>
          </nav>
        </div>
      </header>

      {/* Main Editor */}
      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
        {!showPreview && (
          <div className="w-full lg:w-[300px] lg:flex-shrink-0 bg-white border-b lg:border-b-0 lg:border-r border-gray-200 flex flex-col overflow-hidden">
            {/* Sidebar tab bar */}
            <div className="flex border-b border-gray-200 flex-shrink-0">
              <button
                onClick={() => setSidebarTab('layout')}
                className={`flex-1 py-2.5 text-xs font-medium transition-colors ${
                  sidebarTab === 'layout'
                    ? 'border-b-2 border-gray-900 text-gray-900'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Layouts
              </button>
              <button
                onClick={() => setSidebarTab('edit')}
                className={`flex-1 py-2.5 text-xs font-medium transition-colors flex items-center justify-center gap-1.5 ${
                  sidebarTab === 'edit'
                    ? 'border-b-2 border-gray-900 text-gray-900'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Edit
                {selectedElement && (
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                )}
              </button>
            </div>

            {/* Sidebar content */}
            <div className="flex-1 overflow-y-auto [scrollbar-gutter:stable]">
              {sidebarTab === 'layout' && (
                <SystemLayoutPicker
                  presets={systemLayoutPresets}
                  activePresetId={activePresetId}
                  activeOrientation={activeOrientation}
                  onApplyPreset={handleApplyPreset}
                  onOrientationChange={handleOrientationChange}
                  onBrandLogoUpload={handleBrandLogoUpload}
                  brandLogos={brandLogos}
                  onRemoveBrandLogo={handleRemoveBrandLogo}
                />
              )}
              {sidebarTab === 'edit' && (
                <InlineElementEditor element={selectedElement} />
              )}
            </div>
          </div>
        )}

        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Insert toolbar strip */}
          {!showPreview && (
            <div className="flex-shrink-0 bg-white border-b border-gray-200 px-3 py-1 flex items-center gap-0.5">
              <span className="text-[10px] text-gray-400 tracking-wide mr-2">Insert</span>
              <button
                onClick={() => {
                  const id = `text-${Date.now()}`;
                  addElement({ id, type: 'text', label: 'Text', x: 30, y: 40, width: 30, height: 10, rotation: 0, zIndex: elements.length + 1, visible: true, content: 'New Text', fontSize: 20, fontFamily: 'Arial', fontWeight: 'normal', color: '#1f2937', textAlign: 'center', lineHeight: 1.3, letterSpacing: 0, opacity: 1 });
                  setSelectedElementId(id);
                  setSidebarTab('edit');
                }}
                className="flex items-center gap-1 px-2 py-1 text-[11px] text-gray-600 hover:bg-gray-100 rounded transition-colors"
                title="Add Text"
              >
                <Type size={13} /> Text
              </button>
              <button
                onClick={() => {
                  const id = `shape-${Date.now()}`;
                  addElement({ id, type: 'shape', label: 'Rectangle', x: 35, y: 35, width: 20, height: 15, rotation: 0, zIndex: elements.length + 1, visible: true, shapeType: 'rectangle', backgroundColor: '#e2e8f0', borderColor: '#64748b', borderWidth: 2 });
                  setSelectedElementId(id);
                  setSidebarTab('edit');
                }}
                className="flex items-center gap-1 px-2 py-1 text-[11px] text-gray-600 hover:bg-gray-100 rounded transition-colors"
                title="Add Rectangle"
              >
                <Square size={13} /> Rect
              </button>
              <button
                onClick={() => {
                  const id = `shape-${Date.now()}`;
                  addElement({ id, type: 'shape', label: 'Circle', x: 40, y: 35, width: 15, height: 15, rotation: 0, zIndex: elements.length + 1, visible: true, shapeType: 'circle', backgroundColor: '#e2e8f0', borderColor: '#64748b', borderWidth: 2 });
                  setSelectedElementId(id);
                  setSidebarTab('edit');
                }}
                className="flex items-center gap-1 px-2 py-1 text-[11px] text-gray-600 hover:bg-gray-100 rounded transition-colors"
                title="Add Circle"
              >
                <Circle size={13} /> Circle
              </button>
              <button
                onClick={() => {
                  const id = `shape-${Date.now()}`;
                  addElement({ id, type: 'shape', label: 'Triangle', x: 40, y: 30, width: 15, height: 15, rotation: 0, zIndex: elements.length + 1, visible: true, shapeType: 'triangle', backgroundColor: '#e2e8f0', borderColor: 'transparent', borderWidth: 0 });
                  setSelectedElementId(id);
                  setSidebarTab('edit');
                }}
                className="flex items-center gap-1 px-2 py-1 text-[11px] text-gray-600 hover:bg-gray-100 rounded transition-colors"
                title="Add Triangle"
              >
                <span className="text-sm leading-none">△</span> Triangle
              </button>
              <label
                className="flex items-center gap-1 px-2 py-1 text-[11px] text-gray-600 hover:bg-gray-100 rounded transition-colors cursor-pointer"
                title="Upload Image"
              >
                <ImageIcon size={13} /> Image
                <input
                  type="file"
                  accept="image/*,.svg"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    const input = e.target;
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = () => {
                      const id = `image-${Date.now()}`;
                      addElement({ id, type: 'image', label: file.name.replace(/\.[^/.]+$/, '') || 'Image', x: 30, y: 30, width: 20, height: 15, rotation: 0, zIndex: elements.length + 1, visible: true, src: reader.result as string, objectFit: 'contain', opacity: 1 });
                      setSelectedElementId(id);
                      setSidebarTab('edit');
                      input.value = '';
                    };
                    reader.readAsDataURL(file);
                  }}
                />
              </label>
            </div>
          )}

          <Canvas orientation={template.orientation} backgroundColor={template.backgroundColor} />

          {!showPreview && <Toolbar />}
        </div>

        {/* Right: Layer panel */}
        {!showPreview && (
          <LayerPanel isOpen={showLayerPanel} onToggle={() => setShowLayerPanel((v) => !v)} />
        )}
      </div>

      {/* Export Modal */}
      <ExportModal
        template={template}
        data={{}}
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
      />

      {/* Quick Edit Modal */}
      <QuickEdit
        template={template}
        isOpen={showQuickEdit}
        onClose={() => setShowQuickEdit(false)}
        onGenerate={handleQuickGenerate}
      />
    </div>
  );
}
