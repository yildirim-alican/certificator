# Design System Guide

A comprehensive, production-ready design system for the Certificate Editor, inspired by Figma's design principles.

## Overview

This design system provides:

- **Primitive Tokens**: Base values (spacing, colors, typography, shadows)
- **Semantic Tokens**: Meaningful, context-aware values (backgrounds, borders, interactive states)
- **Component Variants**: Figma-style component system with properties and variants
- **Responsive Layout**: Mobile-first responsive design utilities
- **CSS Variables**: Easy theme switching (light/dark mode)
- **Accessibility**: WCAG compliance built-in

## Quick Start

### 1. Initialize Theme at App Root

In your root layout or main component:

```typescript
// app/layout.tsx or app.tsx
import { ThemeProvider } from '@/hooks/useCSSVariables';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ThemeProvider mode="auto">
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

### 2. Use Themed Components

```tsx
import { ThemedButton, ThemedInput, ThemedCard } from '@/components/common';

export function MyComponent() {
  return (
    <ThemedCard variant="elevated" elevation="md">
      <ThemedInput
        label="Name"
        placeholder="Enter your name"
        size="md"
      />
      <ThemedButton variant="primary" size="md">
        Submit
      </ThemedButton>
    </ThemedCard>
  );
}
```

### 3. Access Design Tokens

```typescript
// Via CSS Variables (recommended for CSS-in-JS)
import { CSSVariableManager } from '@/hooks/useCSSVariables';

const primaryColor = CSSVariableManager.get('--theme-interactive-primary');

// Via TypeScript
import { PrimitiveTokens, SemanticTokens } from '@/utils/designTokens';

const spacing = PrimitiveTokens.spacing.md; // '16px'
const textColor = SemanticTokens.foreground.primary; // '#1A1A1A'
```

## Token Organization

### Primitive Tokens

Base, mode-agnostic values:

```typescript
PrimitiveTokens.spacing     // xs, sm, md, lg, xl, xxl, xxxl
PrimitiveTokens.colors      // neutral, blue, green, red palettes
PrimitiveTokens.fontSize    // xs, sm, md, lg, xl, xxl, xxxl
PrimitiveTokens.borderRadius // none, xs, sm, md, lg, xl, full
PrimitiveTokens.shadow      // none, xs, sm, md, lg, xl, xxl
PrimitiveTokens.duration    // instant, fast, normal, slow
PrimitiveTokens.easing      // linear, easeIn, easeOut, easeInOut
```

### Semantic Tokens

Meaningful, context-aware values (light/dark mode aware):

```typescript
SemanticTokens.background   // base, elevated, overlay
SemanticTokens.foreground   // primary, secondary, tertiary
SemanticTokens.text         // primary, secondary, tertiary, inverted
SemanticTokens.border       // default, muted, subtle
SemanticTokens.interactive  // primary, success, error (+ dim variants)
SemanticTokens.canvas       // editor-specific colors
SemanticTokens.feedback     // success, warning, error, info
```

## Component Variants System

### ButtonComponent

```tsx
<ThemedButton
  variant="primary"       // 'primary' | 'secondary' | 'danger' | 'ghost'
  size="md"              // 'xs' | 'sm' | 'md' | 'lg'
  state="enabled"        // 'enabled' | 'hover' | 'active' | 'disabled'
  rounded={false}        // Rounded corners
  fullWidth={false}      // 100% container width
  isLoading={false}      // Show loading state
  icon={<Icon />}        // Optional icon
  iconPosition="left"    // 'left' | 'right'
>
  Click Me
</ThemedButton>
```

**Variants:**
- `primary`: Solid filled button
- `secondary`: Outlined button
- `danger`: Red error button
- `ghost`: Transparent button

**Sizes:**
- `xs`: 28px height (compact)
- `sm`: 32px height
- `md`: 36px height (default)
- `lg`: 40px height (touch-friendly)

### InputComponent

```tsx
<ThemedInput
  size="md"              // 'sm' | 'md' | 'lg'
  state="default"        // 'default' | 'focus' | 'error' | 'disabled'
  fullWidth={false}      // 100% container width
  label="Email"          // Optional label
  error="Invalid email"  // Show error state
  helperText="..."      // Helper text below
  icon={<Icon />}        // Optional icon
  iconPosition="left"    // 'left' | 'right'
  placeholder="...
/>
```

### CardComponent

```tsx
<ThemedCard
  variant="default"      // 'default' | 'outlined' | 'elevated'
  elevation="md"         // 'xs' | 'sm' | 'md' | 'lg'
  interactive={false}    // Hoverable/clickable
  padding="16px"         // Custom padding
>
  <ThemedCardHeader actions={<Actions />}>
    Card Title
  </ThemedCardHeader>
  
  <ThemedCardBody>
    Card content here
  </ThemedCardBody>
  
  <ThemedCardFooter>
    Card actions
  </ThemedCardFooter>
</ThemedCard>
```

## Responsive Design

### Use Responsive Values

```typescript
import { ResponsiveValue, getResponsiveValue } from '@/utils/responsiveLayout';

const spacing: ResponsiveValue<string> = {
  mobile: '8px',
  tablet: '12px',
  desktop: '16px',
  wide: '24px',
};

const value = getResponsiveValue(spacing, 'mobile'); // '8px'
```

### Media Query Helpers

```typescript
import { MediaQuery, createMediaQuery } from '@/utils/responsiveLayout';

// In styled-components or CSS-in-JS
const styles = {
  container: {
    // Mobile-first (base)
    padding: '12px',
    [`@media ${MediaQuery.tablet}`]: {
      padding: '16px',
    },
    [`@media ${MediaQuery.desktop}`]: {
      padding: '24px',
    },
  },
};
```

### Breakpoints

```typescript
// Mobile-first approach
Breakpoints.mobile = '320px'    // xs phones
Breakpoints.tablet = '768px'    // tablets
Breakpoints.desktop = '1024px'  // desktops
Breakpoints.wide = '1440px'     // wide screens
```

### Touch-Friendly Sizes

```typescript
import { TouchTargetSize } from '@/utils/responsiveLayout';

// Minimum touch target (44-48px per WCAG AA)
TouchTargetSize.minSize = '48px';
TouchTargetSize.minSizeCompact = '44px';

// Responsive input heights
TouchTargetSize.input.mobile   // 44px
TouchTargetSize.input.tablet   // 40px
TouchTargetSize.input.desktop  // 36px
```

## Theme Switching (Light/Dark Mode)

### Using Provider

```tsx
// Auto-detect user preference
<ThemeProvider mode="auto">
  {children}
</ThemeProvider>

// Force light
<ThemeProvider mode="light">
  {children}
</ThemeProvider>

// Force dark
<ThemeProvider mode="dark">
  {children}
</ThemeProvider>
```

### Programmatic Control

```typescript
import { CSSVariableManager } from '@/hooks/useCSSVariables';

// Switch theme
CSSVariableManager.setTheme('dark');
CSSVariableManager.setTheme('light');

// Get current theme
const theme = document.documentElement.getAttribute('data-theme');
```

### CSS-based Theme Selection

```css
/* Light theme (default) */
:root {
  --theme-background-base: #FFFFFF;
  --theme-text-primary: #1A1A1A;
}

/* Dark theme */
[data-theme="dark"] {
  --theme-background-base: #1A1A1A;
  --theme-text-primary: #FFFFFF;
}
```

## Accessibility

### Built-in Features

- WCAG AA contrast ratios
- Touch-friendly sizing (44x44px minimum)
- Keyboard navigation support
- Screen reader optimization
- Reduced motion support

### Using A11y Utilities

```typescript
import { a11y } from '@/utils/responsiveLayout';

// Skip links (visually hidden but accessible)
<a href="#main" style={a11y.skipLinkStyles}>
  Skip to content
</a>

// Screen-reader only text
<span style={a11y.srOnly}>
  Loading...
</span>

// Focus visible styles
<button style={a11y.focusVisible}>
  Click me
</button>

// Reduced motion styles
@media (prefers-reduced-motion: reduce) {
  * {
    animation: none !important;
  }
}
```

## Editor Integration

### Canvas Colors

```typescript
SemanticTokens.canvas = {
  background: '#FFFFFF',           // A4 canvas
  grid: 'rgba(200, 200, 200, 0.1)',      // Grid lines
  selection: '#6699FF',             // Selected element border
  guide: '#6699FF',                 // Alignment guides
  handle: '#6699FF',                // Resize handles
};
```

### Using in Components

```tsx
// Canvas.tsx
import { SemanticTokens } from '@/utils/designTokens';

<style>
  .canvas {
    background-color: ${SemanticTokens.canvas.background};
    grid-template-size: 50px;
    grid-color: ${SemanticTokens.canvas.grid};
  }
</style>
```

## Best Practices

### 1. Use Tokens, Not Hard-coded Values

❌ Bad:
```tsx
<button style={{ backgroundColor: '#6699FF' }}>
```

✅ Good:
```tsx
import { SemanticTokens } from '@/utils/designTokens';

<button style={{ backgroundColor: SemanticTokens.interactive.primary }}>
```

### 2. Prefer Semantic Tokens Over Primitives

❌ Bad:
```tsx
color={PrimitiveTokens.colors.blue[50]}
```

✅ Good:
```tsx
color={SemanticTokens.interactive.primary}
```

### 3. Mobile-First Responsive Design

```tsx
// Mobile styling first
<div style={{ padding: '8px', '@media (min-width: 768px)': { padding: '16px'; } }}>
```

### 4. Use CSS Variables for Dynamic Theming

```tsx
<div style={{ color: `var(--theme-text-primary)` }}>
  Automatically responds to theme changes
</div>
```

### 5. Leverage Component Variants

```tsx
// Instead of conditional inline styles
<ThemedButton variant={isDisabled ? 'disabled' : 'primary'} />

// Components handle variant logic internally
<ThemedButton disabled={isDisabled} />
```

## Adding New Tokens

### 1. Update Primitive Tokens

```typescript
// utils/designTokens.ts
export const PrimitiveTokens = {
  spacing: {
    // ... existing ...
    xxxxl: '64px',  // New token
  },
};
```

### 2. Update Semantic Tokens

```typescript
export const SemanticTokens = {
  // ... existing ...
  myCategory: {
    myToken: PrimitiveTokens.colors.blue[50],
  },
};
```

### 3. Update CSS Variables

```typescript
export const themeCSS = `
  :root {
    --my-category-my-token: #6699FF;
  }
`;
```

## Component Development Checklist

- [ ] Define variant properties
- [ ] Create interface extending component props
- [ ] Use VariantResolver for styles
- [ ] Support all sizes and states
- [ ] Test keyboard navigation
- [ ] Test touch interactions (44px+ targets)
- [ ] Test dark mode
- [ ] Test reduced motion preference
- [ ] Test responsive behavior
- [ ] Document component in Storybook

## Resources

- [Figma Design System Best Practices](https://www.figma.com/design-systems/)
- [Design Tokens](https://www.nngroup.com/articles/design-tokens/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Web Accessibility 101](https://www.udacity.com/course/web-accessibility--ud891)

## Version History

- **1.0.0** - Initial design system with tokens, components, and responsive utilities
  - Primitive tokens (spacing, colors, typography, shadows)
  - Semantic tokens (light/dark mode aware)
  - Component variants (Button, Input, Card)
  - Responsive layout system
  - CSS variables for theming
  - Accessibility built-in

---

**Last Updated**: 2024
**System Version**: 1.0.0
**Author**: Design Systems Team
