/**
 * Themed Button Component
 * Demonstrates design system integration using tokens and variants
 */

import React from 'react';
import { ButtonVariant, ButtonSize, ButtonState, ButtonConfig, VariantResolver } from '@/utils/componentVariants';
import { CSSVariableManager } from '@/hooks/useCSSVariables';

interface ThemedButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  state?: ButtonState;
  rounded?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
  isLoading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

/**
 * ThemedButton - Uses design system tokens
 */
const ThemedButton = React.forwardRef<HTMLButtonElement, ThemedButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      state = 'enabled',
      rounded = false,
      fullWidth = false,
      children,
      isLoading = false,
      icon,
      iconPosition = 'left',
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    // Determine actual state
    const actualState = disabled ? 'disabled' : (isLoading ? 'hover' : state);

    // Get variant styles
    const config: ButtonConfig = {
      variant,
      size,
      state: actualState,
      rounded,
      fullWidth,
    };

    const styles = VariantResolver.resolveButtonStyles(config);

    // Map styles to CSS properties
    const buttonStyle: React.CSSProperties = {
      padding: styles.padding,
      fontSize: styles.fontSize,
      height: styles.height,
      minWidth: styles.minWidth,
      backgroundColor: styles.background,
      color: styles.color,
      border: styles.border || 'none',
      borderRadius: styles.borderRadius,
      opacity: styles.opacity,
      pointerEvents: styles.pointerEvents,
      cursor: styles.cursor,
      transform: styles.transform,
      fontWeight: 500,
      transition: CSSVariableManager.getWithFallback(
        '--semantic-feedback-transition',
        'all 200ms cubic-bezier(0, 0, 0.2, 1)'
      ),
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      width: fullWidth ? '100%' : 'auto',
    };

    return (
      <button
        ref={ref}
        style={buttonStyle}
        disabled={disabled || isLoading}
        className={`themed-button themed-button-${variant} ${className}`}
        {...props}
      >
        {/* Icon (left) */}
        {icon && iconPosition === 'left' && (
          <span className="themed-button__icon themed-button__icon--left">
            {icon}
          </span>
        )}

        {/* Content */}
        <span className="themed-button__label">
          {isLoading ? 'Loading...' : children}
        </span>

        {/* Icon (right) */}
        {icon && iconPosition === 'right' && (
          <span className="themed-button__icon themed-button__icon--right">
            {icon}
          </span>
        )}
      </button>
    );
  }
);

ThemedButton.displayName = 'ThemedButton';

// ======================================================================
// BUTTON GROUP COMPONENT
// ======================================================================

interface ThemedButtonGroupProps {
  children: React.ReactNode;
  orientation?: 'horizontal' | 'vertical';
  gap?: string;
}

const ThemedButtonGroup = React.forwardRef<
  HTMLDivElement,
  ThemedButtonGroupProps
>(
  (
    { children, orientation = 'horizontal', gap = '8px' },
    ref
  ) => {
    const style: React.CSSProperties = {
      display: 'flex',
      flexDirection: orientation === 'vertical' ? 'column' : 'row',
      gap,
      alignItems: orientation === 'vertical' ? 'stretch' : 'center',
    };

    return (
      <div ref={ref} style={style} className="themed-button-group">
        {children}
      </div>
    );
  }
);

ThemedButtonGroup.displayName = 'ThemedButtonGroup';

// ======================================================================
// ICON BUTTON COMPONENT
// ======================================================================

interface ThemedIconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  tooltip?: string;
  variant?: 'primary' | 'secondary' | 'ghost';
}

const ThemedIconButton = React.forwardRef<
  HTMLButtonElement,
  ThemedIconButtonProps
>(
  (
    {
      icon,
      size = 'md',
      tooltip,
      variant = 'ghost',
      className = '',
      ...props
    },
    ref
  ) => {
    const sizeMap = {
      sm: '28px',
      md: '36px',
      lg: '44px',
    };

    const style: React.CSSProperties = {
      width: sizeMap[size],
      height: sizeMap[size],
      padding: '0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: 'none',
      borderRadius: '6px',
      backgroundColor:
        variant === 'ghost'
          ? 'transparent'
          : CSSVariableManager.getWithFallback(
              '--semantic-interactive-primary',
              '#6699FF'
            ),
      color:
        variant === 'ghost'
          ? CSSVariableManager.getWithFallback(
              '--semantic-foreground-primary',
              '#333333'
            )
          : '#FFFFFF',
      cursor: 'pointer',
      transition:
        'all 200ms cubic-bezier(0, 0, 0.2, 1)',
    };

    return (
      <button
        ref={ref}
        style={style}
        title={tooltip}
        className={`themed-icon-button themed-icon-button-${size} ${className}`}
        {...props}
      >
        {icon}
      </button>
    );
  }
);

ThemedIconButton.displayName = 'ThemedIconButton';

// ======================================================================
// EXPORTS
// ======================================================================

export { ThemedButton, ThemedButtonGroup, ThemedIconButton };
export type { ThemedButtonProps, ThemedIconButtonProps, ThemedButtonGroupProps };
