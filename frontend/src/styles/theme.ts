/**
 * Global CSS Variables Setup
 * Applies design tokens as CSS custom properties
 * This file should be imported at the app root
 */

import { getCSSVariables, lightTheme } from '@/utils/designTokens';

/**
 * Initialize CSS variables at app start
 * Call this in your root layout or main component
 */
export const initializeTheme = () => {
  const root = document.documentElement;
  const cssVars = getCSSVariables();

  // Apply all CSS variables
  Object.entries(cssVars).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });

  // Apply semantic tokens from light theme (default)
  Object.entries(lightTheme.tokens).forEach(([category, values]) => {
    if (typeof values === 'object') {
      Object.entries(values).forEach(([key, value]) => {
        if (typeof value === 'string') {
          root.style.setProperty(`--theme-${category}-${key}`, value);
        }
      });
    }
  });

  // Set default theme attribute
  root.setAttribute('data-theme', 'light');

  console.log('✅ Design system theme initialized');
};

/**
 * CSS custom properties stylesheet
 * Use in <style> tag or CSS file
 */
export const themeCSS = `
  :root {
    /* PRIMITIVE TOKENS */
    
    /* Spacing */
    --spacing-xs: 4px;
    --spacing-sm: 8px;
    --spacing-md: 12px;
    --spacing-lg: 16px;
    --spacing-xl: 24px;
    --spacing-xxl: 32px;
    --spacing-xxxl: 48px;

    /* Border Radius */
    --border-radius-none: 0;
    --border-radius-xs: 2px;
    --border-radius-sm: 4px;
    --border-radius-md: 6px;
    --border-radius-lg: 8px;
    --border-radius-xl: 12px;
    --border-radius-full: 9999px;

    /* Colors - Neutral */
    --color-neutral-95: #F5F5F5;
    --color-neutral-90: #E5E5E5;
    --color-neutral-80: #CCCCCC;
    --color-neutral-70: #B3B3B3;
    --color-neutral-60: #999999;
    --color-neutral-50: #808080;
    --color-neutral-40: #666666;
    --color-neutral-30: #4D4D4D;
    --color-neutral-20: #333333;
    --color-neutral-10: #1A1A1A;

    /* Colors - Primary Blue */
    --color-blue-95: #F0F5FF;
    --color-blue-90: #E1EBFF;
    --color-blue-80: #C2D7FF;
    --color-blue-70: #A4C2FF;
    --color-blue-60: #85ADFF;
    --color-blue-50: #6699FF;
    --color-blue-40: #4784FF;
    --color-blue-30: #2870FF;
    --color-blue-20: #0A5BFF;
    --color-blue-10: #0047CC;

    /* Colors - Success Green */
    --color-green-95: #F0F9F5;
    --color-green-90: #E1F3EB;
    --color-green-80: #C2E7D7;
    --color-green-70: #A4DBC2;
    --color-green-60: #85CFAE;
    --color-green-50: #66C399;
    --color-green-40: #47B785;
    --color-green-30: #28AB70;
    --color-green-20: #0A9F5C;
    --color-green-10: #008C4D;

    /* Colors - Error Red */
    --color-red-95: #FFF0F0;
    --color-red-90: #FFE1E1;
    --color-red-80: #FFC2C2;
    --color-red-70: #FFA4A4;
    --color-red-60: #FF8585;
    --color-red-50: #FF6666;
    --color-red-40: #FF4747;
    --color-red-30: #FF2828;
    --color-red-20: #FF0A0A;
    --color-red-10: #CC0000;

    /* Typography */
    --font-size-xs: 12px;
    --font-size-sm: 14px;
    --font-size-md: 16px;
    --font-size-lg: 18px;
    --font-size-xl: 20px;
    --font-size-xxl: 24px;
    --font-size-xxxl: 32px;

    --line-height-tight: 1.1;
    --line-height-normal: 1.5;
    --line-height-relaxed: 1.75;

    --font-weight-light: 300;
    --font-weight-normal: 400;
    --font-weight-medium: 500;
    --font-weight-semibold: 600;
    --font-weight-bold: 700;

    /* Shadows */
    --shadow-none: none;
    --shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.05);
    --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.1);
    --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
    --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
    --shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.1);
    --shadow-xxl: 0 25px 50px rgba(0, 0, 0, 0.15);

    /* Transitions */
    --duration-instant: 0ms;
    --duration-fast: 100ms;
    --duration-normal: 200ms;
    --duration-slow: 300ms;

    /* SEMANTIC TOKENS (Light Theme) */
    --theme-background-base: #FFFFFF;
    --theme-background-elevated: #F5F5F5;
    --theme-background-overlay: rgba(0, 0, 0, 0.5);

    --theme-foreground-primary: #1A1A1A;
    --theme-foreground-secondary: #4D4D4D;
    --theme-foreground-tertiary: #999999;

    --theme-text-primary: #1A1A1A;
    --theme-text-secondary: #4D4D4D;
    --theme-text-tertiary: #999999;
    --theme-text-inverted: #FFFFFF;

    --theme-border-default: #CCCCCC;
    --theme-border-muted: #E5E5E5;
    --theme-border-subtle: #F5F5F5;

    --theme-interactive-primary: #6699FF;
    --theme-interactive-primary-dim: #C2D7FF;
    --theme-interactive-success: #66C399;
    --theme-interactive-success-dim: #C2E7D7;
    --theme-interactive-error: #FF6666;
    --theme-interactive-error-dim: #FFC2C2;

    --theme-canvas-background: #FFFFFF;
    --theme-canvas-grid: rgba(200, 200, 200, 0.1);
    --theme-canvas-selection: #6699FF;
    --theme-canvas-guide: #6699FF;
    --theme-canvas-handle: #6699FF;

    --theme-feedback-success: #66C399;
    --theme-feedback-warning: #FF9966;
    --theme-feedback-error: #FF6666;
    --theme-feedback-info: #6699FF;
  }

  /* Dark Theme Override */
  [data-theme="dark"] {
    --theme-background-base: #1A1A1A;
    --theme-background-elevated: #333333;
    --theme-background-overlay: rgba(0, 0, 0, 0.8);

    --theme-foreground-primary: #FFFFFF;
    --theme-foreground-secondary: #999999;
    --theme-foreground-tertiary: #4D4D4D;

    --theme-text-primary: #FFFFFF;
    --theme-text-secondary: #999999;
    --theme-text-tertiary: #4D4D4D;
    --theme-text-inverted: #1A1A1A;

    --theme-border-default: #4D4D4D;
    --theme-border-muted: #333333;
    --theme-border-subtle: #1A1A1A;

    --theme-canvas-background: #2A2A2A;
  }

  /* Reduced Motion */
  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }

  /* Touch Device */
  @media (hover: none) and (pointer: coarse) {
    button,
    a,
    input[type="button"],
    input[type="submit"] {
      min-height: 44px;
      min-width: 44px;
    }
  }

  /* Responsive Typography */
  @media (max-width: 767px) {
    html {
      font-size: 14px;
    }
  }

  @media (min-width: 1024px) {
    html {
      font-size: 16px;
    }
  }
`;

/**
 * Export all theme utilities
 */
export { getCSSVariables, lightTheme } from '@/utils/designTokens';
export { CSSVariableManager, useCSSVariables, ThemeProvider } from '@/hooks/useCSSVariables';
