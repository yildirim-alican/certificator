/**
 * Component Variant System
 * Implements Figma-style component system with variants
 * Base components have Properties (booleans/strings) that drive variants
 */

// ======================================================================
// VARIANT DEFINITION SYSTEM
// ======================================================================

/**
 * Component property definition
 * Used to define what properties/variants a component supports
 */
export interface ComponentProperty {
  type: 'boolean' | 'string' | 'enum' | 'instance';
  defaultValue?: string | boolean;
  group?: string;
  description?: string;
}

export interface ComponentDefinition {
  name: string;
  description?: string;
  properties: Record<string, ComponentProperty>;
}

// ======================================================================
// BUTTON COMPONENT VARIANTS
// ======================================================================

export const ButtonDefinition: ComponentDefinition = {
  name: 'Button',
  description: 'Interactive button component with multiple variants',
  properties: {
    variant: {
      type: 'enum',
      defaultValue: 'primary',
      group: 'Appearance',
      description: 'Visual style of the button',
    },
    size: {
      type: 'enum',
      defaultValue: 'md',
      group: 'Size',
      description: 'Button size',
    },
    state: {
      type: 'enum',
      defaultValue: 'enabled',
      group: 'State',
      description: 'Button state (enabled, hover, active, disabled)',
    },
    rounded: {
      type: 'boolean',
      defaultValue: false,
      group: 'Shape',
      description: 'Rounded corners',
    },
    fullWidth: {
      type: 'boolean',
      defaultValue: false,
      group: 'Layout',
      description: 'Full width button',
    },
  },
};

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';
export type ButtonState = 'enabled' | 'hover' | 'active' | 'disabled';

export interface ButtonConfig {
  variant: ButtonVariant;
  size: ButtonSize;
  state: ButtonState;
  rounded: boolean;
  fullWidth: boolean;
}

export const ButtonVariants: Record<ButtonVariant, Record<ButtonSize, {
  padding: string;
  fontSize: string;
  height: string;
  minWidth: string;
}>> = {
  primary: {
    xs: { padding: '4px 8px', fontSize: '12px', height: '28px', minWidth: '40px' },
    sm: { padding: '6px 12px', fontSize: '14px', height: '32px', minWidth: '48px' },
    md: { padding: '8px 16px', fontSize: '14px', height: '36px', minWidth: '56px' },
    lg: { padding: '10px 20px', fontSize: '16px', height: '40px', minWidth: '64px' },
  },
  secondary: {
    xs: { padding: '4px 8px', fontSize: '12px', height: '28px', minWidth: '40px' },
    sm: { padding: '6px 12px', fontSize: '14px', height: '32px', minWidth: '48px' },
    md: { padding: '8px 16px', fontSize: '14px', height: '36px', minWidth: '56px' },
    lg: { padding: '10px 20px', fontSize: '16px', height: '40px', minWidth: '64px' },
  },
  danger: {
    xs: { padding: '4px 8px', fontSize: '12px', height: '28px', minWidth: '40px' },
    sm: { padding: '6px 12px', fontSize: '14px', height: '32px', minWidth: '48px' },
    md: { padding: '8px 16px', fontSize: '14px', height: '36px', minWidth: '56px' },
    lg: { padding: '10px 20px', fontSize: '16px', height: '40px', minWidth: '64px' },
  },
  ghost: {
    xs: { padding: '4px 8px', fontSize: '12px', height: '28px', minWidth: '40px' },
    sm: { padding: '6px 12px', fontSize: '14px', height: '32px', minWidth: '48px' },
    md: { padding: '8px 16px', fontSize: '14px', height: '36px', minWidth: '56px' },
    lg: { padding: '10px 20px', fontSize: '16px', height: '40px', minWidth: '64px' },
  },
};

// ======================================================================
// INPUT COMPONENT VARIANTS
// ======================================================================

export const InputDefinition: ComponentDefinition = {
  name: 'Input',
  description: 'Text input field component',
  properties: {
    size: {
      type: 'enum',
      defaultValue: 'md',
      group: 'Size',
      description: 'Input size',
    },
    state: {
      type: 'enum',
      defaultValue: 'default',
      group: 'State',
      description: 'Input state (default, focus, error, disabled)',
    },
    fullWidth: {
      type: 'boolean',
      defaultValue: false,
      group: 'Layout',
    },
  },
};

export type InputSize = 'sm' | 'md' | 'lg';
export type InputState = 'default' | 'focus' | 'error' | 'disabled';

export interface InputConfig {
  size: InputSize;
  state: InputState;
  fullWidth: boolean;
}

export const InputVariants: Record<InputSize, {
  padding: string;
  fontSize: string;
  height: string;
  borderRadius: string;
}> = {
  sm: { padding: '6px 8px', fontSize: '12px', height: '28px', borderRadius: '4px' },
  md: { padding: '8px 12px', fontSize: '14px', height: '36px', borderRadius: '6px' },
  lg: { padding: '10px 14px', fontSize: '16px', height: '44px', borderRadius: '8px' },
};

// ======================================================================
// BADGE COMPONENT VARIANTS
// ======================================================================

export const BadgeDefinition: ComponentDefinition = {
  name: 'Badge',
  description: 'Small label or status indicator',
  properties: {
    variant: {
      type: 'enum',
      defaultValue: 'default',
      group: 'Appearance',
    },
    size: {
      type: 'enum',
      defaultValue: 'md',
      group: 'Size',
    },
  },
};

export type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info';
export type BadgeSize = 'sm' | 'md' | 'lg';

export interface BadgeConfig {
  variant: BadgeVariant;
  size: BadgeSize;
}

export const BadgeVariants: Record<BadgeVariant, {
  backgroundColor: string;
  color: string;
}> = {
  default: { backgroundColor: 'rgba(102, 102, 102, 0.1)', color: '#666666' },
  success: { backgroundColor: 'rgba(102, 195, 153, 0.1)', color: '#008C4D' },
  warning: { backgroundColor: 'rgba(255, 136, 85, 0.1)', color: '#CC5500' },
  error: { backgroundColor: 'rgba(255, 102, 102, 0.1)', color: '#CC0000' },
  info: { backgroundColor: 'rgba(102, 153, 255, 0.1)', color: '#0047CC' },
};

// ======================================================================
// CARD COMPONENT VARIANTS
// ======================================================================

export const CardDefinition: ComponentDefinition = {
  name: 'Card',
  description: 'Container for grouped content',
  properties: {
    variant: {
      type: 'enum',
      defaultValue: 'default',
      group: 'Appearance',
    },
    interactive: {
      type: 'boolean',
      defaultValue: false,
      group: 'Interaction',
      description: 'Hoverable/clickable card',
    },
    elevation: {
      type: 'enum',
      defaultValue: 'md',
      group: 'Shadow',
    },
  },
};

export type CardVariant = 'default' | 'outlined' | 'elevated';
export type CardElevation = 'xs' | 'sm' | 'md' | 'lg';

export interface CardConfig {
  variant: CardVariant;
  interactive: boolean;
  elevation: CardElevation;
}

// ======================================================================
// VARIANT RESOLVER - Determines styles based on properties
// ======================================================================

export interface VariantResolverOptions {
  [key: string]: string | boolean | undefined;
}

export class VariantResolver {
  /**
   * Resolve button styles from properties
   */
  static resolveButtonStyles(config: ButtonConfig): Record<string, any> {
    const sizeStyles = ButtonVariants[config.variant][config.size];
    
    const stateStyles: Record<string, any> = {
      enabled: {
        opacity: 1,
        pointerEvents: 'auto',
        cursor: 'pointer',
      },
      hover: {
        opacity: 0.9,
        transform: 'scale(0.99)',
      },
      active: {
        opacity: 0.8,
        transform: 'scale(0.98)',
      },
      disabled: {
        opacity: 0.5,
        pointerEvents: 'none',
        cursor: 'not-allowed',
      },
    };

    const variantColors: Record<ButtonVariant, Record<string, string>> = {
      primary: {
        background: '#6699FF',
        color: '#FFFFFF',
        border: 'none',
      },
      secondary: {
        background: '#E5E5E5',
        color: '#333333',
        border: '1px solid #CCCCCC',
      },
      danger: {
        background: '#FF6666',
        color: '#FFFFFF',
        border: 'none',
      },
      ghost: {
        background: 'transparent',
        color: '#333333',
        border: '1px solid #CCCCCC',
      },
    };

    return {
      ...sizeStyles,
      ...variantColors[config.variant],
      ...stateStyles[config.state],
      borderRadius: config.rounded ? '20px' : '6px',
      width: config.fullWidth ? '100%' : 'auto',
    };
  }

  /**
   * Resolve input styles from properties
   */
  static resolveInputStyles(config: InputConfig): Record<string, any> {
    const sizeStyles = InputVariants[config.size];

    const stateStyles: Record<InputState, Record<string, any>> = {
      default: {
        borderColor: '#CCCCCC',
        color: '#333333',
      },
      focus: {
        borderColor: '#6699FF',
        boxShadow: '0 0 0 3px rgba(102, 153, 255, 0.1)',
        outline: 'none',
      },
      error: {
        borderColor: '#FF6666',
        boxShadow: '0 0 0 3px rgba(255, 102, 102, 0.1)',
      },
      disabled: {
        borderColor: '#E5E5E5',
        backgroundColor: '#F5F5F5',
        color: '#999999',
        cursor: 'not-allowed',
      },
    };

    return {
      ...sizeStyles,
      border: '1px solid',
      display: 'block',
      fontFamily: 'inherit',
      width: config.fullWidth ? '100%' : 'auto',
      ...stateStyles[config.state],
    };
  }

  /**
   * Resolve badge styles from properties
   */
  static resolveBadgeStyles(config: BadgeConfig): Record<string, any> {
    const variantStyles = BadgeVariants[config.variant];
    const sizeMap = {
      sm: { padding: '2px 8px', fontSize: '11px', borderRadius: '12px' },
      md: { padding: '4px 10px', fontSize: '12px', borderRadius: '14px' },
      lg: { padding: '6px 12px', fontSize: '13px', borderRadius: '16px' },
    };

    return {
      ...sizeMap[config.size],
      ...variantStyles,
      display: 'inline-block',
      fontWeight: 500,
      whiteSpace: 'nowrap' as const,
    };
  }

  /**
   * Resolve card styles from properties
   */
  static resolveCardStyles(config: CardConfig): Record<string, any> {
    const variantStyles: Record<CardVariant, Record<string, any>> = {
      default: {
        backgroundColor: '#FFFFFF',
        border: '1px solid #E5E5E5',
      },
      outlined: {
        backgroundColor: '#FFFFFF',
        border: '1px solid #CCCCCC',
      },
      elevated: {
        backgroundColor: '#FFFFFF',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        border: 'none',
      },
    };

    const elevationShadows: Record<CardElevation, string> = {
      xs: '0 1px 2px rgba(0, 0, 0, 0.05)',
      sm: '0 1px 3px rgba(0, 0, 0, 0.1)',
      md: '0 4px 6px rgba(0, 0, 0, 0.1)',
      lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
    };

    return {
      borderRadius: '8px',
      padding: '16px',
      ...variantStyles[config.variant],
      ...(config.elevation && config.variant === 'elevated' && {
        boxShadow: elevationShadows[config.elevation],
      }),
      ...(config.interactive && {
        cursor: 'pointer',
        transition: 'all 200ms ease-out',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: elevationShadows['lg'],
        },
      }),
    };
  }
}

// ======================================================================
// COMPONENT INSTANCE (Figma-like pattern)
// ======================================================================

export interface ComponentInstance {
  id: string;
  componentName: string;
  properties: Record<string, string | boolean>;
  children?: ComponentInstance[];
}

/**
 * Factory function to create component instances
 * Similar to Figma's "Create component instance" feature
 */
export function createComponentInstance(
  componentName: string,
  properties: VariantResolverOptions
): ComponentInstance {
  return {
    id: `${componentName}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    componentName,
    properties: properties as Record<string, string | boolean>,
  };
}
