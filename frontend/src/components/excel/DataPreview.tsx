'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import Button from '@/components/shared/Button';

interface DataPreview {
  data: Record<string, string>[];
  columns: string[];
  totalRecords: number;
  previewLimit?: number;
}

/**
 * Data Preview Component
 *
 * Features:
 * - Expandable table view of Excel data
 * - Shows first N records for preview
 * - Displays total record count
 * - Column headers match template variables
 * - Ability to scroll horizontally for many columns
 */
export const DataPreview: React.FC<DataPreview & { onConfirm: () => void; isLoading?: boolean }> = ({
  data,
  columns,
  totalRecords,
  previewLimit = 5,
  onConfirm,
  isLoading = false,
}) => {
  const [showAll, setShowAll] = useState(false);
  const displayData = showAll ? data : data.slice(0, previewLimit);
  const hasMore = data.length > previewLimit;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Preview Your Data
        </h3>
        <p className="text-gray-600">
          Review the data that will be used to generate certificates. A total of{' '}
          <strong>{totalRecords}</strong> certificates will be created.
        </p>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            {/* Header Row */}
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 bg-gray-100 w-12">
                  #
                </th>
                {columns.map((col) => (
                  <th
                    key={col}
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-700 whitespace-nowrap"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>

            {/* Data Rows */}
            <tbody>
              {displayData.map((row, rowIdx) => (
                <tr
                  key={rowIdx}
                  className={`border-b border-gray-200 hover:bg-blue-50 transition ${
                    rowIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                  }`}
                >
                  <td className="px-4 py-3 text-xs font-medium text-gray-500 bg-gray-50">
                    {rowIdx + 1}
                  </td>
                  {columns.map((col) => (
                    <td
                      key={`${rowIdx}-${col}`}
                      className="px-4 py-3 text-sm text-gray-900 max-w-xs truncate"
                      title={row[col]}
                    >
                      {row[col] || '--'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Show More Footer */}
        {hasMore && (
          <div className="bg-gray-50 border-t border-gray-200 px-4 py-3">
            {showAll ? (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowAll(false)}
                className="flex items-center gap-2"
              >
                <ChevronUp size={16} />
                Show Less
              </Button>
            ) : (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowAll(true)}
                className="flex items-center gap-2"
              >
                <ChevronDown size={16} />
                Show All {totalRecords} Records
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-xs text-blue-600 font-semibold mb-1">TOTAL RECORDS</div>
          <div className="text-2xl font-bold text-blue-900">{totalRecords}</div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-xs text-green-600 font-semibold mb-1">COLUMNS MAPPED</div>
          <div className="text-2xl font-bold text-green-900">{columns.length}</div>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="text-xs text-purple-600 font-semibold mb-1">CERTIFICATES</div>
          <div className="text-2xl font-bold text-purple-900">{totalRecords}</div>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3">
        <AlertCircle className="text-amber-600 flex-shrink-0" size={20} />
        <div>
          <h4 className="font-semibold text-amber-900 mb-1">Before you continue</h4>
          <p className="text-sm text-amber-800">
            Verify that the data looks correct. You can still edit individual records or
            re-upload a different file.
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
        <Button variant="primary" onClick={onConfirm} disabled={isLoading}>
          {isLoading ? 'Generating Certificates...' : 'Generate All Certificates'}
        </Button>
      </div>
    </div>
  );
};

export default DataPreview;
