'use client';

/**
 * Dashboard Page
 *
 * Main landing page showing all certificate templates.
 * Features template listing, search, category filtering, and create new template.
 * Minimal 2-column layout with category-based filtering.
 */

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useTemplateStore } from '@/store/useTemplateStore';
import { CertificateTemplate } from '@/types/CertificateTemplate';
import CertCard from '@/components/dashboard/CertCard';
import Input from '@/components/shared/Input';
import { Search, Upload, Download } from 'lucide-react';

export default function Dashboard() {
  const router = useRouter();
  const templates      = useTemplateStore((state) => state.templates);
  const deleteTemplate = useTemplateStore((state) => state.deleteTemplate);
  const setTemplates   = useTemplateStore((state) => state.setTemplates);

  const [searchQuery, setSearchQuery] = useState('');
  const importRef = useRef<HTMLInputElement>(null);

  // Filter templates by search query only
  const filteredTemplates = templates.filter((template) => {
    return template.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleDelete = (templateId: string) => {
    if (confirm('Are you sure you want to delete this template?')) {
      deleteTemplate(templateId);
    }
  };

  const handleExportAll = () => {
    const json = JSON.stringify(templates, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url; link.download = 'certificator-templates.json';
    document.body.appendChild(link); link.click();
    document.body.removeChild(link); URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string);
        const arr: CertificateTemplate[] = Array.isArray(parsed) ? parsed : [parsed];
        const existingIds = new Set(templates.map((t) => t.id));
        const newOnes = arr.filter((t) => !existingIds.has(t.id));
        if (newOnes.length > 0) setTemplates([...templates, ...newOnes]);
      } catch {
        alert('Invalid JSON file');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header - Minimal Design */}
      <header className="border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Certificate Templates</h1>
              <p className="text-sm text-gray-600 mt-1">Choose a template and customize it</p>
            </div>
            <div className="flex items-center gap-2">
              {/* Hidden file input for import */}
              <input ref={importRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
              <button
                onClick={() => importRef.current?.click()}
                className="flex items-center gap-2 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                title="Import templates from JSON"
              >
                <Upload size={16} /> Import
              </button>
              {templates.length > 0 && (
                <button
                  onClick={handleExportAll}
                  className="flex items-center gap-2 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                  title="Export all templates as JSON"
                >
                  <Download size={16} /> Export
                </button>
              )}
              <button
                onClick={() => router.push('/create')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Create Certificate
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Templates Grid - 2 Columns */}
        {filteredTemplates.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredTemplates.map((template) => (
              <CertCard
                key={template.id}
                template={template}
                onEdit={() => router.push(`/editor/${template.id}`)}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
