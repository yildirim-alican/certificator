'use client';

import React, { useState, useEffect } from 'react';
import { ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';
import Button from '@/components/shared/Button';

interface ColumnMapping {
  excelColumn: string;
  templateVariable: string;
  confidence: number; // 0-1, higher = better match
}

interface ColumnMapperProps {
  excelColumns: string[];
  templateVariables: string[];
  onMappingComplete: (mappings: ColumnMapping[]) => void;
  isLoading?: boolean;
  autoMappings?: ColumnMapping[];
}

/**
 * Column Mapping Component
 *
 * Features:
 * - Auto-mapping with similarity scoring
 * - Manual mapping adjustment
 * - Confidence indicators
 * - Validation of required mappings
 * - Visual feedback for complete mappings
 */
export const ColumnMapper: React.FC<ColumnMapperProps> = ({
  excelColumns,
  templateVariables,
  onMappingComplete,
  isLoading = false,
  autoMappings = [],
}) => {
  const [mappings, setMappings] = useState<ColumnMapping[]>(autoMappings);

  useEffect(() => {
    // Initialize with auto-mappings or empty
    if (autoMappings.length > 0) {
      setMappings(autoMappings);
    } else {
      // Create empty mappings for each excel column
      setMappings(
        excelColumns.map((col) => ({
          excelColumn: col,
          templateVariable: '',
          confidence: 0,
        }))
      );
    }
  }, [excelColumns, autoMappings]);

  const handleMappingChange = (excelColumn: string, templateVariable: string) => {
    setMappings((prev) =>
      prev.map((m) =>
        m.excelColumn === excelColumn
          ? { ...m, templateVariable, confidence: templateVariable ? 0.5 : 0 } // manual = 0.5 confidence
          : m
      )
    );
  };

  const isComplete = mappings.every((m) => m.templateVariable);

  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-50';
    if (confidence >= 0.5) return 'text-yellow-600 bg-yellow-50';
    return 'text-gray-600 bg-gray-50';
  };

  const getConfidenceLabel = (confidence: number): string => {
    if (confidence >= 0.8) return 'High match';
    if (confidence >= 0.5) return 'Manual match';
    if (confidence > 0) return 'Low match';
    return 'Not mapped';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Map Columns to Variables
        </h3>
        <p className="text-gray-600">
          Connect your Excel columns to certificate template variables.
        </p>
      </div>

      {/* Mappings List */}
      <div className="space-y-3">
        {mappings.map((mapping) => {
          const confidenceColor = getConfidenceColor(mapping.confidence);
          const confidenceLabel = getConfidenceLabel(mapping.confidence);

          return (
            <div
              key={mapping.excelColumn}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition"
            >
              <div className="flex items-center gap-4">
                {/* Excel Column */}
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-gray-500 mb-1 uppercase tracking-wide">
                    Excel Column
                  </div>
                  <div className="font-mono font-semibold text-gray-900 truncate">
                    {mapping.excelColumn}
                  </div>
                </div>

                {/* Arrow */}
                <div className="flex-shrink-0">
                  <ArrowRight className="text-gray-400" size={20} />
                </div>

                {/* Template Variable Selector */}
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-gray-500 mb-1 uppercase tracking-wide">
                    Template Variable
                  </div>
                  <select
                    value={mapping.templateVariable}
                    onChange={(e) => handleMappingChange(mapping.excelColumn, e.target.value)}
                    disabled={isLoading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="">-- Select variable --</option>
                    {templateVariables.map((variable) => (
                      <option key={variable} value={variable}>
                        {variable}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Confidence Badge */}
                <div className="flex-shrink-0">
                  <div className={`px-3 py-2 rounded text-xs font-medium ${confidenceColor}`}>
                    {mapping.confidence > 0 ? (
                      <div className="flex items-center gap-1">
                        {mapping.confidence >= 0.8 && <CheckCircle size={14} />}
                        {confidenceLabel}
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <AlertCircle size={14} />
                        {confidenceLabel}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Validation Message */}
              {!mapping.templateVariable && (
                <div className="mt-2 text-xs text-amber-600 flex items-center gap-2">
                  <AlertCircle size={14} />
                  This column needs to be mapped to a variable
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Validation Summary */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          {isComplete ? (
            <CheckCircle className="text-green-600" size={20} />
          ) : (
            <AlertCircle className="text-amber-600" size={20} />
          )}
          <span className={`font-semibold ${isComplete ? 'text-green-900' : 'text-amber-900'}`}>
            {isComplete ? 'All columns mapped!' : `${mappings.filter((m) => !m.templateVariable).length} columns unmapped`}
          </span>
        </div>
        <p className="text-sm text-gray-600">
          {isComplete
            ? 'You can now preview your data and generate certificates.'
            : 'Please map all Excel columns to template variables before continuing.'}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
        <Button
          variant="primary"
          onClick={() => onMappingComplete(mappings)}
          disabled={!isComplete || isLoading}
        >
          {isLoading ? 'Processing...' : 'Continue to Preview'}
        </Button>
      </div>
    </div>
  );
};

export default ColumnMapper;
