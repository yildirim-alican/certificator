# Certificator Canvas & Editor Mechanics Guide

## Table of Contents

1. [Canvas Overview](#canvas-overview)
2. [Coordinate Systems](#coordinate-systems)
3. [Transformation Matrix](#transformation-matrix)
4. [Event Handling](#event-handling)
5. [Element Manipulation](#element-manipulation)
6. [Guide System](#guide-system)
7. [Selection & Multi-Select](#selection--multi-select)
8. [Keyboard Shortcuts](#keyboard-shortcuts)
9. [Advanced Operations](#advanced-operations)
10. [Performance Optimization](#performance-optimization)
11. [Debugging Canvas](#debugging-canvas)

---

## Canvas Overview

### Canvas Structure

The Certificator editor uses an HTML5 Canvas element to render certificates in real-time:

```
┌─────────────────────────────────────────┐
│     Browser Window (Viewport)           │
├─────────────────────────────────────────┤
│                                         │
│  ┌──────────────────────────────────┐   │
│  │   Canvas Container               │   │
│  │  (with scroll & pan controls)    │   │
│  │                                  │   │
│  │  ┌─────────────────────────────┐ │   │
│  │  │  Canvas Element             │ │   │
│  │  │  (width: 1000, height: 600) │ │   │
│  │  │                             │ │   │
│  │  │ ┌───────────────────────┐   │ │   │
│  │  │ │ Certificate Content   │   │ │   │
│  │  │ │ (rendered elements)   │   │ │   │
│  │  │ └───────────────────────┘   │ │   │
│  │  │                             │ │   │
│  │  └─────────────────────────────┘ │   │
│  │                                  │   │
│  └──────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

### Canvas Properties

```typescript
interface CanvasState {
  // Canvas dimensions (A4 landscape default)
  width: number;          // 1000 pixels
  height: number;         // 600 pixels
  dpi: number;           // 150 (for export)
  
  // Viewport state
  zoomLevel: number;      // 1.0 = 100%
  panX: number;          // Horizontal pan in pixels
  panY: number;          // Vertical pan in pixels
  
  // Background
  backgroundColor: string; // Usually white (#ffffff)
  gridEnabled: boolean;   // Snap-to-grid
  gridSize: number;       // Default 20 pixels
  
  // Guides
  smartGuidesEnabled: boolean;
  selectedGuidesVisible: boolean;
}
```

### Canvas Rendering Loop

```typescript
// src/components/editor/Canvas.tsx
function Canvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Render effect runs whenever state changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d')!;
    
    // Clear canvas
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Apply viewport transformation
    renderFrame(ctx);
  }, [elements, zoomLevel, panX, panY, selectedIds]);
}

function renderFrame(ctx: CanvasRenderingContext2D) {
  // 1. Save context state
  ctx.save();
  
  // 2. Apply viewport transformation
  ctx.translate(panX, panY);
  ctx.scale(zoomLevel, zoomLevel);
  
  // 3. Render all elements in z-order
  elements.sort((a, b) => a.zIndex - b.zIndex);
  elements.forEach(element => {
    renderElement(ctx, element);
  });
  
  // 4. Render guides (if dragging)
  if (draggingElement) {
    renderSmartGuides(ctx, draggingElement);
  }
  
  // 5. Render selection boxes
  selectedIds.forEach(id => {
    const element = elements.find(e => e.id === id);
    if (element) renderSelectionBox(ctx, element);
  });
  
  // 6. Restore context state
  ctx.restore();
}
```

---

## Coordinate Systems

### Three Coordinate Systems

Certificator uses three different but related coordinate systems:

#### 1. Canvas Coordinate System

**Definition:** The logical coordinate system of the certificate itself.

**Origin:** Top-left corner (0, 0)  
**Units:** Pixels (1000×600 for A4 landscape)  
**Bounds:** (0, 0) to (1000, 600)

**Used for:**
- Element positions (x, y properties)
- Element dimensions (width, height)
- Rendering calculations
- Export to PDF

**Example:**
```typescript
// Text element at center of certificate
const textElement = {
  type: 'text',
  x: 500,      // Center horizontally
  y: 300,      // Center vertically
  width: 400,
  height: 100,
  content: 'Certificate of Achievement'
};
```

#### 2. View Coordinate System

**Definition:** The visible viewport where the user sees the certificate.

**Origin:** Top-left corner of browser canvas element  
**Units:** Pixels (varies with canvas size)  
**Bounds:** (0, 0) to (canvasWidth, canvasHeight)

**Used for:**
- Mouse events (clientX, clientY)
- Canvas rendering context
- Visual feedback to user
- Zoom and pan calculations

**Example:**
```
User clicks on canvas at view coordinates (150, 150)
↓ This might correspond to canvas coordinate (100, 100)
↓ Depending on zoom level (1.5x) and pan offset (25, 25)
```

#### 3. Screen Coordinate System

**Definition:** The actual browser window pixel coordinates.

**Origin:** Top-left of browser window  
**Units:** Pixels  
**Bounds:** Entire screen

**Used for:**
- Mouse events (screenX, screenY)
- Touch events
- Window layout calculations

**Relationship:**
```
Screen Coords ← (browser offset) ← View Coords ← (viewport transform) ← Canvas Coords
```

### Coordinate Conversion

Converting between coordinate systems is fundamental to editor mechanics:

```typescript
// Convert from view coordinates to canvas coordinates
function viewToCanvasCoords(
  viewX: number,
  viewY: number,
  panX: number,
  panY: number,
  zoomLevel: number
): { x: number; y: number } {
  // Step 1: Subtract pan offset
  const unPannedX = viewX - panX;
  const unPannedY = viewY - panY;
  
  // Step 2: Scale by 1/zoomLevel (inverse of zoom)
  const canvasX = unPannedX / zoomLevel;
  const canvasY = unPannedY / zoomLevel;
  
  return { x: canvasX, y: canvasY };
}

// Example:
// User clicks at view (200, 200)
// Pan is at (50, 50), zoom is 2.0
const canvasCoords = viewToCanvasCoords(200, 200, 50, 50, 2.0);
// Result: { x: 75, y: 75 }
// Calculation: (200 - 50) / 2.0 = 75, (200 - 50) / 2.0 = 75
```

```typescript
// Convert from canvas coordinates to view coordinates
function canvasToViewCoords(
  canvasX: number,
  canvasY: number,
  panX: number,
  panY: number,
  zoomLevel: number
): { x: number; y: number } {
  // Step 1: Scale by zoom level
  const zoomedX = canvasX * zoomLevel;
  const zoomedY = canvasY * zoomLevel;
  
  // Step 2: Add pan offset
  const viewX = zoomedX + panX;
  const viewY = zoomedY + panY;
  
  return { x: viewX, y: viewY };
}

// Example:
// Canvas coordinate (100, 100)
// Pan is at (50, 50), zoom is 2.0
const viewCoords = canvasToViewCoords(100, 100, 50, 50, 2.0);
// Result: { x: 250, y: 250 }
// Calculation: (100 * 2.0) + 50 = 250, (100 * 2.0) + 50 = 250
```

---

## Transformation Matrix

### What is a Transformation Matrix?

A transformation matrix is a 3×3 matrix that represents:
- Translation (pan/offset)
- Scaling (zoom)
- Rotation (for future use)

### Canvas Transformation API

```typescript
const ctx = canvas.getContext('2d')!;

// Save the current transformation state
ctx.save();

// Apply transformations
ctx.translate(panX, panY);    // Move origin to pan position
ctx.scale(zoomLevel, zoomLevel); // Scale for zoom

// All subsequent draws use this transformation
ctx.fillRect(100, 100, 50, 50);  // Rendered at transformed coords

// Restore previous transformation
ctx.restore();
```

### How It Works

**Step 1: Identity Matrix**
```
┌─────────────────┐
│ 1 0 0 │
│ 0 1 0 │     All points unchanged
│ 0 0 1 │
└─────────────────┘
```

**Step 2: After translate(panX, panY)**
```
┌──────────────────┐
│ 1 0 panX │
│ 0 1 panY │     (x, y) → (x + panX, y + panY)
│ 0 0 1    │
└──────────────────┘
```

**Step 3: After scale(zoom, zoom)**
```
┌──────────────────────┐
│ zoom 0    panX │
│ 0    zoom panY │     (x, y) → (x·zoom + panX, y·zoom + panY)
│ 0    0    1    │
└──────────────────────┘
```

### Applied Transformations

```typescript
// Canvas rendering code
function renderCanvas(ctx: CanvasRenderingContext2D) {
  // Save initial transformation
  ctx.save();
  
  // Apply viewport transformation
  ctx.translate(panX, panY);
  ctx.scale(zoomLevel, zoomLevel);
  
  // Now all coordinates are in canvas space
  // Element at canvas (500, 300) with zoom 1.5 and pan (100, 100)
  // Will be drawn at view: (100 + 500*1.5, 100 + 300*1.5) = (850, 550)
  
  // Draw elements
  elements.forEach(el => {
    ctx.save();
    
    // Apply element transformation
    ctx.translate(el.x, el.y);
    ctx.rotate((el.rotation * Math.PI) / 180);
    ctx.translate(-el.width / 2, -el.height / 2);
    
    // Draw element content
    ctx.fillRect(0, 0, el.width, el.height);
    
    ctx.restore();
  });
  
  ctx.restore();
}
```

### Inverse Transformation

For mouse event handling, you need the inverse transformation:

```typescript
function getPointOnCanvas(
  event: MouseEvent,
  canvas: HTMLCanvasElement,
  panX: number,
  panY: number,
  zoomLevel: number
): { x: number; y: number } {
  // Get mouse position relative to canvas
  const rect = canvas.getBoundingClientRect();
  const viewX = event.clientX - rect.left;
  const viewY = event.clientY - rect.top;
  
  // Apply inverse transformation
  // view_coords = pan + zoom * canvas_coords
  // canvas_coords = (view_coords - pan) / zoom
  
  const canvasX = (viewX - panX) / zoomLevel;
  const canvasY = (viewY - panY) / zoomLevel;
  
  return { x: canvasX, y: canvasY };
}
```

---

## Event Handling

### Pointer Events

Certificator uses pointer events (instead of mouse/touch separately):

```typescript
// src/utils/pointerSensitivity.ts
interface PointerState {
  x: number;
  y: number;
  canvasX: number;
  canvasY: number;
  isDown: boolean;
  isDragging: boolean;
  dragStartX?: number;
  dragStartY?: number;
}

interface PointerEvent {
  type: 'down' | 'move' | 'up';
  pointer: PointerState;
}
```

### Event Flow

```typescript
// Mouse down: Start potential drag
canvas.addEventListener('pointerdown', (e: PointerEvent) => {
  const { canvasX, canvasY } = getPointOnCanvas(e);
  
  // Check if clicking on an element
  const element = getElementAtPoint(canvasX, canvasY);
  
  if (element) {
    // Start dragging
    setDraggingElement(element.id);
    setDragStart({ x: canvasX, y: canvasY });
  } else {
    // Deselect all
    clearSelection();
  }
});

// Mouse move: Drag element
canvas.addEventListener('pointermove', (e: PointerEvent) => {
  const { canvasX, canvasY } = getPointOnCanvas(e);
  
  if (draggingElement) {
    const deltaX = canvasX - dragStart.x;
    const deltaY = canvasY - dragStart.y;
    
    // Update element position
    updateElement(draggingElement.id, {
      x: draggingElement.x + deltaX,
      y: draggingElement.y + deltaY,
    });
    
    // Calculate and show smart guides
    const guides = calculateSmartGuides(element, allElements);
    setActiveGuides(guides);
  }
});

// Mouse up: End drag
canvas.addEventListener('pointerup', (e: PointerEvent) => {
  if (draggingElement) {
    // Snap to guides if enabled
    if (smartGuidesEnabled) {
      snapToGuide(draggingElement);
    }
    
    // Store in history for undo
    recordSnapshot();
    
    setDraggingElement(null);
  }
});
```

### Pointer Sensitivity

Different users have different needs. Certificator supports adjustable pointer sensitivity:

```typescript
// src/utils/pointerSensitivity.ts
interface PointerConfig {
  dragThreshold: number;      // Pixels before drag starts (default: 5)
  snapThreshold: number;      // Pixels for snap-to-guide (default: 8)
  hoverThreshold: number;     // Pixels for hover detection (default: 10)
  debounceMove: number;       // ms to debounce move events (default: 16)
}

// Detect drag vs click
let isDragging = false;
let dragDistance = 0;

canvas.addEventListener('pointermove', (e) => {
  dragDistance += Math.sqrt(
    Math.pow(e.x - lastX, 2) + Math.pow(e.y - lastY, 2)
  );
  
  if (dragDistance > config.dragThreshold) {
    isDragging = true;
  }
  
  lastX = e.x;
  lastY = e.y;
});
```

---

## Element Manipulation

### Selection

**Single Selection:**
```typescript
// Click on element to select
function selectElement(elementId: string) {
  setSelectedElementIds([elementId]);
}

// Visual feedback
function renderSelectionBox(ctx: CanvasRenderingContext2D, element: Element) {
  ctx.strokeStyle = '#0066cc';           // Blue border
  ctx.lineWidth = 2 / zoomLevel;         // Scale with zoom
  ctx.setLineDash([4 / zoomLevel, 4 / zoomLevel]); // Dashed line
  
  // Draw bounding box
  ctx.strokeRect(
    element.x - 5 / zoomLevel,
    element.y - 5 / zoomLevel,
    element.width + 10 / zoomLevel,
    element.height + 10 / zoomLevel
  );
  
  // Draw resize handles
  drawResizeHandles(ctx, element);
  
  ctx.setLineDash([]);
}
```

**Multi-Selection:**
```typescript
// Shift+Click to add to selection
function selectElement(elementId: string, multiSelect: boolean = false) {
  if (multiSelect) {
    // Add or remove from selection
    setSelectedElementIds(prev =>
      prev.includes(elementId)
        ? prev.filter(id => id !== elementId)
        : [...prev, elementId]
    );
  } else {
    // Replace selection
    setSelectedElementIds([elementId]);
  }
}

// Selection box (drag to select multiple)
function renderSelectionBoxes(ctx: CanvasRenderingContext2D) {
  selectedElementIds.forEach(id => {
    const element = elements.find(e => e.id === id);
    if (element) {
      renderSelectionBox(ctx, element);
    }
  });
}
```

### Dragging

**Basic Drag:**
```typescript
function handleElementDrag(element: Element, deltaX: number, deltaY: number) {
  // Simple position update
  return {
    ...element,
    x: element.x + deltaX,
    y: element.y + deltaY,
  };
}
```

**Constrained Drag (Horizontal/Vertical):**
```typescript
function handleConstrainedDrag(
  element: Element,
  deltaX: number,
  deltaY: number,
  constraintKey: boolean  // Shift key
): Element {
  if (constraintKey) {
    // Allow only major axis movement
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      return { ...element, x: element.x + deltaX };
    } else {
      return { ...element, y: element.y + deltaY };
    }
  }
  
  return {
    ...element,
    x: element.x + deltaX,
    y: element.y + deltaY,
  };
}
```

### Resizing

**Resize Handles:**
```typescript
// 8 resize handles around element
const handles = [
  { position: 'nw', cursor: 'nwse-resize' },  // Northwest corner
  { position: 'n', cursor: 'ns-resize' },    // North edge
  { position: 'ne', cursor: 'nesw-resize' },  // Northeast corner
  { position: 'w', cursor: 'ew-resize' },    // West edge
  { position: 'e', cursor: 'ew-resize' },    // East edge
  { position: 'sw', cursor: 'nesw-resize' },  // Southwest corner
  { position: 's', cursor: 'ns-resize' },    // South edge
  { position: 'se', cursor: 'nwse-resize' },  // Southeast corner
];

function handleResize(
  element: Element,
  handle: string,
  deltaX: number,
  deltaY: number
): Element {
  switch (handle) {
    case 'nw':
      return {
        ...element,
        x: element.x + deltaX,
        y: element.y + deltaY,
        width: element.width - deltaX,
        height: element.height - deltaY,
      };
    case 'ne':
      return {
        ...element,
        y: element.y + deltaY,
        width: element.width + deltaX,
        height: element.height - deltaY,
      };
    // ... other handles
    default:
      return element;
  }
}
```

**Aspect Ratio Preservation:**
```typescript
function handleResizeWithAspectRatio(
  element: Element,
  handle: string,
  deltaX: number,
  deltaY: number
): Element {
  const aspectRatio = element.width / element.height;
  
  // Determine which delta to prioritize
  const useDeltaX = Math.abs(deltaX) > Math.abs(deltaY);
  
  if (useDeltaX) {
    const newWidth = element.width + deltaX;
    const newHeight = newWidth / aspectRatio;
    const heightDelta = newHeight - element.height;
    
    return {
      ...element,
      width: newWidth,
      height: newHeight,
      // Adjust position based on handle
    };
  } else {
    // Similar for height-priority case
  }
}
```

### Rotation

**2D Rotation Matrix:**
```typescript
// Rotate element around its center
function rotateElement(element: Element, angleInDegrees: number): Element {
  return {
    ...element,
    rotation: (element.rotation + angleInDegrees) % 360,
  };
}

// Render rotated element
function renderRotatedElement(
  ctx: CanvasRenderingContext2D,
  element: Element
) {
  ctx.save();
  
  // Translate to center
  const centerX = element.x + element.width / 2;
  const centerY = element.y + element.height / 2;
  ctx.translate(centerX, centerY);
  
  // Rotate
  ctx.rotate((element.rotation * Math.PI) / 180);
  
  // Draw from center
  ctx.fillRect(
    -element.width / 2,
    -element.height / 2,
    element.width,
    element.height
  );
  
  ctx.restore();
}
```

---

## Guide System

### Smart Guides

Smart guides help with precise alignment:

```typescript
// src/utils/guideCalculations.ts
interface Guide {
  axis: 'x' | 'y';           // Horizontal or vertical
  position: number;            // Position in canvas coords
  type: 'edge' | 'center';     // Which edge/center
  sourceElement?: string;      // Which element guides align to
}

function calculateSmartGuides(
  draggingElement: Element,
  allElements: Element[],
  threshold: number = 8
): Guide[] {
  const guides: Guide[] = [];
  
  const dragLeft = draggingElement.x;
  const dragRight = draggingElement.x + draggingElement.width;
  const dragCenterX = draggingElement.x + draggingElement.width / 2;
  const dragTop = draggingElement.y;
  const dragBottom = draggingElement.y + draggingElement.height;
  const dragCenterY = draggingElement.y + draggingElement.height / 2;
  
  // Check against other elements
  allElements.forEach(element => {
    if (element.id === draggingElement.id) return;
    
    const elLeft = element.x;
    const elRight = element.x + element.width;
    const elCenterX = element.x + element.width / 2;
    const elTop = element.y;
    const elBottom = element.y + element.height;
    const elCenterY = element.y + element.height / 2;
    
    // Vertical alignments (X axis)
    // Left to left
    if (Math.abs(dragLeft - elLeft) < threshold) {
      guides.push({
        axis: 'x',
        position: elLeft,
        type: 'edge',
        sourceElement: element.id,
      });
    }
    
    // Right to right
    if (Math.abs(dragRight - elRight) < threshold) {
      guides.push({
        axis: 'x',
        position: elRight - draggingElement.width,
        type: 'edge',
        sourceElement: element.id,
      });
    }
    
    // Center to center
    if (Math.abs(dragCenterX - elCenterX) < threshold) {
      guides.push({
        axis: 'x',
        position: elCenterX - draggingElement.width / 2,
        type: 'center',
        sourceElement: element.id,
      });
    }
    
    // Similarly for Y axis guides...
  });
  
  return guides;
}
```

### Snap-to-Grid

```typescript
function snapToGrid(element: Element, gridSize: number = 20): Element {
  return {
    ...element,
    x: Math.round(element.x / gridSize) * gridSize,
    y: Math.round(element.y / gridSize) * gridSize,
    width: Math.round(element.width / gridSize) * gridSize,
    height: Math.round(element.height / gridSize) * gridSize,
  };
}

// Render grid
function renderGrid(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  gridSize: number
) {
  ctx.strokeStyle = 'rgba(200, 200, 200, 0.3)';
  ctx.lineWidth = 0.5;
  
  // Vertical lines
  for (let x = 0; x <= width; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  
  // Horizontal lines
  for (let y = 0; y <= height; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
}
```

### Rendering Guides

```typescript
function renderSmartGuides(
  ctx: CanvasRenderingContext2D,
  guides: Guide[]
) {
  ctx.strokeStyle = '#0099ff';            // Bright blue
  ctx.lineWidth = 1;
  ctx.setLineDash([2, 2]);                // Dashed

  guides.forEach(guide => {
    if (guide.axis === 'x') {
      // Vertical guide line
      ctx.beginPath();
      ctx.moveTo(guide.position, 0);
      ctx.lineTo(guide.position, canvasHeight);
      ctx.stroke();
    } else {
      // Horizontal guide line
      ctx.beginPath();
      ctx.moveTo(0, guide.position);
      ctx.lineTo(canvasWidth, guide.position);
      ctx.stroke();
    }
  });
  
  ctx.setLineDash([]);
}
```

---

## Selection & Multi-Select

### Selection Types

```typescript
enum SelectionMode {
  Single = 'single',        // Replace selection
  Multi = 'multi',          // Add to selection (Shift)
  Range = 'range',          // Select range (Shift+drag)
  All = 'all',              // Select all (Ctrl+A)
}

interface SelectionState {
  selectedIds: string[];
  selectionMode: SelectionMode;
  selectionBox?: {
    startX: number;
    startY: number;
    endX: number;
    endY: number;
  };
}
```

### Handling Multi-Select

```typescript
// Single selection
function handleClick(element: Element, event: MouseEvent) {
  if (event.shiftKey) {
    // Add to selection
    toggleSelection(element.id);
  } else if (event.ctrlKey) {
    // Toggle selection
    toggleSelection(element.id);
  } else {
    // Replace selection
    setSelectedElements([element.id]);
  }
}

function toggleSelection(elementId: string) {
  setSelectedElementIds(prev =>
    prev.includes(elementId)
      ? prev.filter(id => id !== elementId)
      : [...prev, elementId]
  );
}
```

### Selection Box (Drag Select)

```typescript
// Start selection box
canvas.addEventListener('pointerdown', (e) => {
  if (!isElementAtPoint(canvasX, canvasY)) {
    // Start selection box
    setSelectionBox({
      startX: canvasX,
      startY: canvasY,
      endX: canvasX,
      endY: canvasY,
    });
  }
});

// Update selection box during drag
canvas.addEventListener('pointermove', (e) => {
  if (hasSelectionBox) {
    setSelectionBox(prev => ({
      ...prev,
      endX: canvasX,
      endY: canvasY,
    }));
  }
});

// Finalize selection
canvas.addEventListener('pointerup', (e) => {
  if (hasSelectionBox) {
    const selected = getElementsInBox(selectionBox);
    setSelectedElementIds(selected.map(el => el.id));
    clearSelectionBox();
  }
});

// Render selection box
function renderSelectionBox(
  ctx: CanvasRenderingContext2D,
  box: SelectionBox
) {
  const x = Math.min(box.startX, box.endX);
  const y = Math.min(box.startY, box.endY);
  const width = Math.abs(box.endX - box.startX);
  const height = Math.abs(box.endY - box.startY);
  
  ctx.fillStyle = 'rgba(0, 102, 204, 0.1)';  // Light blue
  ctx.fillRect(x, y, width, height);
  
  ctx.strokeStyle = '#0066cc';              // Blue border
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y, width, height);
}
```

---

## Keyboard Shortcuts

### Canvas Navigation

| Shortcut | Action |
|----------|--------|
| `Mouse Wheel` | Zoom in/out |
| `Shift + Drag` | Pan canvas |
| `Ctrl + 0` | Fit canvas to view |
| `Ctrl + 1` | Zoom to 100% |

### Element Manipulation

| Shortcut | Action |
|----------|--------|
| `Click` | Select element |
| `Shift + Click` | Multi-select |
| `Ctrl + A` | Select all |
| `Escape` | Deselect all |
| `Delete` | Delete selected |
| `Ctrl + D` | Duplicate selected |
| `Ctrl + C` | Copy |
| `Ctrl + V` | Paste |
| `Ctrl + X` | Cut |

### Editing

| Shortcut | Action |
|----------|--------|
| `Ctrl + Z` | Undo |
| `Ctrl + Y` | Redo |
| `Shift + Drag` | Constrain drag (horizontal/vertical) |
| `Alt + Drag` | Copy while dragging |
| `Arrow Keys` | Move 1px |
| `Shift + Arrow` | Move 10px |

### Implementation

```typescript
// src/components/editor/Canvas.tsx
function handleKeyDown(e: KeyboardEvent) {
  const selected = store.selectedElementIds;
  
  switch (e.key) {
    case 'Delete':
      e.preventDefault();
      store.deleteElements(selected);
      break;
      
    case 'z':
      if (e.ctrlKey && !e.shiftKey) {
        e.preventDefault();
        store.undo();
      }
      break;
      
    case 'y':
      if (e.ctrlKey) {
        e.preventDefault();
        store.redo();
      }
      break;
      
    case 'a':
      if (e.ctrlKey) {
        e.preventDefault();
        store.selectAll();
      }
      break;
      
    case 'ArrowUp':
    case 'ArrowDown':
    case 'ArrowLeft':
    case 'ArrowRight':
      e.preventDefault();
      const deltaY = e.key === 'ArrowUp' ? -1 : e.key === 'ArrowDown' ? 1 : 0;
      const deltaX = e.key === 'ArrowLeft' ? -1 : e.key === 'ArrowRight' ? 1 : 0;
      const distance = e.shiftKey ? 10 : 1;
      
      selected.forEach(id => {
        store.updateElement(id, {
          x: store.elements.find(el => el.id === id)!.x + deltaX * distance,
          y: store.elements.find(el => el.id === id)!.y + deltaY * distance,
        });
      });
      break;
  }
}
```

---

## Advanced Operations

### Undo/Redo

```typescript
// src/store/useEditorStore.ts
interface EditorState {
  elements: Element[];
  history: Element[][];
  historyIndex: number;
  
  recordSnapshot(): void;
  undo(): void;
  redo(): void;
}

const useEditorStore = create<EditorState>((set) => ({
  elements: [],
  history: [[]],  // Start with empty state
  historyIndex: 0,
  
  recordSnapshot: () => set((state) => ({
    history: [
      ...state.history.slice(0, state.historyIndex + 1),
      JSON.parse(JSON.stringify(state.elements)),  // Deep copy
    ],
    historyIndex: state.historyIndex + 1,
  })),
  
  undo: () => set((state) => {
    if (state.historyIndex > 0) {
      return {
        historyIndex: state.historyIndex - 1,
        elements: JSON.parse(
          JSON.stringify(state.history[state.historyIndex - 1])
        ),
      };
    }
    return state;
  }),
  
  redo: () => set((state) => {
    if (state.historyIndex < state.history.length - 1) {
      return {
        historyIndex: state.historyIndex + 1,
        elements: JSON.parse(
          JSON.stringify(state.history[state.historyIndex + 1])
        ),
      };
    }
    return state;
  }),
}));
```

### Grouping (Future)

```typescript
// Planned for v2.1+
interface GroupElement extends BaseElement {
  type: 'group';
  children: string[];  // IDs of grouped elements
}

function createGroup(elementIds: string[]) {
  const group: GroupElement = {
    id: generateId(),
    type: 'group',
    children: elementIds,
    x: 0,  // Computed from children
    y: 0,
    width: 0,
    height: 0,
    rotation: 0,
    opacity: 1,
    zIndex: Math.max(...elementIds.map(id => getElementById(id).zIndex)),
  };
  
  // When moving group, move all children
  // When selecting group, show as single unit
}
```

### Alignment Operations

```typescript
interface AlignmentType {
  x: 'left' | 'center' | 'right';
  y: 'top' | 'middle' | 'bottom';
}

function alignElements(elementIds: string[], alignment: AlignmentType) {
  if (elementIds.length < 2) return;
  
  const elements = elementIds.map(id => getElementById(id));
  const bounds = calculateBounds(elements);
  
  // Align horizontally
  if (alignment.x === 'left') {
    elements.forEach(el => {
      updateElement(el.id, { x: bounds.left });
    });
  } else if (alignment.x === 'center') {
    const centerX = bounds.left + bounds.width / 2;
    elements.forEach(el => {
      updateElement(el.id, { x: centerX - el.width / 2 });
    });
  }
  // ... similar for other alignments
}

function distributeElements(elementIds: string[], axis: 'x' | 'y') {
  // Evenly space elements by horizontal or vertical distance
}
```

---

## Performance Optimization

### Rendering Performance

```typescript
// 1. Use requestAnimationFrame for smooth updates
function scheduleRender() {
  if (renderScheduled) return;
  renderScheduled = true;
  
  requestAnimationFrame(() => {
    renderFrame(ctx);
    renderScheduled = false;
  });
}

// 2. Debounce frequent events
function debouncedPointerMove(callback: Function) {
  let timeout: NodeJS.Timeout;
  
  return (e: PointerEvent) => {
    clearTimeout(timeout);
    timeout = setTimeout(callback, 16);  // ~60 FPS
  };
}

// 3. Only re-render when necessary
const shouldRender = useCallback(() => {
  return stateChanged || draggingElement || selectedChanged;
}, [/* dependencies */]);

// 4. Cache expensive calculations
const cachedGuides = useMemo(() => {
  return calculateSmartGuides(draggingElement, allElements);
}, [draggingElement, allElements]);
```

### Element Count Limits

```typescript
// Performance degrades with many elements
// Recommended limits:

const PERFORMANCE_LIMITS = {
  smooth: 10,        // < 10 elements = smooth
  good: 30,          // < 30 elements = good
  acceptable: 50,    // < 50 elements = acceptable (some lag)
  poor: 100,         // 100+ elements = poor (consider batching)
};

// For bulk generation, split into multiple sheets
if (elements.length > PERFORMANCE_LIMITS.acceptable) {
  console.warn(
    `Canvas has ${elements.length} elements.` +
    `Consider splitting into multiple sheets for better performance.`
  );
}
```

### Memory Management

```typescript
// Clear unused resources
function cleanup() {
  // Clear undo/redo history beyond limit
  if (history.length > 100) {
    history = history.slice(-50);  // Keep only last 50
  }
  
  // Unload unused images
  imageCache.clear();
  
  // Garbage collect
  elements = elements.filter(el => el.visible !== false);
}
```

---

## Debugging Canvas

### Console Logging

```typescript
// Enable debug logging
const DEBUG = true;

function logCanvasState() {
  if (!DEBUG) return;
  
  console.group('🎨 Canvas State');
  console.log('Zoom Level:', zoomLevel);
  console.log('Pan Position:', { panX, panY });
  console.log('Elements Count:', elements.length);
  console.log('Selected:', selectedElementIds);
  console.log('Full State:', {
    zoomLevel,
    panX,
    panY,
    elements,
    selectedElementIds,
  });
  console.groupEnd();
}

// Log on state changes
useEffect(() => {
  logCanvasState();
}, [zoomLevel, panX, panY, elements, selectedElementIds]);
```

### Visual Debugging

```typescript
// Render bounding boxes for all elements
function renderDebugBoxes(ctx: CanvasRenderingContext2D) {
  ctx.strokeStyle = 'red';
  ctx.lineWidth = 1;
  
  elements.forEach(el => {
    ctx.strokeRect(el.x, el.y, el.width, el.height);
    
    // Draw center point
    ctx.fillStyle = 'red';
    ctx.fillRect(
      el.x + el.width / 2 - 2,
      el.y + el.height / 2 - 2,
      4,
      4
    );
  });
}

// Visualize coordinate system
function renderCoordinateSystem(ctx: CanvasRenderingContext2D) {
  // X axis (red)
  ctx.strokeStyle = 'red';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(100, 0);
  ctx.stroke();
  
  // Y axis (green)
  ctx.strokeStyle = 'green';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, 100);
  ctx.stroke();
  
  // Label
  ctx.fillStyle = 'black';
  ctx.font = '10px Arial';
  ctx.fillText('(0,0)', 5, -5);
}
```

### React DevTools

```typescript
// Use React DevTools
// 1. Install React DevTools browser extension
// 2. Open DevTools in browser
// 3. Go to React tab
// 4. Search for Canvas component
// 5. View props and state in real-time
// 6. Trigger actions from DevTools
```

### Testing Coordinates

```typescript
// Test coordinate conversion
function testCoordinateConversion() {
  const testCases = [
    { view: { x: 100, y: 100 }, pan: { x: 0, y: 0 }, zoom: 1 },
    { view: { x: 100, y: 100 }, pan: { x: 50, y: 50 }, zoom: 2 },
    { view: { x: 0, y: 0 }, pan: { x: 100, y: 100 }, zoom: 1 },
  ];
  
  testCases.forEach(({ view, pan, zoom }) => {
    const canvas = viewToCanvasCoords(view.x, view.y, pan.x, pan.y, zoom);
    const back = canvasToViewCoords(canvas.x, canvas.y, pan.x, pan.y, zoom);
    
    console.assert(
      Math.abs(back.x - view.x) < 0.01 && Math.abs(back.y - view.y) < 0.01,
      `Coordinate conversion failed for ${JSON.stringify({ view, pan, zoom })}`
    );
  });
}
```

---

## Common Issues & Solutions

### Issue: Canvas appears blurry at zoom levels

**Cause:** Browser scaling/smoothing  
**Solution:**
```typescript
const canvas = canvasRef.current!;
canvas.style.imageRendering = 'pixelated';  // Crisp rendering
```

### Issue: Mouse clicks not registering on elements

**Cause:** Incorrect coordinate transformation  
**Solution:**
```typescript
// Verify transformation
const testPoint = viewToCanvasCoords(200, 200, 50, 50, 2);
console.log('Test point in canvas:', testPoint);
// Should be valid canvas coordinates
```

### Issue: Dragging feels laggy

**Cause:** Re-rendering too frequently  
**Solution:**
```typescript
// Use debouncing
const debouncedUpdate = debounce((element) => {
  store.updateElement(element.id, element);
}, 16);  // ~60 FPS

// Or use requestAnimationFrame
requestAnimationFrame(() => {
  renderFrame(ctx);
});
```

### Issue: Selection box persists on canvas

**Cause:** Forgot to clear selection box  
**Solution:**
```typescript
// Clear selection box on pointer up
canvas.addEventListener('pointerup', () => {
  setSelectionBox(null);  // ← Add this
});
```

---

## Quick Reference

### Important Functions

```typescript
// Coordinate conversion
viewToCanvasCoords(viewX, viewY, panX, panY, zoom)
canvasToViewCoords(canvasX, canvasY, panX, panY, zoom)

// Element operations
selectElement(elementId, multiSelect?)
updateElement(id, changes)
deleteElement(id)
drawElement(ctx, element)

// Guide system
calculateSmartGuides(element, allElements)
renderSmartGuides(ctx, guides)

// State management
useEditorStore()
recordSnapshot()
undo()
redo()
```

### Key Properties

```typescript
interface Element {
  id: string;
  type: 'text' | 'image' | 'shape';
  x: number;          // Canvas coordinates
  y: number;
  width: number;
  height: number;
  rotation: number;   // Degrees, 0-360
  opacity: number;    // 0-1
  zIndex: number;
}

interface CanvasViewport {
  zoomLevel: number;  // 1 = 100%
  panX: number;       // Pixels
  panY: number;       // Pixels
}
```

---

*Last Updated: March 11, 2026*  
*For Certificator v2.0+*  
*See ARCHITECTURE.md for system-level design patterns*
