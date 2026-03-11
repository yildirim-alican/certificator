'use client';

import React, { useState } from 'react';
import { CertificateTemplate } from '@/types/CertificateTemplate';
import Button from '@/components/shared/Button';
import { CERTIFICATE_TYPES } from '@/lib/premiumTemplates';
import QuickEdit, { QuickEditData } from '@/components/editor/QuickEdit';
import CertificatePreview from '@/components/shared/CertificatePreview';
import { Zap } from 'lucide-react';

interface CertCardProps {
  template: CertificateTemplate;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

/**
 * CertCard Component
 *
 * Dashboard card for displaying certificate templates.
 * Shows template preview, name, category, premium badge, and action buttons.
 * Minimal design with 2-column layout support.
 * Includes quick edit button for rapid certificate generation.
 */
const CertCard: React.FC<CertCardProps> = ({ template, onEdit, onDelete }) => {
  const [showQuickEdit, setShowQuickEdit] = useState(false);
  const categoryType = CERTIFICATE_TYPES.find((t) => t.id === template.category);

  const handleQuickGenerate = (_data: QuickEditData) => {
    setShowQuickEdit(false);
  };

  return (
    <>
      <div className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all overflow-hidden">
        {/* Template Thumbnail */}
        <div className="bg-gray-50 h-28 flex items-center justify-center relative overflow-hidden">
          <CertificatePreview
            template={template}
            displayWidth={template.orientation === 'landscape' ? 200 : 140}
            className="rounded shadow-sm"
          />
          
          {/* Premium Badge */}
          {template.isPremium && (
            <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-semibold">
              Premium
            </div>
          )}
        </div>

        {/* Card Content */}
        <div className="p-3">
          {/* Category & Title */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <h3 className="font-semibold text-lg text-gray-900">{template.name}</h3>
              {categoryType && (
                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                  <span>{categoryType.icon}</span>
                  {categoryType.name}
                </p>
              )}
            </div>
          </div>

          {/* Description */}
          <p className="text-xs text-gray-600 mb-3 line-clamp-1">
            {template.description || 'Professional template'}
          </p>

          {/* Actions */}
          <div className="flex gap-2 pt-3 border-t border-gray-100">
            <Button
              size="sm"
              variant="primary"
              onClick={() => onEdit?.(template.id)}
              className="flex-1"
            >
              Edit
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setShowQuickEdit(true)}
              className="flex-1 flex items-center justify-center gap-1"
            >
              <Zap size={14} />
              Quick
            </Button>
            {onDelete && (
              <Button
                size="sm"
                variant="secondary"
                onClick={() => onDelete(template.id)}
                className="px-3"
              >
                Delete
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Quick Edit Modal */}
      <QuickEdit
        template={template}
        isOpen={showQuickEdit}
        onClose={() => setShowQuickEdit(false)}
        onGenerate={handleQuickGenerate}
      />
    </>
  );
};

export default CertCard;
