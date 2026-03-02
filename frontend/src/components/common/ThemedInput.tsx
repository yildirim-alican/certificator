/**
 * Themed Input Component
 * Demonstrates form input integration with design tokens
 */

import React, { useState } from 'react';
import { InputSize, InputState, InputConfig, VariantResolver } from '@/utils/componentVariants';

interface ThemedInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  size?: InputSize;
  state?: InputState;
  fullWidth?: boolean;
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

/**
 * ThemedInput - Form input with design system tokens
 */
const ThemedInput = React.forwardRef<HTMLInputElement, ThemedInputProps>(
  (
    {
      size = 'md',
      state: stateProp = 'default',
      fullWidth = false,
      label,
      error,
      helperText,
      icon,
      iconPosition = 'left',
      onFocus,
      onBlur,
      disabled,
      className = '',
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);

    // Determine actual state
    let actualState: InputState = stateProp;
    if (disabled) actualState = 'disabled';
    else if (error) actualState = 'error';
    else if (isFocused) actualState = 'focus';

    // Get variant styles
    const config: InputConfig = {
      size,
      state: actualState,
      fullWidth,
    };

    const styles = VariantResolver.resolveInputStyles(config);

    const inputStyle: React.CSSProperties = {
      ...styles,
      width: fullWidth ? '100%' : '100%',
      fontFamily: 'inherit',
      boxSizing: 'border-box',
      paddingLeft: icon && iconPosition === 'left' ? '36px' : styles.paddingLeft,
      paddingRight: icon && iconPosition === 'right' ? '36px' : styles.paddingRight,
    };

    const containerStyle: React.CSSProperties = {
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
      width: fullWidth ? '100%' : 'auto',
    };

    const wrapperStyle: React.CSSProperties = {
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
    };

    const iconStyle: React.CSSProperties = {
      position: 'absolute',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '36px',
      height: '100%',
      color: 'inherit',
      pointerEvents: 'none',
      left: iconPosition === 'left' ? 0 : 'auto',
      right: iconPosition === 'right' ? 0 : 'auto',
      opacity: disabled ? 0.5 : 0.7,
    };

    const labelStyle: React.CSSProperties = {
      fontSize: '14px',
      fontWeight: 500,
      color: disabled ? '#999999' : '#333333',
    };

    const helperTextStyle: React.CSSProperties = {
      fontSize: '12px',
      color: error ? '#FF6666' : '#666666',
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      onBlur?.(e);
    };

    return (
      <div style={containerStyle}>
        {label && <label style={labelStyle}>{label}</label>}

        <div style={wrapperStyle}>
          {icon && <span style={iconStyle}>{icon}</span>}

          <input
            ref={ref}
            style={inputStyle}
            disabled={disabled}
            className={`themed-input themed-input-${size} ${className}`}
            onFocus={handleFocus}
            onBlur={handleBlur}
            {...props}
          />
        </div>

        {(helperText || error) && (
          <span style={helperTextStyle}>{error || helperText}</span>
        )}
      </div>
    );
  }
);

ThemedInput.displayName = 'ThemedInput';

export { ThemedInput };
export type { ThemedInputProps };
