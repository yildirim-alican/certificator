/**
 * Client Layout Wrapper
 * Provides client-side functionality for root layout
 */

'use client';

import React from 'react';
import { ToastContainer } from '@/components/common/ToastContainer';

export function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <ToastContainer />
    </>
  );
}
