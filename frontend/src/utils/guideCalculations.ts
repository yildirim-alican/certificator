/**
 * Guide Calculations - Figma-inspired smart guides
 * Handles alignment, distance, and distribution guides
 */

export interface EdgeValues {
  left: number;
  right: number;
  top: number;
  bottom: number;
  centerX: number;
  centerY: number;
}

export interface AlignmentGuide {
  type: 'vertical' | 'horizontal';
  position: number;
  diff: number; // How much to move to snap
  edges: ('left' | 'right' | 'centerX' | 'top' | 'bottom' | 'centerY')[];
}

export interface DistanceGuide {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  distance: number; // px distance
  horizontal: boolean;
}

export class GuideCalculator {
  private static readonly ALIGN_THRESHOLD = 4; // pixels
  private static readonly DISTANCE_THRESHOLD = 50; // pixels
  private static readonly MIN_DISTANCE_FOR_GUIDES = 0; // Show distance guides at any distance when Alt pressed

  static getEdgeValues(element: { x: number; y: number; width: number; height: number }): EdgeValues {
    return {
      left: element.x,
      right: element.x + element.width,
      top: element.y,
      bottom: element.y + element.height,
      centerX: element.x + element.width / 2,
      centerY: element.y + element.height / 2,
    };
  }

  /**
   * Calculate alignment guides for a moving element against all other elements
   * Returns snap suggestions if alignment exists
   */
  static calculateAlignmentGuides(
    movingElement: { x: number; y: number; width: number; height: number },
    otherElements: { x: number; y: number; width: number; height: number }[]
  ): AlignmentGuide[] {
    const guides: AlignmentGuide[] = [];
    const moving = this.getEdgeValues(movingElement);

    // Check snap to edges and center
    otherElements.forEach((element) => {
      const target = this.getEdgeValues(element);

      // Vertical alignment
      const verticalAlignments = [
        { diff: target.left - moving.left, position: target.left, edges: ['left', 'left'] as const },
        { diff: target.right - moving.right, position: target.right, edges: ['right', 'right'] as const },
        { diff: target.centerX - moving.centerX, position: target.centerX, edges: ['centerX', 'centerX'] as const },
        {
          diff: target.centerX - moving.left,
          position: target.centerX,
          edges: ['left', 'centerX'] as const,
        },
        {
          diff: target.right - moving.right,
          position: target.right,
          edges: ['right', 'right'] as const,
        },
      ];

      // Horizontal alignment
      const horizontalAlignments = [
        { diff: target.top - moving.top, position: target.top, edges: ['top', 'top'] as const },
        { diff: target.bottom - moving.bottom, position: target.bottom, edges: ['bottom', 'bottom'] as const },
        { diff: target.centerY - moving.centerY, position: target.centerY, edges: ['centerY', 'centerY'] as const },
        {
          diff: target.centerY - moving.top,
          position: target.centerY,
          edges: ['top', 'centerY'] as const,
        },
        {
          diff: target.bottom - moving.bottom,
          position: target.bottom,
          edges: ['bottom', 'bottom'] as const,
        },
      ];

      verticalAlignments.forEach(({ diff, position, edges }) => {
        if (Math.abs(diff) <= this.ALIGN_THRESHOLD) {
          guides.push({
            type: 'vertical',
            position,
            diff,
            edges: [edges[0]] as any,
          });
        }
      });

      horizontalAlignments.forEach(({ diff, position, edges }) => {
        if (Math.abs(diff) <= this.ALIGN_THRESHOLD) {
          guides.push({
            type: 'horizontal',
            position,
            diff,
            edges: [edges[0]] as any,
          });
        }
      });
    });

    // Add canvas center guides if close
    if (Math.abs(moving.centerX - 50) <= this.ALIGN_THRESHOLD) {
      guides.push({
        type: 'vertical',
        position: 50,
        diff: 50 - moving.centerX,
        edges: ['centerX'],
      });
    }

    if (Math.abs(moving.centerY - 50) <= this.ALIGN_THRESHOLD) {
      guides.push({
        type: 'horizontal',
        position: 50,
        diff: 50 - moving.centerY,
        edges: ['centerY'],
      });
    }

    return guides.slice(0, 2); // Max 1 vertical + 1 horizontal
  }

  /**
   * Calculate distance guides (spacing between elements)
   * Only shown when Alt key is pressed
   */
  static calculateDistanceGuides(
    movingElement: { x: number; y: number; width: number; height: number },
    otherElements: { x: number; y: number; width: number; height: number }[],
    canvasWidth: number,
    canvasHeight: number
  ): DistanceGuide[] {
    const guides: DistanceGuide[] = [];
    const moving = this.getEdgeValues(movingElement);

    otherElements.forEach((element) => {
      const target = this.getEdgeValues(element);

      // Horizontal distance (gaps)
      const distanceRight = target.left - moving.right;
      const distanceLeft = moving.left - target.right;

      if (
        distanceRight >= this.MIN_DISTANCE_FOR_GUIDES &&
        distanceRight <= this.DISTANCE_THRESHOLD &&
        // Check vertical overlap
        !(moving.bottom < target.top || moving.top > target.bottom)
      ) {
        guides.push({
          x1: moving.right,
          y1: moving.centerY,
          x2: target.left,
          y2: target.centerY,
          distance: (distanceRight / canvasWidth) * 100,
          horizontal: true,
        });
      }

      if (
        distanceLeft >= this.MIN_DISTANCE_FOR_GUIDES &&
        distanceLeft <= this.DISTANCE_THRESHOLD &&
        // Check vertical overlap
        !(moving.bottom < target.top || moving.top > target.bottom)
      ) {
        guides.push({
          x1: target.right,
          y1: target.centerY,
          x2: moving.left,
          y2: moving.centerY,
          distance: (distanceLeft / canvasWidth) * 100,
          horizontal: true,
        });
      }

      // Vertical distance (gaps)
      const distanceBottom = target.top - moving.bottom;
      const distanceTop = moving.top - target.bottom;

      if (
        distanceBottom >= this.MIN_DISTANCE_FOR_GUIDES &&
        distanceBottom <= this.DISTANCE_THRESHOLD &&
        // Check horizontal overlap
        !(moving.right < target.left || moving.left > target.right)
      ) {
        guides.push({
          x1: moving.centerX,
          y1: moving.bottom,
          x2: target.centerX,
          y2: target.top,
          distance: (distanceBottom / canvasHeight) * 100,
          horizontal: false,
        });
      }

      if (
        distanceTop >= this.MIN_DISTANCE_FOR_GUIDES &&
        distanceTop <= this.DISTANCE_THRESHOLD &&
        // Check horizontal overlap
        !(moving.right < target.left || moving.left > target.right)
      ) {
        guides.push({
          x1: target.centerX,
          y1: target.bottom,
          x2: moving.centerX,
          y2: moving.top,
          distance: (distanceTop / canvasHeight) * 100,
          horizontal: false,
        });
      }
    });

    // Keep top 3 closest
    return guides.sort((a, b) => a.distance - b.distance).slice(0, 3);
  }

  /**
   * Apply alignment guide snapping
   */
  static applyGuideSnapping(
    position: { x: number; y: number },
    guides: AlignmentGuide[]
  ): { x: number; y: number } {
    let newX = position.x;
    let newY = position.y;

    guides.forEach((guide) => {
      if (guide.type === 'vertical') {
        newX += guide.diff;
      } else {
        newY += guide.diff;
      }
    });

    return { x: newX, y: newY };
  }
}

