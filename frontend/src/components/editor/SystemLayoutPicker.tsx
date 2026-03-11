'use client';

import React, { useMemo, useState } from 'react';
import { CheckCircle2, ChevronDown, Upload } from 'lucide-react';
import {
  LayoutCategory,
  LayoutOrientation,
  SystemLayoutPreset,
} from '@/components/editor/systemPresets';

interface SystemLayoutPickerProps {
  presets: SystemLayoutPreset[];
  activePresetId: string | null;
  activeOrientation: LayoutOrientation;
  onApplyPreset: (preset: SystemLayoutPreset) => void;
  onOrientationChange: (orientation: LayoutOrientation) => void;
  onBrandLogoUpload: (file: File, logoIndex?: number) => void;
  brandLogos?: string[];
  onRemoveBrandLogo?: (index: number) => void;
}

const CATEGORIES: Array<{ id: LayoutCategory; label: string }> = [
  { id: 'digital', label: 'Digital' },
  { id: 'minimal', label: 'Minimal' },
  { id: 'modern', label: 'Modern' },
];

const SystemLayoutPicker: React.FC<SystemLayoutPickerProps> = ({
  presets,
  activePresetId,
  activeOrientation,
  onApplyPreset,
  onOrientationChange,
  onBrandLogoUpload,
  brandLogos = [],
  onRemoveBrandLogo,
}) => {
  const [activeCategory, setActiveCategory] = useState<LayoutCategory>('digital');
  const [showLogos, setShowLogos] = useState(false);

  const visiblePresets = useMemo(
    () =>
      presets.filter(
        (p) => p.category === activeCategory && p.orientation === activeOrientation
      ),
    [presets, activeCategory, activeOrientation]
  );

  return (
    <div className="p-4 space-y-4">
      {/* Orientation segmented control */}
      <div className="flex rounded-lg border border-gray-200 overflow-hidden">
        {(['landscape', 'portrait'] as LayoutOrientation[]).map((o) => (
          <button
            key={o}
            onClick={() => onOrientationChange(o)}
            className={`flex-1 px-3 py-1.5 text-xs font-medium transition-colors ${
              activeOrientation === o
                ? 'bg-gray-900 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            {o === 'landscape' ? 'Landscape' : 'Portrait'}
          </button>
        ))}
      </div>

      {/* Category pills */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`flex-1 py-1 text-xs font-medium rounded-md transition-all ${
              activeCategory === cat.id
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Preset grid */}
      <div className="grid grid-cols-2 gap-2">
        {visiblePresets.map((preset) => {
          const isActive = preset.id === activePresetId;
          return (
            <button
              key={preset.id}
              onClick={() => onApplyPreset(preset)}
              className={`group relative rounded-lg border p-2 text-left transition-all ${
                isActive
                  ? 'border-gray-900 bg-gray-900'
                  : 'border-gray-200 bg-white hover:border-gray-400'
              }`}
            >
              {/* Mini preview */}
              <div
                className={`h-10 rounded mb-2 flex items-center px-1.5 ${
                  isActive ? 'bg-gray-700' : 'bg-gray-50 border border-gray-100'
                }`}
              >
                <div
                  className={`w-1 h-6 rounded-full mr-1.5 flex-shrink-0 ${
                    isActive ? 'bg-white/60' : 'bg-blue-400'
                  }`}
                />
                <div className="space-y-1 flex-1">
                  <div
                    className={`h-1.5 w-3/4 rounded ${
                      isActive ? 'bg-white/40' : 'bg-gray-300'
                    }`}
                  />
                  <div
                    className={`h-1.5 w-1/2 rounded ${
                      isActive ? 'bg-white/20' : 'bg-gray-200'
                    }`}
                  />
                </div>
                {isActive && (
                  <CheckCircle2 size={12} className="text-white flex-shrink-0" />
                )}
              </div>
              <p
                className={`text-[11px] font-medium leading-tight truncate ${
                  isActive ? 'text-white' : 'text-gray-700'
                }`}
              >
                {preset.name}
              </p>
            </button>
          );
        })}
        {visiblePresets.length === 0 && (
          <div className="col-span-2 border border-dashed border-gray-200 rounded-lg p-4 text-xs text-gray-400 text-center">
            No layouts for this combination.
          </div>
        )}
      </div>

      {/* Brand logos collapsible */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <button
          onClick={() => setShowLogos((v) => !v)}
          className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <span className="flex items-center gap-1.5">
            <Upload size={12} />
            Logo Yönetimi
          </span>
          <ChevronDown
            size={14}
            className={`transition-transform text-gray-400 ${showLogos ? 'rotate-180' : ''}`}
          />
        </button>
        {showLogos && (
          <div className="px-3 pb-3 pt-3 space-y-3 border-t border-gray-100">
            <div className="text-xs text-gray-500 mb-1">
              Tüm logolar sponsor logo tekniği ile yüklenir
            </div>
            <div className="flex flex-wrap gap-2">
              {brandLogos.map((logo, index) => (
                <div
                  key={index}
                  className="relative group"
                >
                  <div className="w-16 h-14 rounded border border-gray-300 bg-gray-50 overflow-hidden flex items-center justify-center">
                    <img
                      src={logo}
                      alt={`Logo ${index + 1}`}
                      className="max-w-full max-h-full object-contain p-1"
                    />
                  </div>
                  <div className="absolute -top-6 left-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap z-10">
                    Logo {index + 1}
                  </div>
                  <button
                    onClick={() => onRemoveBrandLogo?.(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs hover:bg-red-600 shadow-md transition-colors"
                    title="Logoyu kaldır"
                  >
                    ×
                  </button>
                </div>
              ))}
              <label
                className="w-16 h-14 rounded border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer flex flex-col items-center justify-center gap-1 text-xs text-gray-400 hover:text-blue-600 font-medium relative group"
                title="Logo eklemek için tıkla"
              >
                <span className="text-lg">+</span>
                <span className="text-[10px]">Logo Ekle</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) onBrandLogoUpload(file, brandLogos.length);
                  }}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SystemLayoutPicker;
