/**
 * Loading Skeleton
 * Shows while app is loading on first visit
 */

'use client';

export default function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
      <div className="w-full max-w-md px-8">
        <div className="text-center">
          {/* Logo */}
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-lg bg-indigo-600 animate-pulse">
              <div className="w-10 h-10 rounded bg-indigo-400"></div>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Certificator</h1>
          <p className="text-gray-500 mb-8">Certificate Design & Generator</p>

          {/* Loading bar */}
          <div className="space-y-3">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-indigo-600 to-blue-500 rounded-full animate-[width_2s_ease-in-out_infinite]" style={{ animation: 'slideIn 2s ease-in-out infinite', width: '30%' }}></div>
            </div>
            <p className="text-sm text-gray-500">Loading...</p>
          </div>

          {/* Developer info */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-xs text-gray-400">
              Developed by <span className="font-semibold">Alican Yildirim</span>
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideIn {
          0%, 100% {
            width: 0%;
          }
          50% {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
