/**
 * Toast Container
 * Displays minimal toast notifications with transparent background
 */

'use client';

import React from 'react';
import { useToastStore, type ToastType } from '@/store/useToastStore';
import { Check, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

interface ToastProps {
  id: string;
  message: string;
  type: ToastType;
  onClose: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ id, message, type, onClose }) => {
  const getStyles = () => {
    switch (type) {
      case 'success':
        return {
          bgColor: 'bg-green-500',
          borderColor: 'border-green-600',
          icon: <Check size={18} className="text-white" />,
        };
      case 'error':
        return {
          bgColor: 'bg-red-500',
          borderColor: 'border-red-600',
          icon: <AlertCircle size={18} className="text-white" />,
        };
      case 'warning':
        return {
          bgColor: 'bg-yellow-500',
          borderColor: 'border-yellow-600',
          icon: <AlertTriangle size={18} className="text-white" />,
        };
      case 'info':
      default:
        return {
          bgColor: 'bg-blue-500',
          borderColor: 'border-blue-600',
          icon: <Info size={18} className="text-white" />,
        };
    }
  };

  const styles = getStyles();

  return (
    <div
      className={`
        flex items-center gap-3 px-4 py-3 rounded-lg
        ${styles.bgColor} border ${styles.borderColor}
        text-white shadow-lg backdrop-blur-sm bg-opacity-95
        animate-[slideIn_0.3s_ease-out]
        min-w-max max-w-xs
      `}
      role="alert"
    >
      <div className="flex-shrink-0">{styles.icon}</div>
      <div className="flex-grow text-sm font-medium">{message}</div>
      <button
        onClick={() => onClose(id)}
        className="flex-shrink-0 text-white/70 hover:text-white transition-colors"
        aria-label="Close notification"
      >
        <X size={16} />
      </button>
    </div>
  );
};

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed bottom-6 right-6 flex flex-col gap-3 pointer-events-none z-50">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast
            id={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={removeToast}
          />
        </div>
      ))}
    </div>
  );
};
