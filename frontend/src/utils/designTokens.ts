/**
 * Design System Tokens
 * Inspired by Figma design system principles
 * Primitive tokens (base values) + Semantic tokens (meaningful names)
 */

// ======================================================================
// PRIMITIVE TOKENS - Base foundational values
// ======================================================================

export const PrimitiveTokens = {
  // SPACING - Multiples of 8 for optimal performance
  spacing: {
    xs: '4px',    // 0.5x
    sm: '8px',    // 1x
    md: '12px',   // 1.5x
    lg: '16px',   // 2x
    xl: '24px',   // 3x
    xxl: '32px',  // 4x
    xxxl: '48px', // 6x
  },

  // BORDER RADIUS - Numeric pixel values for flexibility
  borderRadius: {
    none: '0',
    xs: '2px',
    sm: '4px',
    md: '6px',
    lg: '8px',
    xl: '12px',
    full: '9999px',
  },

  // COLORS - Using lightness values for maintainability
  colors: {
    // Neutral palette (grays)
    neutral: {
      95: '#F5F5F5', // lightest
      90: '#E5E5E5',
      80: '#CCCCCC',
      70: '#B3B3B3',
      60: '#999999',
      50: '#808080', // mid
      40: '#666666',
      30: '#4D4D4D',
      20: '#333333',
      10: '#1A1A1A',
    },

    // Blue (primary)
    blue: {
      95: '#F0F5FF',
      90: '#E1EBFF',
      80: '#C2D7FF',
      70: '#A4C2FF',
      60: '#85ADFF',
      50: '#6699FF', // primary
      40: '#4784FF',
      30: '#2870FF',
      20: '#0A5BFF',
      10: '#0047CC',
    },

    // Green (success)
    green: {
      95: '#F0F9F5',
      90: '#E1F3EB',
      80: '#C2E7D7',
      70: '#A4DBC2',
      60: '#85CFAE',
      50: '#66C399', // success
      40: '#47B785',
      30: '#28AB70',
      20: '#0A9F5C',
      10: '#008C4D',
    },

    // Red (error/warning)
    red: {
      95: '#FFF0F0',
      90: '#FFE1E1',
      80: '#FFC2C2',
      70: '#FFA4A4',
      60: '#FF8585',
      50: '#FF6666', // error
      40: '#FF4747',
      30: '#FF2828',
      20: '#FF0A0A',
      10: '#CC0000',
    },

    // Semantic colors
    white: '#FFFFFF',
    black: '#000000',
  },

  // TYPOGRAPHY - Font sizes (px)
  fontSize: {
    xs: '12px',
    sm: '14px',
    md: '16px',
    lg: '18px',
    xl: '20px',
    xxl: '24px',
    xxxl: '32px',
  },

  // LINE HEIGHT - Unitless multipliers
  lineHeight: {
    tight: 1.1,
    normal: 1.5,
    relaxed: 1.75,
  },

  // FONT WEIGHT
  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },

  // SHADOWS - Depth levels (none to xxl)
  shadow: {
    none: 'none',
    xs: '0 1px 2px rgba(0, 0, 0, 0.05)',
    sm: '0 1px 3px rgba(0, 0, 0, 0.1)',
    md: '0 4px 6px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px rgba(0, 0, 0, 0.1)',
    xxl: '0 25px 50px rgba(0, 0, 0, 0.15)',
  },

  // TRANSITIONS (duration in ms)
  duration: {
    instant: '0ms',
    fast: '100ms',
    normal: '200ms',
    slow: '300ms',
  },

  // EASING FUNCTIONS
  easing: {
    linear: 'linear',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
} as const;

// ======================================================================
// SEMANTIC TOKENS - Meaningful, mode-aware names
// ======================================================================

export const SemanticTokens = {
  // BACKGROUND - Elevation/layer levels
  background: {
    base: PrimitiveTokens.colors.white,
    elevated: PrimitiveTokens.colors.neutral[95],
    overlay: 'rgba(0, 0, 0, 0.5)',
  },

  // FOREGROUND - Text and UI elements
  foreground: {
    primary: PrimitiveTokens.colors.neutral[10],    // Strongest contrast
    secondary: PrimitiveTokens.colors.neutral[40],  // Medium contrast
    tertiary: PrimitiveTokens.colors.neutral[60],   // Weakest contrast
  },

  // TEXT
  text: {
    primary: PrimitiveTokens.colors.neutral[10],
    secondary: PrimitiveTokens.colors.neutral[40],
    tertiary: PrimitiveTokens.colors.neutral[60],
    inverted: PrimitiveTokens.colors.white,
  },

  // BORDER
  border: {
    default: PrimitiveTokens.colors.neutral[80],
    muted: PrimitiveTokens.colors.neutral[90],
    subtle: PrimitiveTokens.colors.neutral[95],
  },

  // INTERACTIVE - State colors
  interactive: {
    primary: PrimitiveTokens.colors.blue[50],
    primaryDim: PrimitiveTokens.colors.blue[80],      // Hover/alt state
    success: PrimitiveTokens.colors.green[50],
    successDim: PrimitiveTokens.colors.green[80],
    error: PrimitiveTokens.colors.red[50],
    errorDim: PrimitiveTokens.colors.red[80],
  },

  // CANVAS - Editor-specific
  canvas: {
    background: PrimitiveTokens.colors.white,
    grid: 'rgba(200, 200, 200, 0.1)',
    selection: PrimitiveTokens.colors.blue[50],
    guide: PrimitiveTokens.colors.blue[50],
    handle: PrimitiveTokens.colors.blue[50],
  },

  // FEEDBACK
  feedback: {
    success: PrimitiveTokens.colors.green[50],
    warning: PrimitiveTokens.colors.red[60],
    error: PrimitiveTokens.colors.red[50],
    info: PrimitiveTokens.colors.blue[50],
  },
} as const;

// ======================================================================
// RESPONSIVE BREAKPOINTS - Mobile-first approach
// ======================================================================

export const Breakpoints = {
  mobile: '320px',     // Small phones
  tablet: '768px',     // Tablets
  desktop: '1024px',   // Desktops
  wide: '1440px',      // Wide screens
} as const;

// ======================================================================
// COMPONENT-SPECIFIC TOKENS
// ======================================================================

export const ComponentTokens = {
  button: {
    height: PrimitiveTokens.spacing.lg,
    padding: `${PrimitiveTokens.spacing.sm} ${PrimitiveTokens.spacing.lg}`,
    borderRadius: PrimitiveTokens.borderRadius.md,
    fontSize: PrimitiveTokens.fontSize.md,
    fontWeight: PrimitiveTokens.fontWeight.medium,
    transition: `all ${PrimitiveTokens.duration.normal} ${PrimitiveTokens.easing.easeOut}`,
  },

  input: {
    height: PrimitiveTokens.spacing.lg,
    padding: PrimitiveTokens.spacing.sm,
    borderRadius: PrimitiveTokens.borderRadius.sm,
    fontSize: PrimitiveTokens.fontSize.md,
    border: `1px solid ${SemanticTokens.border.default}`,
    transition: `all ${PrimitiveTokens.duration.normal} ${PrimitiveTokens.easing.easeOut}`,
  },

  card: {
    borderRadius: PrimitiveTokens.borderRadius.lg,
    padding: PrimitiveTokens.spacing.lg,
    shadow: PrimitiveTokens.shadow.md,
    transition: `all ${PrimitiveTokens.duration.slow} ${PrimitiveTokens.easing.easeOut}`,
  },

  editor: {
    gridSize: '50px',
    handleSize: '12px',
    guideWidth: '1px',
    guideColor: SemanticTokens.canvas.guide,
    selectionColor: SemanticTokens.canvas.selection,
    minElementSize: '20px',
    dragThreshold: '4px',
  },
} as const;

// ======================================================================
// CSS CUSTOM PROPERTIES - Exportable to CSS
// ======================================================================

export const getCSSVariables = (): Record<string, string> => {
  const vars: Record<string, string> = {};

  // Flatten primitive tokens
  Object.entries(PrimitiveTokens).forEach(([category, values]) => {
    if (typeof values === 'object') {
      Object.entries(values).forEach(([key, value]) => {
        if (typeof value === 'string') {
          vars[`--${category}-${key}`] = value;
        }
      });
    }
  });

  // Flatten semantic tokens
  Object.entries(SemanticTokens).forEach(([category, values]) => {
    if (typeof values === 'object') {
      Object.entries(values).forEach(([key, value]) => {
        if (typeof value === 'string') {
          vars[`--semantic-${category}-${key}`] = value;
        }
      });
    }
  });

  return vars;
};

// ======================================================================
// THEME CONFIGURATION
// ======================================================================

export interface Theme {
  name: 'light' | 'dark';
  tokens: Record<string, Record<string, string>>;
}

export const lightTheme: Theme = {
  name: 'light',
  tokens: SemanticTokens,
};

// Dark theme would swap color values
export const darkTheme: Theme = {
  name: 'dark',
  tokens: {
    background: {
      base: PrimitiveTokens.colors.neutral[10],
      elevated: PrimitiveTokens.colors.neutral[20],
      overlay: 'rgba(0, 0, 0, 0.8)',
    },
    foreground: {
      primary: PrimitiveTokens.colors.white,
      secondary: PrimitiveTokens.colors.neutral[60],
      tertiary: PrimitiveTokens.colors.neutral[40],
    },
    text: {
      primary: PrimitiveTokens.colors.white,
      secondary: PrimitiveTokens.colors.neutral[60],
      tertiary: PrimitiveTokens.colors.neutral[40],
      inverted: PrimitiveTokens.colors.neutral[10],
    },
    border: {
      default: PrimitiveTokens.colors.neutral[40],
      muted: PrimitiveTokens.colors.neutral[20],
      subtle: PrimitiveTokens.colors.neutral[10],
    },
    interactive: {
      primary: PrimitiveTokens.colors.blue[50],
      primaryDim: PrimitiveTokens.colors.blue[80],
      success: PrimitiveTokens.colors.green[50],
      successDim: PrimitiveTokens.colors.green[80],
      error: PrimitiveTokens.colors.red[50],
      errorDim: PrimitiveTokens.colors.red[80],
    },
    canvas: {
      background: PrimitiveTokens.colors.neutral[10],
      grid: 'rgba(100, 100, 100, 0.1)',
      selection: PrimitiveTokens.colors.blue[50],
      guide: PrimitiveTokens.colors.blue[50],
      handle: PrimitiveTokens.colors.blue[50],
    },
    feedback: {
      success: PrimitiveTokens.colors.green[50],
      warning: PrimitiveTokens.colors.red[60],
      error: PrimitiveTokens.colors.red[50],
      info: PrimitiveTokens.colors.blue[50],
    },
  },
};
