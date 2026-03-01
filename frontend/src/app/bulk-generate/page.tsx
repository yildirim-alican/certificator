'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useEditorStore } from '@/store/useEditorStore';
import BulkGenerationWorkflow from '@/components/excel/BulkGenerationWorkflow';
import Button from '@/components/shared/Button';
import { ArrowLeft, AlertCircle } from 'lucide-react';

/**
 * Bulk Generation Page
 *
 * Allows users to:
 * 1. Upload Excel file with certificate data
 * 2. Map columns to template variables
 * 3. Preview and validate data
 * 4. Generate bulk certificates
 *
 * URL: /bulk-generate/[template-id]
 */
export default function BulkGeneratePage() {
  const router = useRouter();
  const template = useEditorStore((state) => state.template);
  const [generationError, setGenerationError] = useState<string | null>(null);

  if (!template) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <AlertCircle className="text-amber-600 mx-auto mb-4" size={40} />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Template Selected</h2>
          <p className="text-gray-600 mb-6">
            Please select or create a template before generating bulk certificates.
          </p>
          <Button
            variant="primary"
            onClick={() => router.push('/')}
            className="w-full"
          >
            Go to Templates
          </Button>
        </div>
      </div>
    );
  }

  const handleGenerationStart = async (
    data: Record<string, string>[]
  ): Promise<void> => {
    setGenerationError(null);

    try {
      // Prepare payload
      const payload = {
        template: {
          name: template.name,
          orientation: template.orientation,
          width: template.width,
          height: template.height,
          backgroundColor: template.backgroundColor,
          elements: template.elements,
        },
        data,
        fileName: template.name.replace(/\s+/g, '-').toLowerCase(),
      };

      // Call backend API
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/excel/generate-bulk`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error(`Generation failed: ${response.statusText}`);
      }

      // Download ZIP file
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${payload.fileName}_batch.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      setGenerationError(message);
      throw error;
    }
  };

  const handleGenerationComplete = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft size={18} />
              Back
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            Bulk Generate Certificates
          </h1>
          <p className="text-gray-600 mt-2">
            Using template: <span className="font-semibold">{template.name}</span>
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {generationError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex gap-3">
            <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
            <div>
              <h3 className="font-semibold text-red-900 mb-1">Generation Error</h3>
              <p className="text-sm text-red-800">{generationError}</p>
            </div>
          </div>
        )}

        <BulkGenerationWorkflow
          template={template}
          onGenerationStart={handleGenerationStart}
          onGenerationComplete={handleGenerationComplete}
        />
      </div>
    </div>
  );
}
