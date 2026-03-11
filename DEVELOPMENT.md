# Certificator Development Guide

## Table of Contents
1. [Local Development Setup](#local-development-setup)
2. [Project Structure](#project-structure)
3. [Technology Stack](#technology-stack)
4. [Development Workflow](#development-workflow)
5. [Code Style & Standards](#code-style--standards)
6. [Testing & Debugging](#testing--debugging)
7. [Building & Deployment](#building--deployment)
8. [Contributing Guidelines](#contributing-guidelines)
9. [Common Issues & Solutions](#common-issues--solutions)
10. [Performance Tips](#performance-tips)

---

## Local Development Setup

### Prerequisites
- **Node.js**: v18.17.0 or higher ([download](https://nodejs.org))
- **npm**: v9.0.0 or higher (included with Node.js)
- **Git**: Latest version ([download](https://git-scm.com))
- **IDE**: VS Code recommended ([download](https://code.visualstudio.com))

### Initial Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yildirim-alican/certificator.git
   cd certificator
   ```

2. **Install frontend dependencies**
   ```bash
   cd frontend
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:3000`

### VS Code Extensions (Recommended)

For an optimal development experience, install these extensions:

- **ES7+ React/Redux/React-Native snippets** (`dsznajder.es7-react-js-snippets`)
- **Tailwind CSS IntelliSense** (`bradlc.vscode-tailwindcss`)
- **TypeScript Vue Plugin** (`Vue.vscode-typescript-vue-plugin`)
- **Prettier - Code formatter** (`esbenp.prettier-vscode`)
- **ESLint** (`dbaeumer.vscode-eslint`)
- **Thunder Client** or **REST Client** for API testing

### Environment Variables

Create `.env.local` in the `frontend` directory if needed:

```env
# Example configuration (defaults are usually sufficient)
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_ENVIRONMENT=development
```

---

## Project Structure

```
certificator/
├── frontend/                    # Next.js 14 application
│   ├── src/
│   │   ├── app/                 # Next.js App Router
│   │   │   ├── layout.tsx       # Root layout with ClientLayoutWrapper
│   │   │   ├── page.tsx         # Home/dashboard page
│   │   │   ├── create/          # Template creation flow
│   │   │   ├── editor/          # Canvas editor ([id] route)
│   │   │   ├── bulk-generate/   # Bulk certificate generation
│   │   │   └── ClientLayoutWrapper.tsx  # Toast provider wrapper
│   │   │
│   │   ├── components/          # React components
│   │   │   ├── common/          # Shared UI components
│   │   │   │   └── ToastContainer.tsx   # Toast notification UI
│   │   │   ├── editor/          # Editor-specific components
│   │   │   │   ├── Canvas.tsx   # Main canvas renderer
│   │   │   │   ├── LayerPanel.tsx       # Layer management
│   │   │   │   ├── SystemLayoutPicker.tsx # Logo & template selection
│   │   │   │   └── PropertiesPanel.tsx  # Element properties
│   │   │   ├── dashboard/       # Dashboard components
│   │   │   ├── excel/           # Excel parsing UI
│   │   │   ├── shared/          # Shared layouts
│   │   │   └── ui/              # Base UI elements
│   │   │
│   │   ├── hooks/               # Custom React hooks
│   │   │   ├── useApi.ts        # API communication
│   │   │   ├── useCanvasScale.ts # Canvas zoom/pan
│   │   │   ├── usePrinter.ts    # PDF/ZIP export
│   │   │   ├── useExcelParser.ts # Excel data parsing
│   │   │   ├── useRealtimeCollaboration.ts # Collab (planned)
│   │   │   └── ...others
│   │   │
│   │   ├── store/               # Zustand state management
│   │   │   ├── useEditorStore.ts  # Canvas & element state
│   │   │   ├── useTemplateStore.ts # Template data
│   │   │   ├── useAuthStore.ts    # Auth state (planned)
│   │   │   └── useToastStore.ts   # Toast notifications
│   │   │
│   │   ├── styles/              # Global styles
│   │   │   ├── globals.css      # Tailwind setup
│   │   │   └── theme.ts         # Design tokens
│   │   │
│   │   ├── types/               # TypeScript definitions
│   │   │   ├── CertificateTemplate.d.ts
│   │   │   └── ...
│   │   │
│   │   ├── utils/               # Utility functions
│   │   │   ├── htmlGenerator.ts # HTML render
│   │   │   ├── guideCalculations.ts # Snap guides
│   │   │   ├── pointerSensitivity.ts # Event handling
│   │   │   └── ...
│   │   │
│   │   └── lib/                 # External library configs
│   │       └── premiumTemplates.ts
│   │
│   ├── package.json             # npm dependencies
│   ├── tailwind.config.ts       # Tailwind CSS config
│   ├── tsconfig.json            # TypeScript config
│   └── next.config.js           # Next.js config
│
├── backend/                     # (Python Flask - deprecated in v2.0)
│   └── [legacy code - not maintained]
│
└── scripts/                     # Utility scripts
    ├── create-shortcut-safe.ps1 # Windows launcher
    └── start-dev.bat
```

### Key Directories

| Directory | Purpose | Notes |
|-----------|---------|-------|
| `src/app` | Next.js routes | App Router structure |
| `src/components` | React components | Organized by feature |
| `src/hooks` | Custom hooks | Reusable logic |
| `src/store` | State management | Zustand stores |
| `src/utils` | Helper functions | Canvas, PDF, Excel utilities |
| `src/types` | TypeScript definitions | Centralized type definitions |

---

## Technology Stack

### Frontend Framework
- **Next.js**: 14.2.35 (React framework)
- **React**: 18.3.1 (UI library)
- **TypeScript**: 5.4.4 (Type safety)

### State Management
- **Zustand**: 4.4.1 (Global state)

### Styling
- **Tailwind CSS**: 3.3 (Utility-first CSS)
- **PostCSS**: 8.4.38

### Canvas & Export
- **html2canvas**: 1.4.1 (HTML to image)
- **jsPDF**: 2.5.1 (PDF generation)

### Data Processing
- **xlsx**: 0.18.5 (Excel parsing)
- **JSZip**: 3.10.1 (ZIP creation)

### Development Tools
- **ESLint**: 8.57.0 (Linting)
- **Prettier**: 3.3.3 (Code formatting)

### Package Management
- **npm**: 9.0.0+

---

## Development Workflow

### Daily Development

1. **Start the dev server**
   ```bash
   cd frontend
   npm run dev
   ```

2. **Open the app**
   ```
   http://localhost:3000
   ```

3. **Edit files**
   - Next.js supports fast refresh
   - Changes appear instantly in browser
   - TypeScript errors show in terminal

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make changes and test
npm run build  # Verify build succeeds
npm run lint   # Check code style

# Commit with conventional commits
git commit -m "feat: Brief description of changes"
# Other types: fix, docs, style, refactor, perf, test

# Push and create Pull Request
git push origin feature/your-feature-name
```

### Conventional Commits Format

Use this format for commit messages:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code style (formatting, semicolons)
- `refactor`: Code refactoring
- `perf`: Performance improvement
- `test`: Test changes
- `chore`: Build, deps, tooling

**Examples:**
```
feat(editor): Add snap-to-grid functionality
fix(canvas): Resolve zoom calculation bug
docs: Update installation instructions
refactor(store): Simplify useEditorStore logic
```

---

## Code Style & Standards

### TypeScript

1. **Strict Mode Enabled**
   - No `any` types unless absolutely necessary (use `// @ts-ignore` with comment)
   - All functions have explicit return types
   - All props interfaces are defined

2. **File Naming**
   - Components: `PascalCase` (e.g., `Canvas.tsx`)
   - Utilities: `camelCase` (e.g., `htmlGenerator.ts`)
   - Types: `PascalCase` with `.d.ts` (e.g., `CertificateTemplate.d.ts`)
   - Hooks: `camelCase` starting with `use` (e.g., `useCanvasScale.ts`)

3. **Component Structure**
   ```typescript
   'use client';  // if client component
   
   import { useState } from 'react';
   import type { FC } from 'react';
   
   interface MyComponentProps {
     title: string;
     onClose?: () => void;
   }
   
   const MyComponent: FC<MyComponentProps> = ({ title, onClose }) => {
     const [state, setState] = useState(false);
     
     return <div>{title}</div>;
   };
   
   export default MyComponent;
   ```

### Tailwind CSS

1. **Class Naming**
   - Use Tailwind utilities (don't create custom CSS)
   - Keep classes in template literals or @apply blocks
   - Avoid arbitrary values when Tailwind has the value

2. **Responsive Design**
   ```tsx
   <div className="w-full md:w-1/2 lg:w-1/3">
     {/* Mobile first approach */}
   </div>
   ```

### Imports Organization

```typescript
// 1. React & Next.js
import { useState } from 'react';

// 2. External libraries
import { create } from 'zustand';

// 3. Local components
import Canvas from '@/components/editor/Canvas';

// 4. Local utilities
import { generatePDF } from '@/utils/htmlGenerator';

// 5. Local types
import type { CertificateTemplate } from '@/types/CertificateTemplate';

// 6. Constants
const CANVAS_WIDTH = 1000;
```

### Comments & Documentation

```typescript
/**
 * Handles canvas element selection with multi-select support
 * @param elementId - The ID of the element to select
 * @param isMultiSelect - Whether to add to existing selection
 * @returns void
 */
export function handleSelectElement(
  elementId: string,
  isMultiSelect: boolean
): void {
  // ...
}

// TODO: Optimize this with memoization
// HACK: Temporary workaround for zoom bug
// NOTE: This must happen before canvas render
```

---

## Testing & Debugging

### Browser DevTools

1. **React Developer Tools**
   - Inspect component hierarchy
   - Change props live
   - View Zustand state

   Install: [React DevTools extension](https://react-devtools-tutorial.vercel.app/)

2. **Next.js DevTools**
   - View built pages
   - Check source maps

### Console Debugging

```typescript
// Log component renders
console.log('Component mounted');

// Log state changes
const editorStore = useEditorStore();
console.log('Selected elements:', editorStore.selectedElements);

// Use debugger statement
debugger;  // Pauses execution when dev tools open
```

### Performance Debugging

1. **React Profiler**
   - React DevTools → Profiler tab
   - Record and identify slow renders
   - Check component render times

2. **Network Tab**
   - Check asset loading
   - Verify no unnecessary requests
   - Monitor bundle size

### Common Debug Scenarios

**Issue: Component not re-rendering**
- Check if properly wrapped with `'use client'`
- Verify Zustand state subscription
- Check for incorrect dependencies in hooks

**Issue: Hydration mismatch**
- Wrap dynamic content in `<Suspense>`
- Use `typeof window !== 'undefined'` checks
- Use `use client` on client-side components

**Issue: Slow canvas performance**
- Check canvas resolution (DPI settings)
- Profile with React DevTools
- Look for unnecessary re-renders
- Check element count limitations

---

## Building & Deployment

### Local Build

```bash
cd frontend
npm run build
```

This creates an optimized production build in `.next/` directory.

### Build Verification

```bash
# After building, verify it works
npm run dev  # Should serve from .next/
```

Press Ctrl+C to stop the server.

### Production Build Output

Expected output after successful build:
```
✓ Compiled successfully
✓ Pages generated: 6/6
✓ Static assets deployed
✓ Zero TypeScript errors
```

### Deployment Checklist

- [ ] All tests pass: `npm run test` (when available)
- [ ] Build succeeds: `npm run build`
- [ ] No TypeScript errors: `npm run type-check`
- [ ] ESLint passes: `npm run lint`
- [ ] No console errors in dev tools
- [ ] PDF export works on all templates
- [ ] Bulk operations complete successfully
- [ ] All features work in production mode: `npm run dev`

---

## Contributing Guidelines

### Before Creating a PR

1. **Fork the repository** (if external contributor)
2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature
   ```
3. **Make your changes**
4. **Test thoroughly**
   ```bash
   npm run build
   npm run dev
   npm run lint
   ```
5. **Update documentation** if needed
6. **Commit with clear messages**

### PR Guidelines

1. **Title**: Brief, descriptive
   - Good: "Add snap-to-grid guide lines in canvas editor"
   - Bad: "fixed stuff"

2. **Description**: Include
   - What changed and why
   - How to test
   - Screenshots for UI changes
   - Related issue numbers (#123)

3. **Code Review Expectations**
   - Your code should follow project standards
   - Tests should pass
   - TypeScript strict mode must pass
   - Commits should be clear and logical

### Adding New Features

1. **Plan Architecture**
   - Where will state live?
   - Which components need changes?
   - Any new types needed?

2. **Create types first** (TDD approach)
   ```typescript
   // types/NewFeature.d.ts
   export interface NewFeature {
     id: string;
     enabled: boolean;
   }
   ```

3. **Update state** if needed
   ```typescript
   // In useEditorStore.ts
   interface EditorState {
     newFeature: NewFeature;
     setNewFeature: (feature: NewFeature) => void;
   }
   ```

4. **Build components** incrementally
5. **Add to UI** as needed
6. **Test thoroughly** before submitting PR

### Updating Documentation

When making significant changes:

1. Update relevant `.md` files
2. Update CHANGELOG (when available)
3. Update USER_MANUAL_EN.md and USER_MANUAL_TR.md if user-facing
4. Add code comments for complex logic

---

## Common Issues & Solutions

### Issue: Build Fails with TypeScript Errors

**Solution:**
```bash
# Check for type errors
npm run type-check

# Fix errors in the reported files
# Common: Missing types, wrong prop types
```

### Issue: npm run dev Shows Blank Page

**Solution:**
```bash
# Clear Next.js cache
rm -r .next

# Reinstall dependencies
rm -r node_modules
npm install

# Try again
npm run dev
```

### Issue: Hydration Mismatch Errors

**Solution:**
- These occur when server and client render differently
- Wrap dynamic content in `<Suspense fallback>`
- Use `'use client'` directive
- Check for browser-only APIs (localStorage, window)

### Issue: PDF Export Produces Blank PDF

**Solution:**
- Verify canvas has content and is visible
- Check element visibility (z-index, opacity)
- Verify html2canvas settings in `usePrinter.ts`
- Test with smaller canvas first
- Check canvas resolution (DPI): 150 is default

### Issue: Slow Performance on Large Canvases

**Solution:**
```typescript
// Limit element count in one canvas
// Split into multiple sheets if needed

// Reduce element complexity
// Use simpler shapes instead of nested groups

// Optimize images
// Use compressed images under 100KB each

// Check DevTools Performance tab
// Look for long rendering times
```

### Issue: Excel Bulk Import Not Working

**Solution:**
- Verify Excel file format (.xlsx or .xls)
- Check column headers match exactly
- Ensure data is in rows, not columns
- Verify no empty rows between data
- Test with sample file first

---

## Performance Tips

### Canvas Rendering

1. **Limit concurrent renders**
   - Keep element count reasonable (< 50 recommended)
   - Use layers to organize elements
   - Consider split sheets for 100+ items

2. **Optimize images**
   ```typescript
   // Before uploading
   // - Compress to < 200KB
   // - Use PNG/JPG, avoid BMP
   // - Resize to actual needed dimensions
   ```

3. **Cache computed values**
   ```typescript
   // Use useMemo for expensive calculations
   const computedGuides = useMemo(() => {
     return calculateGuides(elements);
   }, [elements]);
   ```

### Bundle Size

1. **Monitor bundle**
   ```bash
   npm run build
   # Check output for bundle size
   ```

2. **Code splitting** is automatic with Next.js
   - Each route is a separate bundle
   - Only used code is loaded

3. **Avoid large libraries**
   - Consider if needed before adding
   - Look for smaller alternatives

### State Management

1. **Don't store unnecessary data**
   - Keep only essential state in Zustand
   - Compute derived values on the fly
   - Clear unused selections regularly

2. **Use store selectors**
   ```typescript
   // Instead of
   const store = useEditorStore();
   
   // Use
   const selectedElements = useEditorStore(
     (state) => state.selectedElements
   );
   ```

### Next.js Optimization

1. **Use Image component**
   ```typescript
   import Image from 'next/image';
   
   // Optimizes loading and sizing
   <Image src="/logo.png" alt="Logo" width={100} height={100} />
   ```

2. **Dynamic imports**
   ```typescript
   // Code-split heavy components
   const HeavyComponent = dynamic(
     () => import('@/components/Heavy'),
     { loading: () => <LoadingSkeleton /> }
   );
   ```

3. **Lazy image loading**
   - Use `loading="lazy"` on images
   - Critical images load eagerly

---

## Quick Command Reference

```bash
# Development
npm run dev           # Start dev server
npm run build         # Create production build
npm run lint          # Check code style (ESLint)
npm run type-check    # Verify TypeScript types

# Cleaning
rm -r .next          # Clear build cache
rm -r node_modules   # Force reinstall dependencies
npm install          # Install/reinstall

# Git
git status           # Check changes
git add .            # Stage all changes
git commit -m "..."  # Commit changes
git push             # Push to remote
```

---

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [MDN Web Docs](https://developer.mozilla.org) for Canvas API

---

## Getting Help

1. **Check existing issues** on GitHub
2. **Search documentation** in this repo
3. **Ask in discussions** (if available)
4. **Create a detailed issue** with:
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details (Node version, OS)
   - Screenshots/logs if applicable

---

*Last Updated: March 11, 2026*
*For v2.0 and beyond*
