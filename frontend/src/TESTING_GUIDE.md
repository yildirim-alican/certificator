# Testing Guide for Certificate Editor v2.0

## Test Categories

### 1. Unit Tests (Component Logic)

**Setup**
```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom jest
npm install --save-dev @testing-library/user-event
```

**Example: Test DraggableItem Momentum**
```typescript
// components/editor/DraggableItem.test.tsx

import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DraggableItem from './DraggableItem';
import { AdvancedPointerSensitivity } from '@/utils/pointerSensitivityAdvanced';

describe('DraggableItem - Momentum Animation', () => {
  it('should apply momentum after drag release', async () => {
    const onDrag = jest.fn();
    const onDragEnd = jest.fn();

    render(
      <DraggableItem
        id="test-element"
        onDrag={onDrag}
        onDragEnd={onDragEnd}
        {...defaultProps}
      >
        Test Element
      </DraggableItem>
    );

    const element = screen.getByText('Test Element');

    // Simulate drag motion
    fireEvent.mouseDown(element, { clientX: 100, clientY: 100 });
    
    // Move mouse quickly (simulate momentum)
    fireEvent.mouseMove(document, { clientX: 150, clientY: 100, buttons: 1 });
    await new Promise(r => setTimeout(r, 30));
    fireEvent.mouseMove(document, { clientX: 200, clientY: 100, buttons: 1 });
    
    fireEvent.mouseUp();

    // Verify momentum frames generated
    expect(onDragEnd).toHaveBeenCalled();
    // onDrag should be called multiple times due to momentum
    expect(onDrag.mock.calls.length).toBeGreaterThan(2);
  });

  it('should respect max velocity clamping', () => {
    const velocity = { x: 25, y: 25 }; // Exceeds 20px/frame
    const damped = AdvancedPointerSensitivity.applyDamping(velocity, 0.88);
    
    // After damping, should be clamped to max 20
    expect(Math.sqrt(damped.x ** 2 + damped.y ** 2)).toBeLessThanOrEqual(20);
  });

  it('should stop momentum when velocity negligible', () => {
    let velocity = { x: 0.5, y: 0.5 };
    
    // Apply damping multiple times
    for (let i = 0; i < 50; i++) {
      velocity = AdvancedPointerSensitivity.applyDamping(velocity, 0.88);
    }
    
    // Should fall below minimum threshold (0.02)
    expect(Math.sqrt(velocity.x ** 2 + velocity.y ** 2)).toBeLessThan(0.02);
  });
});
```

### 2. Integration Tests (Multi-Component)

**Test: Theme Switching**
```typescript
// hooks/useCSSVariables.test.tsx

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider, useCSSVariables } from '@/hooks/useCSSVariables';

function TestComponent() {
  const { theme, toggleTheme } = useCSSVariables();
  
  return (
    <>
      <div data-testid="theme">{theme}</div>
      <button onClick={toggleTheme}>Toggle Theme</button>
    </>
  );
}

describe('Theme Switching', () => {
  it('should switch light to dark mode', async () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    const themeDisplay = screen.getByTestId('theme');
    expect(themeDisplay).toHaveTextContent('light');

    const button = screen.getByText('Toggle Theme');
    await userEvent.click(button);

    await waitFor(() => {
      expect(themeDisplay).toHaveTextContent('dark');
    });
  });

  it('should apply CSS variables on theme change', async () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    const html = document.documentElement;
    const initialBg = getComputedStyle(html).getPropertyValue('--color-background');

    const button = screen.getByText('Toggle Theme');
    await userEvent.click(button);

    await waitFor(() => {
      const newBg = getComputedStyle(html).getPropertyValue('--color-background');
      expect(newBg).not.toBe(initialBg);
    });
  });
});
```

**Test: Collaboration Hooks**
```typescript
// hooks/useRealtimeCollaboration.test.ts

import { renderHook, act } from '@testing-library/react';
import { useCursorBroadcast, useRemoteCursors } from '@/hooks/useRealtimeCollaboration';

describe('useRemoteCursors', () => {
  it('should update remote cursor position', () => {
    const { result } = renderHook(() => useRemoteCursors());

    act(() => {
      result.current.updateRemoteCursor('user-1', {
        userId: 'user-1',
        x: 100,
        y: 200,
        color: '#FF0000',
        label: 'User 1',
      });
    });

    expect(result.current.remoteCursors.has('user-1')).toBe(true);
    const cursor = result.current.remoteCursors.get('user-1');
    expect(cursor?.x).toBe(100);
    expect(cursor?.y).toBe(200);
  });

  it('should remove remote cursor on cleanup', () => {
    const { result } = renderHook(() => useRemoteCursors());

    act(() => {
      result.current.updateRemoteCursor('user-1', {
        userId: 'user-1',
        x: 100,
        y: 200,
        color: '#FF0000',
        label: 'User 1',
      });
    });

    expect(result.current.remoteCursors.has('user-1')).toBe(true);

    act(() => {
      result.current.removeRemoteCursor('user-1');
    });

    expect(result.current.remoteCursors.has('user-1')).toBe(false);
  });
});
```

### 3. E2E Tests (User Workflows)

**Setup**
```bash
npm install --save-dev cypress
npx cypress open
```

**Test: Single User Drag & Momentum**
```typescript
// cypress/e2e/drag-momentum.cy.ts

describe('Drag with Momentum', () => {
  beforeEach(() => {
    cy.visit('/editor/123');
    cy.wait('@loadTemplate');
  });

  it('should show momentum animation after drag release', () => {
    cy.get('[data-draggable="element-1"]').as('element');

    // Start drag
    cy.get('@element')
      .trigger('mousedown', { clientX: 100, clientY: 100 });

    // Move mouse quickly
    cy.get('[data-canvas]').trigger('mousemove', {
      clientX: 200,
      clientY: 100,
      buttons: 1,
    });

    // Record initial position
    let initialX: number;
    cy.get('@element')
      .invoke('css', 'transform')
      .then((transform) => {
        initialX = parseFloat(transform.match(/translate\((\d+)/) || ['0', '0'])[1] as any);
      });

    // Release mouse
    cy.get('@element').trigger('mouseup');

    // Wait for momentum to complete
    cy.wait(500);

    // Verify element moved further due to momentum
    cy.get('@element')
      .invoke('css', 'transform')
      .then((transform) => {
        const finalX = parseFloat(transform.match(/translate\((\d+)/) || ['0', '0'])[1] as any);
        expect(finalX).toBeGreaterThan(initialX);
      });
  });

  it('should snap to grid when dragging', () => {
    cy.get('[data-draggable="element-1"]').as('element');

    // Enable snap to grid
    cy.get('[data-setting="snap-to-grid"]').click();

    cy.get('@element').trigger('mousedown', { clientX: 100, clientY: 100 });
    cy.get('[data-canvas]').trigger('mousemove', {
      clientX: 115, // 5px offset (not multiple of grid)
      clientY: 100,
      buttons: 1,
    });
    cy.get('@element').trigger('mouseup');

    // Verify snapped to nearest grid point (assume 10px grid)
    cy.get('@element')
      .invoke('css', 'transform')
      .should('match', /translate\(120px/); // 120 = 12 * 10px grid
  });
});
```

**Test: Multi-User Collaboration**
```typescript
// cypress/e2e/collaboration.cy.ts

describe('Real-Time Collaboration', () => {
  it('should show remote cursor from other user', () => {
    // Open editor in window 1
    cy.visit('/editor/123');

    // Open same editor in window 2 (simulated)
    cy.request('POST', '/api/subscriptions', {
      templateId: '123',
      userId: 'user-2',
    });

    // Simulate cursor movement from user 2
    cy.request('POST', '/api/cursor-update', {
      templateId: '123',
      userId: 'user-2',
      x: 200,
      y: 300,
    });

    // Verify remote cursor visible
    cy.get('[data-cursor="user-2"]').should('be.visible');
    cy.get('[data-cursor-label="user-2"]').should('contain', 'User-2');
  });

  it('should sync element updates between users', () => {
    cy.visit('/editor/123');

    // Simulate element update from other user
    cy.request('PATCH', '/api/templates/123/elements/elem-1', {
      x: 500,
      y: 600,
    });

    // Verify element position updated
    cy.get('[data-draggable="elem-1"]')
      .invoke('css', 'left')
      .should('contain', '500');
  });

  it('should handle offline and reconnection', () => {
    cy.visit('/editor/123');

    // Simulate network disconnect
    cy.intercept('POST', '/api/**', { forceNetworkError: true });

    // User tries to drag element
    cy.get('[data-draggable="element-1"]').trigger('mousedown');
    cy.get('[data-canvas]').trigger('mousemove', {
      clientX: 200,
      clientY: 200,
      buttons: 1,
    });

    // Should show offline indicator
    cy.get('[data-status="offline"]').should('be.visible');

    // Restore connection
    cy.intercept('POST', '/api/**', { statusCode: 200, body: {} });

    // Should show reconnecting, then reconnected
    cy.get('[data-status="connecting"]').should('be.visible');
    cy.wait(2000);
    cy.get('[data-status="online"]').should('be.visible');
  });
});
```

### 4. Performance Tests

**Lighthouse CI**
```bash
npm install --save-dev @lhci/cli@0.8.x @lhci/server
npx lhci autorun

# Configuration: lighthouserc.json
{
  "ci": {
    "collect": {
      "numberOfRuns": 3,
      "url": ["http://localhost:3000/editor/123"],
      "settings": {
        "configPath": "./lighthouse-config.js"
      }
    },
    "assert": {
      "preset": "lighthouse:recommended",
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.9 }],
        "first-contentful-paint": ["error", { "maxNumericValue": 1800 }],
        "speed-index": ["error", { "maxNumericValue": 3000 }]
      }
    }
  }
}
```

**Custom Performance Test**
```typescript
// __tests__/performance.test.ts

import { performance } from 'perf_hooks';

describe('Performance Benchmarks', () => {
  it('should complete 100 element drags in < 5 seconds', () => {
    const start = performance.now();

    for (let i = 0; i < 100; i++) {
      // Simulate drag
      simulateDrag(i, 0, 50, 0);
    }

    const duration = performance.now() - start;
    expect(duration).toBeLessThan(5000);
  });

  it('should maintain 60fps momentum animation', () => {
    const frameTimings = [];
    let lastTime = performance.now();

    for (let i = 0; i < 60; i++) { // 1 second at 60fps
      const now = performance.now();
      const frameTime = now - lastTime;
      frameTimings.push(frameTime);
      lastTime = now;
      
      // Simulate frame work
      simulateMomentumFrame(i);
    }

    // Check 95% of frames are < 16.67ms (1000/60)
    const slowFrames = frameTimings.filter(t => t > 16.67).length;
    expect(slowFrames / frameTimings.length).toBeLessThan(0.05);
  });
});
```

### 5. Accessibility Tests

```typescript
// __tests__/accessibility.test.tsx

import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

describe('Accessibility', () => {
  it('should have no axe violations in Canvas', async () => {
    const { container } = render(<Canvas />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have proper aria labels', () => {
    const { getByRole } = render(<ThemedButton>Click me</ThemedButton>);
    const button = getByRole('button');
    expect(button).toHaveAccessibleName('Click me');
  });

  it('should have sufficient color contrast', async () => {
    const { container } = render(<ThemeProvider theme="light"><Button /></ThemeProvider>);
    const results = await axe(container, {
      rules: { 'color-contrast': { enabled: true } },
    });
    expect(results).toHaveNoViolations();
  });

  it('focus outline should be visible', () => {
    const { getByRole } = render(<ThemedButton>Click</ThemedButton>);
    const button = getByRole('button');
    
    button.focus();
    const styles = window.getComputedStyle(button);
    const outline = styles.getPropertyValue('outline');
    
    expect(outline).not.toBe('none');
  });
});
```

### 6. Manual Test Checklist

**Drag & Drop**
- [ ] Drag element starts within 4px threshold
- [ ] Drag is smooth (no jank, 60fps)
- [ ] Momentum continues for ~500ms after release
- [ ] Drag can be reversed (momentum backward)
- [ ] Multiple elements can be dragged independently
- [ ] Velocity increases with faster movement

**Theme & Design System**
- [ ] Light mode loads on page open
- [ ] Dark mode toggle works instantly
- [ ] CSS variables update without flicker
- [ ] All components respect theme colors
- [ ] Text contrast passes WCAG AA
- [ ] Touch targets minimum 44px

**Collaboration**
- [ ] Remote cursor appears within 100ms
- [ ] Remote element updates sync smoothly
- [ ] Cursor labels show correct user names
- [ ] Active user list updates correctly
- [ ] Offline indicator appears on disconnect
- [ ] Reconnection happens automatically

**Undo/Redo**
- [ ] Ctrl+Z undoes last action
- [ ] Ctrl+Shift+Z redoes action
- [ ] Undo/redo history persists for 50 entries
- [ ] Cleared on new action after undo
- [ ] Works across multi-user edits

**Responsive**
- [ ] Mobile (320px): All elements accessible
- [ ] Tablet (768px): Canvas scales correctly
- [ ] Desktop (1024px): Full UI visible
- [ ] Desktop+ (1440px): Proper spacing

### 7. Test Coverage Goals

```json
{
  "coverage": {
    "branches": 80,
    "functions": 85,
    "lines": 85,
    "statements": 85
  }
}
```

### 8. Running Tests

```bash
# Unit tests
npm test

# Watch mode
npm test -- --watch

# With coverage
npm test -- --coverage

# E2E tests
npm run cy:open

# Lighthouse
npm run lighthouse

# All tests
npm run test:all
```

## Continuous Integration

```yaml
# .github/workflows/test.yml
name: Test & Build

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - run: npm ci
      - run: npm run type-check
      - run: npm run lint
      - run: npm test -- --coverage
      - run: npm run build
      
      - uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
```

