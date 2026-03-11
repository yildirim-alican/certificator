/**
 * Root Layout
 *
 * Main layout wrapper for all pages.
 * Provides global styles and layout structure.
 */

import React, { Suspense } from 'react';
import '../styles/globals.css';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import { ClientLayoutWrapper } from './ClientLayoutWrapper';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>Certificator - Certificate Generator</title>
        <meta name="description" content="Certificate design and generator platform" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="antialiased bg-gray-50">
        <ClientLayoutWrapper>
          <div className="min-h-screen flex flex-col">
            <Suspense fallback={<LoadingSkeleton />}>
              {children}
            </Suspense>
          </div>
        </ClientLayoutWrapper>
      </body>
    </html>
  );
}
