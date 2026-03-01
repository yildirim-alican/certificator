'use client';

import React, { useRef, useState } from 'react';
import { Upload, X, CheckCircle } from 'lucide-react';
import Button from '@/components/shared/Button';

interface ExcelUploaderProps {
  onFileSelect: (file: File) => void;
  onError: (error: string) => void;
  isLoading?: boolean;
}

/**
 * Excel File Uploader Component
 *
 * Features:
 * - Drag and drop support
 * - File type validation (.xlsx, .xls)
 * - File size validation (max 5MB)
 * - Visual feedback states
 * - Error handling
 */
export const ExcelUploader: React.FC<ExcelUploaderProps> = ({
  onFileSelect,
  onError,
  isLoading = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_TYPES = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'text/plain', // For CSV
  ];

  const validateFile = (file: File): boolean => {
    // Check file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      // Also allow by extension
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (!['xlsx', 'xls', 'csv'].includes(ext || '')) {
        onError('Invalid file type. Please upload .xlsx, .xls, or .csv files');
        return false;
      }
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      onError(`File size exceeds 5MB limit (${(file.size / 1024 / 1024).toFixed(2)}MB)`);
      return false;
    }

    return true;
  };

  const handleFileSelect = (file: File) => {
    if (validateFile(file)) {
      setSelectedFile(file);
      onFileSelect(file);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div>
      {selectedFile ? (
        // Selected File Display
        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <CheckCircle className="text-green-600" size={32} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-green-900 mb-1">
                File Selected
              </h3>
              <p className="text-green-800 mb-4">
                <span className="font-mono">{selectedFile.name}</span>
                <span className="text-green-700 ml-2">
                  ({(selectedFile.size / 1024).toFixed(1)} KB)
                </span>
              </p>
              <div className="text-sm text-green-700 mb-4">
                This file will be processed to generate certificates.
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleClear}
                className="flex items-center gap-2"
              >
                <X size={16} />
                Choose Different File
              </Button>
            </div>
          </div>
        </div>
      ) : (
        // Upload Area
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition ${
            isDragging
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 bg-gray-50 hover:border-gray-400'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleInputChange}
            className="hidden"
            disabled={isLoading}
          />

          <div className="flex justify-center mb-4">
            <div className={`p-4 rounded-full ${isDragging ? 'bg-blue-200' : 'bg-gray-200'}`}>
              <Upload
                size={40}
                className={isDragging ? 'text-blue-600' : 'text-gray-600'}
              />
            </div>
          </div>

          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Upload Excel File
          </h3>

          <p className="text-gray-600 mb-4">
            Drag and drop your spreadsheet here, or click to browse
          </p>

          <Button
            variant="primary"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className="mb-4"
          >
            {isLoading ? 'Processing...' : 'Choose File'}
          </Button>

          <p className="text-xs text-gray-500 space-y-1">
            <div>Supported formats: XLSX, XLS, CSV</div>
            <div>Maximum file size: 5 MB</div>
            <div>Recommended: First row should contain column headers</div>
          </p>
        </div>
      )}
    </div>
  );
};

export default ExcelUploader;
