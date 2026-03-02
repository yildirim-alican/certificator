/**
 * Themed Card Component
 * Container component with design system styling
 */

import React from 'react';
import { CardVariant, CardElevation, CardConfig, VariantResolver } from '@/utils/componentVariants';

interface ThemedCardProps
  extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  elevation?: CardElevation;
  interactive?: boolean;
  padding?: string;
  children: React.ReactNode;
}

/**
 * ThemedCard - Container with card styling
 */
const ThemedCard = React.forwardRef<HTMLDivElement, ThemedCardProps>(
  (
    {
      variant = 'default',
      elevation = 'md',
      interactive = false,
      padding = '16px',
      children,
      className = '',
      style: styleProp,
      ...props
    },
    ref
  ) => {
    // Get variant styles
    const config: CardConfig = {
      variant,
      elevation,
      interactive,
    };

    const variantStyles = VariantResolver.resolveCardStyles(config);

    const cardStyle: React.CSSProperties = {
      ...variantStyles,
      padding,
      boxSizing: 'border-box',
      ...styleProp,
    };

    return (
      <div
        ref={ref}
        style={cardStyle}
        className={`themed-card themed-card-${variant} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

ThemedCard.displayName = 'ThemedCard';

// ======================================================================
// CARD SECTIONS
// ======================================================================

interface ThemedCardHeaderProps
  extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  actions?: React.ReactNode;
}

const ThemedCardHeader = React.forwardRef<
  HTMLDivElement,
  ThemedCardHeaderProps
>(({ children, actions, className = '', style: styleProp, ...props }, ref) => {
  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: '12px',
    borderBottom: '1px solid #E5E5E5',
    marginBottom: '12px',
    ...styleProp,
  };

  return (
    <div
      ref={ref}
      style={headerStyle}
      className={`themed-card-header ${className}`}
      {...props}
    >
      <div>{children}</div>
      {actions && <div>{actions}</div>}
    </div>
  );
});

ThemedCardHeader.displayName = 'ThemedCardHeader';

interface ThemedCardBodyProps
  extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const ThemedCardBody = React.forwardRef<HTMLDivElement, ThemedCardBodyProps>(
  ({ children, className = '', style: styleProp, ...props }, ref) => {
    const bodyStyle: React.CSSProperties = {
      flex: 1,
      ...styleProp,
    };

    return (
      <div
        ref={ref}
        style={bodyStyle}
        className={`themed-card-body ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

ThemedCardBody.displayName = 'ThemedCardBody';

interface ThemedCardFooterProps
  extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const ThemedCardFooter = React.forwardRef<
  HTMLDivElement,
  ThemedCardFooterProps
>(({ children, className = '', style: styleProp, ...props }, ref) => {
  const footerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: '8px',
    paddingTop: '12px',
    borderTop: '1px solid #E5E5E5',
    marginTop: '12px',
    ...styleProp,
  };

  return (
    <div
      ref={ref}
      style={footerStyle}
      className={`themed-card-footer ${className}`}
      {...props}
    >
      {children}
    </div>
  );
});

ThemedCardFooter.displayName = 'ThemedCardFooter';

export {
  ThemedCard,
  ThemedCardHeader,
  ThemedCardBody,
  ThemedCardFooter,
};
export type {
  ThemedCardProps,
  ThemedCardHeaderProps,
  ThemedCardBodyProps,
  ThemedCardFooterProps,
};
