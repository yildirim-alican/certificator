/**
 * Mouse Movement & Interaction Utilities
 * Optimized pointer sensitivity and tracking
 */

export interface MouseState {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  prevX: number;
  prevY: number;
  velocityX: number;
  velocityY: number;
  moved: boolean;
  movementTime: number;
}

/**
 * Pointer Sensitivity Configuration
 * Fine-tuned for Figma-like smooth interaction
 */
export class PointerSensitivity {
  // Drag threshold - minimum pixels before movement registers
  static readonly DRAG_THRESHOLD = 4; // Increased from 2px for less sensitivity

  // Movement damping - 0.85 means 15% decay per frame (smooth motion)
  static readonly MOVEMENT_DAMPING = 0.88;

  // Acceleration factor - how much to scale velocity changes
  static readonly ACCELERATION = 0.12;

  // Min/max velocity to prevent extreme movements
  static readonly MIN_VELOCITY = 0.05;
  static readonly MAX_VELOCITY = 15;

  /**
   * Apply easing function to raw delta
   * Makes movement feel more natural
   */
  static applyEasing(delta: number, type: 'easeOut' | 'linear' = 'easeOut'): number {
    if (type === 'easeOut') {
      // Ease-out cubic: slower at the end
      const t = Math.min(Math.abs(delta) / 50, 1); // Normalize to 0-1
      const eased = 1 - Math.pow(1 - t, 3);
      return Math.sign(delta) * (eased * Math.abs(delta));
    }
    return delta;
  }

  /**
   * Calculate velocity from movement over time
   * Enables momentum-like feel
   */
  static calculateVelocity(
    prevX: number,
    prevY: number,
    currentX: number,
    currentY: number,
    deltaTime: number // milliseconds
  ): { vx: number; vy: number } {
    const dx = currentX - prevX;
    const dy = currentY - prevY;

    // Normalize by time (pixels per millisecond)
    const timeScale = Math.max(deltaTime, 1) / 16; // 16ms = 60fps baseline
    let vx = (dx / timeScale) * this.ACCELERATION;
    let vy = (dy / timeScale) * this.ACCELERATION;

    // Clamp velocity
    vx = Math.max(Math.min(vx, this.MAX_VELOCITY), -this.MAX_VELOCITY);
    vy = Math.max(Math.min(vy, this.MAX_VELOCITY), -this.MAX_VELOCITY);

    return { vx, vy };
  }

  /**
   * Apply damping to velocity (friction)
   */
  static applyDamping(velocity: number): number {
    const damped = velocity * this.MOVEMENT_DAMPING;
    return Math.abs(damped) < this.MIN_VELOCITY ? 0 : damped;
  }

  /**
   * Interpolate between two values smoothly
   * Used for smooth motion continuation
   */
  static interpolate(from: number, to: number, factor: number): number {
    return from + (to - from) * factor;
  }
}

/**
 * Create initial mouse state
 */
export function createMouseState(startX: number, startY: number): MouseState {
  return {
    startX,
    startY,
    currentX: startX,
    currentY: startY,
    prevX: startX,
    prevY: startY,
    velocityX: 0,
    velocityY: 0,
    moved: false,
    movementTime: performance.now(),
  };
}

/**
 * Update mouse state on movement
 */
export function updateMouseState(state: MouseState, currentX: number, currentY: number): MouseState {
  const now = performance.now();
  const deltaTime = now - state.movementTime;

  const { vx, vy } = PointerSensitivity.calculateVelocity(
    state.prevX,
    state.prevY,
    currentX,
    currentY,
    deltaTime
  );

  return {
    ...state,
    prevX: state.currentX,
    currentX,
    prevY: state.currentY,
    currentY,
    velocityX: vx,
    velocityY: vy,
    moved: true,
    movementTime: now,
  };
}
