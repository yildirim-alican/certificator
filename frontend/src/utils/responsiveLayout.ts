/**
 * Responsive Layout System
 * Implements mobile-first responsive design with token-based breakpoints
 */

import { Breakpoints } from './designTokens';

// ======================================================================
// MEDIA QUERY HELPERS
// ======================================================================

export const MediaQuery = {
  // Mobile-first: base styles apply to all
  mobile: `(min-width: ${Breakpoints.mobile})`,
  tablet: `(min-width: ${Breakpoints.tablet})`,
  desktop: `(min-width: ${Breakpoints.desktop})`,
  wide: `(min-width: ${Breakpoints.wide})`,

  // Max-width queries (when needed)
  maxMobile: `(max-width: calc(${Breakpoints.tablet} - 1px))`,
  maxTablet: `(max-width: calc(${Breakpoints.desktop} - 1px))`,
  maxDesktop: `(max-width: calc(${Breakpoints.wide} - 1px))`,

  // Touch device detection
  touch: '(hover: none) and (pointer: coarse)',
  pointer: '(hover: hover) and (pointer: fine)',

  // Preferred color scheme
  darkMode: '(prefers-color-scheme: dark)',
  lightMode: '(prefers-color-scheme: light)',

  // Reduced motion (accessibility)
  reducedMotion: '(prefers-reduced-motion: reduce)',
} as const;

// ======================================================================
// RESPONSIVE VALUE SYSTEM
// ======================================================================

/**
 * Responsive value that changes based on breakpoint
 * Usage: getResponsiveValue(value, 'mobile')
 */
export interface ResponsiveValue<T> {
  mobile?: T;
  tablet?: T;
  desktop?: T;
  wide?: T;
}

export function getResponsiveValue<T>(
  value: ResponsiveValue<T> | T,
  breakpoint: 'mobile' | 'tablet' | 'desktop' | 'wide'
): T {
  if (!value || typeof value !== 'object' || !('mobile' in value)) {
    return value as T;
  }

  const responsiveValue = value as ResponsiveValue<T>;
  
  // Return highest applicable breakpoint value
  if (breakpoint === 'wide' && responsiveValue.wide !== undefined) {
    return responsiveValue.wide;
  }
  if ((breakpoint === 'wide' || breakpoint === 'desktop') && responsiveValue.desktop !== undefined) {
    return responsiveValue.desktop;
  }
  if ((breakpoint === 'wide' || breakpoint === 'desktop' || breakpoint === 'tablet') && responsiveValue.tablet !== undefined) {
    return responsiveValue.tablet;
  }
  return responsiveValue.mobile || (value as T);
}

// ======================================================================
// BREAKPOINT DETECTION
// ======================================================================

export type Breakpoint = 'mobile' | 'tablet' | 'desktop' | 'wide';

export const GetBreakpointValue = (pixelWidth: number): Breakpoint => {
  if (pixelWidth >= parseInt(Breakpoints.wide)) return 'wide';
  if (pixelWidth >= parseInt(Breakpoints.desktop)) return 'desktop';
  if (pixelWidth >= parseInt(Breakpoints.tablet)) return 'tablet';
  return 'mobile';
};

// ======================================================================
// GRID SYSTEM (12-column responsive grid)
// ======================================================================

export const GridSystem = {
  columns: 12,
  gutter: {
    mobile: '8px',
    tablet: '12px',
    desktop: '16px',
    wide: '24px',
  },
  margin: {
    mobile: '12px',
    tablet: '16px',
    desktop: '24px',
    wide: '32px',
  },

  // Helper: Calculate column width
  getColumnWidth: (cols: number, breakpoint: Breakpoint, containerWidth: number) => {
    const colCount = 12;
    const gutter = GridSystem.gutter[breakpoint];
    const gutterPx = parseInt(gutter);
    const totalGutters = colCount - 1;
    const availableSpace = containerWidth - (gutterPx * totalGutters);
    return (availableSpace / colCount) * cols;
  },
} as const;

// ======================================================================
// SPACING SCALE (Responsive spacing)
// ======================================================================

export const ResponsiveSpacing = {
  // Container size recommendations
  container: {
    mobile: '100%',
    tablet: '90%',
    desktop: '1024px',
    wide: '1440px',
  },

  // Padding recommendations
  padding: {
    mobile: '12px',
    tablet: '16px',
    desktop: '24px',
    wide: '32px',
  },

  // Gap between elements (flex/grid)
  gap: {
    mobile: '8px',
    tablet: '12px',
    desktop: '16px',
    wide: '24px',
  },
} as const;

// ======================================================================
// TYPOGRAPHY SCALE (Responsive font sizes)
// ======================================================================

export const ResponsiveTypography = {
  h1: {
    mobile: { size: '24px', lineHeight: 1.2, weight: 700 },
    tablet: { size: '28px', lineHeight: 1.2, weight: 700 },
    desktop: { size: '32px', lineHeight: 1.2, weight: 700 },
    wide: { size: '40px', lineHeight: 1.1, weight: 700 },
  },

  h2: {
    mobile: { size: '20px', lineHeight: 1.3, weight: 600 },
    tablet: { size: '24px', lineHeight: 1.3, weight: 600 },
    desktop: { size: '28px', lineHeight: 1.3, weight: 600 },
    wide: { size: '32px', lineHeight: 1.2, weight: 600 },
  },

  h3: {
    mobile: { size: '18px', lineHeight: 1.4, weight: 600 },
    tablet: { size: '20px', lineHeight: 1.4, weight: 600 },
    desktop: { size: '24px', lineHeight: 1.3, weight: 600 },
    wide: { size: '28px', lineHeight: 1.3, weight: 600 },
  },

  body: {
    mobile: { size: '14px', lineHeight: 1.5, weight: 400 },
    tablet: { size: '14px', lineHeight: 1.5, weight: 400 },
    desktop: { size: '16px', lineHeight: 1.5, weight: 400 },
    wide: { size: '16px', lineHeight: 1.6, weight: 400 },
  },

  caption: {
    mobile: { size: '12px', lineHeight: 1.4, weight: 400 },
    tablet: { size: '12px', lineHeight: 1.4, weight: 400 },
    desktop: { size: '13px', lineHeight: 1.5, weight: 400 },
    wide: { size: '14px', lineHeight: 1.5, weight: 400 },
  },
} as const;

// ======================================================================
// TOUCH-FRIENDLY SIZING
// ======================================================================

export const TouchTargetSize = {
  // Minimum touch target (WCAG AA: 44x44px, but 48x48px recommended)
  minSize: '48px',
  minSizeCompact: '44px',

  // Input fields (touch-friendly heights)
  input: {
    mobile: '44px',
    tablet: '40px',
    desktop: '36px',
  },

  // Button sizing
  button: {
    mobile: '48px',
    tablet: '44px',
    desktop: '40px',
  },

  // Icon size
  icon: {
    mobile: '24px',
    tablet: '20px',
    desktop: '18px',
  },
} as const;

// ======================================================================
// VIEWPORT-BASED UTILITIES
// ======================================================================

export interface ViewportInfo {
  width: number;
  height: number;
  breakpoint: Breakpoint;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isWide: boolean;
  isTouchDevice: boolean;
  prefersDarkMode: boolean;
  prefersReducedMotion: boolean;
}

/**
 * Get current viewport information
 * Note: Use React hook version for components
 */
export const getViewportInfo = (
  options?: {
    isTouchDevice?: boolean;
    prefersDarkMode?: boolean;
    prefersReducedMotion?: boolean;
  }
): ViewportInfo => {
  const width = typeof window !== 'undefined' ? window.innerWidth : 1024;
  const height = typeof window !== 'undefined' ? window.innerHeight : 768;
  const breakpoint = GetBreakpointValue(width);

  return {
    width,
    height,
    breakpoint,
    isMobile: breakpoint === 'mobile',
    isTablet: breakpoint === 'tablet',
    isDesktop: breakpoint === 'desktop',
    isWide: breakpoint === 'wide',
    isTouchDevice: options?.isTouchDevice ?? false,
    prefersDarkMode: options?.prefersDarkMode ?? false,
    prefersReducedMotion: options?.prefersReducedMotion ?? false,
  };
};

// ======================================================================
// CSS-IN-JS MEDIA QUERY HELPERS
// ======================================================================

export const createMediaQuery = (breakpoint: Breakpoint): string => {
  switch (breakpoint) {
    case 'mobile':
      return `@media ${MediaQuery.mobile}`;
    case 'tablet':
      return `@media ${MediaQuery.tablet}`;
    case 'desktop':
      return `@media ${MediaQuery.desktop}`;
    case 'wide':
      return `@media ${MediaQuery.wide}`;
    default:
      return '';
  }
};

// ======================================================================
// ACCESSIBILITY HELPERS
// ======================================================================

export const a11y = {
  // Skip link helpers
  skipLinkStyles: {
    position: 'absolute' as const,
    left: '-9999px',
    zIndex: -1,
  },

  // Visually hidden but screen-reader accessible
  srOnly: {
    position: 'absolute' as const,
    width: '1px',
    height: '1px',
    padding: '0',
    margin: '-1px',
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    whiteSpace: 'nowrap' as const,
    borderWidth: '0',
  },

  // Focus visible styles
  focusVisible: {
    outline: '2px solid',
    outlineOffset: '2px',
  },

  // Reduced motion styles
  reducedMotion: {
    animation: 'none',
    transition: 'none',
  },
} as const;
