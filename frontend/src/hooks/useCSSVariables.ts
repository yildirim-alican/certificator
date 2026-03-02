/**
 * CSS Variables Hook
 * Provides access to design tokens as CSS variables
 * Implements theme switching (light/dark mode)
 */

import { useEffect, useState } from 'react';
import { getCSSVariables, lightTheme, darkTheme, type Theme } from '@/utils/designTokens';

export type ThemeMode = 'light' | 'dark' | 'auto';

interface UseCSSVariablesOptions {
  mode?: ThemeMode;
  rootElement?: HTMLElement;
}

/**
 * Hook to apply CSS variables to document
 * Usage: useCSSVariables({ mode: 'light' })
 */
export const useCSSVariables = (options: UseCSSVariablesOptions = {}) => {
  const { mode = 'auto', rootElement = document.documentElement } = options;
  const [currentTheme, setCurrentTheme] = useState<Theme>(lightTheme);
  const [currentMode, setCurrentMode] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    // Determine actual theme mode
    let actualMode: 'light' | 'dark' = 'light';

    if (mode === 'auto') {
      // Use system preference
      actualMode = window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } else {
      actualMode = mode as 'light' | 'dark';
    }

    // Select theme
    const theme = actualMode === 'dark' ? darkTheme : lightTheme;
    setCurrentTheme(theme);
    setCurrentMode(actualMode);

    // Apply CSS variables to root element
    const cssVars = getCSSVariables();
    Object.entries(cssVars).forEach(([key, value]: [string, unknown]) => {
      if (typeof value === 'string') {
        rootElement.style.setProperty(key, value);
      }
    });

    // Apply theme-specific variables
    Object.entries(theme.tokens).forEach(([category, values]) => {
      if (typeof values === 'object' && values !== null) {
        Object.entries(values).forEach(([key, value]: [string, unknown]) => {
          if (typeof value === 'string') {
            rootElement.style.setProperty(`--theme-${category}-${key}`, value);
          }
        });
      }
    });

    // Set data attribute for CSS selectors
    rootElement.setAttribute('data-theme', actualMode);

    // Listen for system theme changes if auto mode
    if (mode === 'auto') {
      const mediaQuery = window.matchMedia?.('(prefers-color-scheme: dark)');
      const handleChange = (e: MediaQueryListEvent) => {
        const newMode = e.matches ? 'dark' : 'light';
        setCurrentMode(newMode);
        const newTheme = e.matches ? darkTheme : lightTheme;
        setCurrentTheme(newTheme);
        rootElement.setAttribute('data-theme', newMode);
      };

      mediaQuery?.addEventListener('change', handleChange);
      return () => {
        mediaQuery?.removeEventListener('change', handleChange);
      };
    }
    return undefined;
  }, [mode, rootElement]);

  return {
    theme: currentTheme,
    mode: currentMode,
    updateMode: setCurrentMode,
  };
};

/**
 * Hook to get CSS variable value
 * Usage: const color = useCSSVariable('--primary-color')
 */
export const useCSSVariable = (variableName: string): string => {
  const [value, setValue] = useState<string>('');

  useEffect(() => {
    const computedValue = getComputedStyle(document.documentElement).getPropertyValue(variableName).trim();
    setValue(computedValue);
  }, [variableName]);

  return value;
};

/**
 * Provider component for CSS variables
 * Wrap your app with this at the root level
 */
interface ThemeProviderProps {
  children: React.ReactNode;
  mode?: ThemeMode;
  rootElement?: HTMLElement;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  mode = 'auto',
  rootElement = document.documentElement,
}) => {
  useCSSVariables({ mode, rootElement });

  return children as JSX.Element;
};

/**
 * Get all CSS variables programmatically
 */
export const getAllCSSVariables = (): Record<string, string> => {
  const variables: Record<string, string> = {};
  const root = document.documentElement;
  const styles = getComputedStyle(root);

  // Extract all CSS custom properties (variables start with --)
  for (let i = 0; i < styles.length; i++) {
    const property = styles[i];
    if (property.startsWith('--')) {
      variables[property] = styles.getPropertyValue(property).trim();
    }
  }

  return variables;
};

/**
 * Watch CSS variable changes
 */
export const useWatchCSSVariable = (variableName: string, callback: (value: string) => void) => {
  useEffect(() => {
    const observer = new MutationObserver(() => {
      const newValue = getComputedStyle(document.documentElement)
        .getPropertyValue(variableName)
        .trim();
      callback(newValue);
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['style'],
    });

    return () => observer.disconnect();
  }, [variableName, callback]);
};

/**
 * CSS variable utility class
 * Use for programmatic access
 */
export class CSSVariableManager {
  /**
   * Get a CSS variable value
   */
  static get(variableName: string): string {
    return getComputedStyle(document.documentElement)
      .getPropertyValue(variableName)
      .trim();
  }

  /**
   * Set a CSS variable value
   */
  static set(variableName: string, value: string): void {
    document.documentElement.style.setProperty(variableName, value);
  }

  /**
   * Remove a CSS variable
   */
  static remove(variableName: string): void {
    document.documentElement.style.removeProperty(variableName);
  }

  /**
   * Check if variable exists
   */
  static has(variableName: string): boolean {
    const value = this.get(variableName);
    return value !== '';
  }

  /**
   * Get all variables
   */
  static getAll(): Record<string, string> {
    return getAllCSSVariables();
  }

  /**
   * Set multiple variables at once
   */
  static setMultiple(variables: Record<string, string>): void {
    const root = document.documentElement;
    Object.entries(variables).forEach(([key, value]: [string, string]) => {
      root.style.setProperty(key, value);
    });
  }

  /**
   * Update theme mode
   */
  static setTheme(mode: 'light' | 'dark'): void {
    const theme = mode === 'dark' ? darkTheme : lightTheme;
    const root = document.documentElement;

    Object.entries(theme.tokens).forEach(([category, values]) => {
      if (typeof values === 'object' && values !== null) {
        Object.entries(values).forEach(([key, value]: [string, unknown]) => {
          if (typeof value === 'string') {
            root.style.setProperty(`--theme-${category}-${key}`, value);
          }
        });
      }
    });

    root.setAttribute('data-theme', mode);
  }

  /**
   * Get token value with fallback
   */
  static getWithFallback(variableName: string, fallback: string): string {
    const value = this.get(variableName);
    return value || fallback;
  }
}
