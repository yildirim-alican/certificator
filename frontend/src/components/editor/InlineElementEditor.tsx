'use client';

import React, { useState } from 'react';
import { ChevronDown, Upload } from 'lucide-react';
import { CertificateElement } from '@/types/CertificateTemplate';
import { useEditorStore } from '@/store/useEditorStore';

interface InlineElementEditorProps {
  element: CertificateElement | null;
}

/* â”€â”€â”€ Micro components â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

interface SectionProps {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

function Section({ title, defaultOpen = true, children }: SectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between py-2 text-left"
      >
        <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">{title}</span>
        <ChevronDown
          size={13}
          className={`text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && <div className="pb-3">{children}</div>}
    </div>
  );
}

interface FieldProps {
  label: string;
  children: React.ReactNode;
  className?: string;
}

function Field({ label, children, className = '' }: FieldProps) {
  return (
    <div className={className}>
      <p className="text-[10px] uppercase tracking-wide text-gray-400 mb-1">{label}</p>
      {children}
    </div>
  );
}

const inputCls =
  'w-full px-2 py-1.5 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 bg-white';
const selectCls =
  'w-full px-2 py-1.5 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 bg-white';

function NumInput({
  value,
  onChange,
  min,
  max,
  step = 0.5,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
}) {
  return (
    <input
      type="number"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => {
        const parsed = parseFloat(e.target.value);
        if (!Number.isNaN(parsed)) onChange(parsed);
      }}
      className={inputCls}
    />
  );
}

/* â”€â”€â”€ Main component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

const InlineElementEditor: React.FC<InlineElementEditorProps> = ({ element }) => {
  const updateElement = useEditorStore((state) => state.updateElement);
  const selectionColor = useEditorStore((state) => state.selectionColor);
  const setSelectionColor = useEditorStore((state) => state.setSelectionColor);

  if (!element) {
    return (
      <div className="p-4">
        
        <p className="text-xs text-gray-400 text-center mt-4">
          Select an element on the canvas to edit its properties.
        </p>
      </div>
    );
  }

  const isSystemBoundary = element.id.startsWith('system-boundary-');
  if (isSystemBoundary) {
    return (
      <div className="p-4">
        
        <p className="text-xs text-gray-400 text-center mt-4">System boundary is locked.</p>
      </div>
    );
  }

  const set = (key: string, value: unknown) => updateElement(element.id, { [key]: value });

  const alignElement = (mode: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => {
    if (mode === 'left') set('x', 0);
    if (mode === 'center') set('x', Math.max(0, (100 - element.width) / 2));
    if (mode === 'right') set('x', Math.max(0, 100 - element.width));
    if (mode === 'top') set('y', 0);
    if (mode === 'middle') set('y', Math.max(0, (100 - element.height) / 2));
    if (mode === 'bottom') set('y', Math.max(0, 100 - element.height));
  };

  const alignBtns = (
    ['Left', 'Center', 'Right', 'Top', 'Middle', 'Bottom'] as const
  ).map((label) => (
    <button
      key={label}
      onClick={() => alignElement(label.toLowerCase() as Parameters<typeof alignElement>[0])}
      className="py-1 text-[11px] rounded border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 transition-colors"
    >
      {label}
    </button>
  ));

  return (
    <div className="p-4 divide-y divide-gray-100">
      {/* Header */}
      <div className="pb-3">
        
        <p className="text-xs font-medium text-gray-700">{element.label}</p>
        <p className="text-[10px] text-gray-400">{element.type}</p>
      </div>

      {/* Position & Size */}
      <Section title="Position & Size">
        <div className="grid grid-cols-2 gap-1.5">
          <Field label="X"><NumInput value={element.x} min={0} max={100} onChange={(v) => set('x', v)} /></Field>
          <Field label="Y"><NumInput value={element.y} min={0} max={100} onChange={(v) => set('y', v)} /></Field>
          <Field label="W"><NumInput value={element.width} min={1} max={100} onChange={(v) => set('width', v)} /></Field>
          <Field label="H"><NumInput value={element.height} min={1} max={100} onChange={(v) => set('height', v)} /></Field>
        </div>
      </Section>

      {/* Transform */}
      <Section title="Transform">
        <div className="grid grid-cols-2 gap-1.5">
          <Field label="Rotation">
            <NumInput value={element.rotation} min={-180} max={180} step={1} onChange={(v) => set('rotation', v)} />
          </Field>
          <Field label="Opacity">
            <NumInput value={element.opacity ?? 1} min={0} max={1} step={0.05} onChange={(v) => set('opacity', v)} />
          </Field>
        </div>
      </Section>

      {/* Align */}
      <Section title="Align">
        <div className="grid grid-cols-3 gap-1">{alignBtns}</div>
      </Section>

      {/* Selection color */}
      <Section title="Selection">
        <Field label="Highlight Color">
          <input
            type="color"
            value={selectionColor}
            onChange={(e) => setSelectionColor(e.target.value)}
            className="w-full h-8 rounded border border-gray-200 cursor-pointer"
          />
        </Field>
      </Section>

      {/* Text-specific */}
      {element.type === 'text' && (
        <Section title="Text">
          <div className="space-y-2">
            <Field label="Content">
              <textarea
                value={element.content || ''}
                onChange={(e) => set('content', e.target.value)}
                rows={3}
                className={`${inputCls} resize-y`}
              />
            </Field>
            <div className="grid grid-cols-2 gap-1.5">
              <Field label="Font Size">
                <NumInput value={element.fontSize || 16} min={8} max={72} step={1} onChange={(v) => set('fontSize', v)} />
              </Field>
              <Field label="Color">
                <input
                  type="color"
                  value={element.color || '#111827'}
                  onChange={(e) => set('color', e.target.value)}
                  className="w-full h-8 rounded border border-gray-200 cursor-pointer"
                />
              </Field>
              <Field label="Weight">
                <select
                  value={element.fontWeight || 'normal'}
                  onChange={(e) => set('fontWeight', e.target.value)}
                  className={selectCls}
                >
                  <option value="normal">Normal</option>
                  <option value="500">500</option>
                  <option value="600">600</option>
                  <option value="700">700</option>
                  <option value="bold">Bold</option>
                </select>
              </Field>
              <Field label="Align">
                <select
                  value={element.textAlign || 'left'}
                  onChange={(e) => set('textAlign', e.target.value)}
                  className={selectCls}
                >
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                </select>
              </Field>
              <Field label="Line Height">
                <NumInput value={element.lineHeight || 1.3} min={1} max={3} step={0.1} onChange={(v) => set('lineHeight', v)} />
              </Field>
              <Field label="Letter Spacing">
                <NumInput value={element.letterSpacing || 0} min={-2} max={20} step={0.1} onChange={(v) => set('letterSpacing', v)} />
              </Field>
            </div>
          </div>
        </Section>
      )}

      {/* Image-specific */}
      {element.type === 'image' && (
        <Section title="Image">
          <div className="space-y-2">
            {element.src && (
              <div className="h-16 rounded border border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center">
                <img src={element.src} className="max-h-full max-w-full object-contain" alt="" />
              </div>
            )}
            <Field label="Upload (PNG / SVG / JPG)">
              <label className="flex items-center gap-2 px-3 py-1.5 text-xs border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer transition-colors">
                <Upload size={13} className="text-gray-500" />
                <span className="text-gray-600">Choose image file…</span>
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
                      set('src', reader.result as string);
                      input.value = '';
                    };
                    reader.readAsDataURL(file);
                  }}
                />
              </label>
            </Field>
            <Field label="Object Fit">
              <select
                value={element.objectFit || 'contain'}
                onChange={(e) => set('objectFit', e.target.value)}
                className={selectCls}
              >
                <option value="contain">Contain</option>
                <option value="cover">Cover</option>
                <option value="fill">Fill</option>
              </select>
            </Field>
          </div>
        </Section>
      )}

      {/* Shape-specific */}
      {element.type === 'shape' && (
        <Section title="Shape">
          <div className="space-y-2">
            {/* Shape type + radius */}
            <div className="grid grid-cols-2 gap-1.5">
              <Field label="Shape">
                <select
                  value={element.shapeType || 'rectangle'}
                  onChange={(e) => set('shapeType', e.target.value)}
                  className={selectCls}
                >
                  <option value="rectangle">Rectangle</option>
                  <option value="circle">Circle</option>
                  <option value="triangle">Triangle</option>
                </select>
              </Field>
              {(element.shapeType === 'rectangle' || !element.shapeType) && (
                <Field label="Corner Radius">
                  <NumInput value={element.borderRadius || 0} min={0} max={300} step={1} onChange={(v) => set('borderRadius', v)} />
                </Field>
              )}
            </div>

            {/* Fill type toggle */}
            <Field label="Fill">
              <div className="flex rounded border border-gray-200 overflow-hidden">
                <button
                  onClick={() => set('gradientEnabled', false)}
                  className={`flex-1 py-1 text-xs transition-colors ${
                    !element.gradientEnabled ? 'bg-gray-900 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  Solid
                </button>
                <button
                  onClick={() => set('gradientEnabled', true)}
                  className={`flex-1 py-1 text-xs transition-colors ${
                    element.gradientEnabled ? 'bg-gray-900 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  Gradient
                </button>
              </div>
            </Field>

            {/* Solid fill */}
            {!element.gradientEnabled && (
              <Field label="Fill Color">
                <input
                  type="color"
                  value={element.backgroundColor || '#e2e8f0'}
                  onChange={(e) => set('backgroundColor', e.target.value)}
                  className="w-full h-8 rounded border border-gray-200 cursor-pointer"
                />
              </Field>
            )}

            {/* Gradient fill */}
            {element.gradientEnabled && (
              <div className="grid grid-cols-2 gap-1.5">
                <Field label="From">
                  <input
                    type="color"
                    value={element.gradientFrom || '#e2e8f0'}
                    onChange={(e) => set('gradientFrom', e.target.value)}
                    className="w-full h-8 rounded border border-gray-200 cursor-pointer"
                  />
                </Field>
                <Field label="To">
                  <input
                    type="color"
                    value={element.gradientTo || '#64748b'}
                    onChange={(e) => set('gradientTo', e.target.value)}
                    className="w-full h-8 rounded border border-gray-200 cursor-pointer"
                  />
                </Field>
                <Field label="Angle (°)" className="col-span-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min={0}
                      max={360}
                      step={15}
                      value={element.gradientAngle ?? 135}
                      onChange={(e) => set('gradientAngle', parseInt(e.target.value))}
                      className="flex-1"
                    />
                    <span className="text-xs text-gray-500 w-8 text-right">{element.gradientAngle ?? 135}°</span>
                  </div>
                </Field>
              </div>
            )}

            {/* Stroke */}
            <div className="pt-1 border-t border-gray-100">
              <p className="text-[10px] uppercase tracking-wide text-gray-400 mb-1.5">Stroke</p>
              <div className="grid grid-cols-2 gap-1.5">
                <Field label="Color">
                  <input
                    type="color"
                    value={element.borderColor || '#000000'}
                    onChange={(e) => set('borderColor', e.target.value)}
                    className="w-full h-8 rounded border border-gray-200 cursor-pointer"
                  />
                </Field>
                <Field label="Width">
                  <NumInput value={element.borderWidth || 0} min={0} max={40} step={1} onChange={(v) => set('borderWidth', v)} />
                </Field>
                <Field label="Position" className="col-span-2">
                  <select
                    value={element.strokePosition || 'center'}
                    onChange={(e) => set('strokePosition', e.target.value)}
                    className={selectCls}
                  >
                    <option value="inside">Inside</option>
                    <option value="center">Center</option>
                    <option value="outside">Outside</option>
                  </select>
                </Field>
              </div>
            </div>
          </div>
        </Section>
      )}

      {/* Effects */}
      <Section title="Effects" defaultOpen={false}>
        <div className="grid grid-cols-2 gap-1.5">
          <Field label="Shadow Color">
            <input
              type="color"
              value={element.shadowColor || '#000000'}
              onChange={(e) => set('shadowColor', e.target.value)}
              className="w-full h-8 rounded border border-gray-200 cursor-pointer"
            />
          </Field>
          <Field label="Shadow Blur">
            <NumInput value={element.shadowBlur || 0} min={0} max={100} step={1} onChange={(v) => set('shadowBlur', v)} />
          </Field>
          <Field label="Shadow X">
            <NumInput value={element.shadowX || 0} min={-100} max={100} step={1} onChange={(v) => set('shadowX', v)} />
          </Field>
          <Field label="Shadow Y">
            <NumInput value={element.shadowY || 0} min={-100} max={100} step={1} onChange={(v) => set('shadowY', v)} />
          </Field>
        </div>
      </Section>
    </div>
  );
};

export default InlineElementEditor;



