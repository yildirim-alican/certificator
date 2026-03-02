/**
 * Advanced Pointer Sensitivity & Movement System
 * Enhanced version with momentum, velocity tracking, and Figma-like feel
 * Replaces basic pointer sensitivity module
 */

/**
 * Configuration for pointer behavior
 * Tuned for smooth, responsive interactions like Figma
 */
export class AdvancedPointerSensitivity {
  // Minimum distance (px) to trigger movement register
  static readonly DRAG_THRESHOLD = 4;

  // Velocity retention per frame (0.88 = 12% decay per frame)
  static readonly MOVEMENT_DAMPING = 0.88;

  // Friction when dragging (resistance factor)
  static readonly DRAG_FRICTION = 0.95;

  // Acceleration factor (0.12 = smooth acceleration curve)
  static readonly ACCELERATION = 0.12;

  // Maximum velocity to prevent jitter (pixels/frame)
  static readonly MAX_VELOCITY = 20;

  // Minimum velocity before stopping (pixels/frame)
  static readonly MIN_VELOCITY_THRESHOLD = 0.02;

  // Momentum/inertia multiplier (how much momentum after drag)
  static readonly MOMENTUM_MULTIPLIER = 0.92;

  // Number of momentum frames to animate
  static readonly MOMENTUM_FRAMES = 60;

  /**
   * Cubic ease-out easing function
   * Provides natural deceleration feel
   *
   * Formula: 1 - (1 - t)³
   * Creates smooth, non-linear movement progression
   */
  static applyEasing(value: number, type: 'easeOut' | 'linear' | 'easeInOut' = 'easeOut'): number {
    if (type === 'linear') return value;

    const absVal = Math.abs(value);
    const sign = value < 0 ? -1 : 1;

    if (type === 'easeOut') {
      // Cubic ease-out: fast initially, slow at end
      const t = Math.min(absVal / this.MAX_VELOCITY, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      return sign * eased * this.MAX_VELOCITY;
    }

    // easeInOut
    const t = Math.min(absVal / this.MAX_VELOCITY, 1);
    const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    return sign * eased * this.MAX_VELOCITY;
  }

  /**
   * Calculate velocity from position change over time
   * Normalizes for frame rate independence
   *
   * @param prevX - Previous X position
   * @param prevY - Previous Y position
   * @param currentX - Current X position
   * @param currentY - Current Y position
   * @param deltaTime - Time elapsed (ms), use 16.67 for 60fps
   * @returns { vx, vy } - Velocity in px/frame
   */
  static calculateVelocity(
    prevX: number,
    prevY: number,
    currentX: number,
    currentY: number,
    deltaTime: number = 16.67
  ): { vx: number; vy: number } {
    // Prevent division by zero
    if (deltaTime === 0) {
      return { vx: 0, vy: 0 };
    }

    // Calculate velocity per frame (assuming 60fps = 16.67ms/frame)
    const frameScale = 16.67 / deltaTime;
    const vx = (currentX - prevX) * frameScale;
    const vy = (currentY - prevY) * frameScale;

    return {
      vx: this.clampVelocity(vx),
      vy: this.clampVelocity(vy),
    };
  }

  /**
   * Apply damping/friction to velocity
   * Simulates natural deceleration
   *
   * @param velocity - Current velocity (px/frame)
   * @param damping - Damping coefficient (0.88 recommended)
   * @returns Dampened velocity
   */
  static applyDamping(velocity: number, damping: number = this.MOVEMENT_DAMPING): number {
    const dampedVelocity = velocity * damping;
    return this.isVelocityNegligible(dampedVelocity) ? 0 : dampedVelocity;
  }

  /**
   * Clamp velocity to max range
   * Prevents extreme/jittery speeds
   */
  static clampVelocity(velocity: number, max: number = this.MAX_VELOCITY): number {
    return Math.max(-max, Math.min(max, velocity));
  }

  /**
   * Check if velocity is below minimum threshold
   * Used to determine when movement should stop
   */
  static isVelocityNegligible(velocity: number, threshold: number = this.MIN_VELOCITY_THRESHOLD): boolean {
    return Math.abs(velocity) < threshold;
  }

  /**
   * Calculate momentum-based position after drag ends
   * Uses exponential decay with better feel
   *
   * @param vx - X velocity
   * @param vy - Y velocity
   * @param frames - Number of animation frames to simulate (60 recommended)
   * @returns { totalDx, totalDy } - Total distance momentum will carry
   */
  static calculateMomentum(
    vx: number,
    vy: number,
    frames: number = this.MOMENTUM_FRAMES
  ): { totalDx: number; totalDy: number } {
    let totalDx = 0;
    let totalDy = 0;
    let currentVx = vx;
    let currentVy = vy;

    for (let i = 0; i < frames; i++) {
      if (this.isVelocityNegligible(currentVx) && this.isVelocityNegligible(currentVy)) break;

      totalDx += currentVx;
      totalDy += currentVy;

      currentVx = this.applyDamping(currentVx);
      currentVy = this.applyDamping(currentVy);
    }

    return { totalDx, totalDy };
  }

  /**
   * Create momentum animation configuration
   * Returns frame-by-frame deltas for smooth momentum animation
   */
  static generateMomentumFrames(vx: number, vy: number, frames: number = 30): Array<{ dx: number; dy: number }> {
    const frameData: Array<{ dx: number; dy: number }> = [];
    let currentVx = vx;
    let currentVy = vy;

    for (let i = 0; i < frames; i++) {
      if (this.isVelocityNegligible(currentVx) && this.isVelocityNegligible(currentVy)) break;

      frameData.push({ dx: currentVx, dy: currentVy });

      currentVx = this.applyDamping(currentVx);
      currentVy = this.applyDamping(currentVy);
    }

    return frameData;
  }

  /**
   * Snap value to grid
   * Useful for designers who prefer grid-aligned elements
   *
   * @param value - Current position
   * @param gridSize - Grid spacing (8px recommended for Figma)
   * @returns Snapped position
   */
  static snapToGrid(value: number, gridSize: number = 8): number {
    return Math.round(value / gridSize) * gridSize;
  }

  /**
   * Calculate distance between two points
   * Used for proportional resize calculations
   */
  static distance(x1: number, y1: number, x2: number, y2: number): number {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Calculate angle between two points (in radians)
   * Used for rotation calculations
   */
  static angle(x1: number, y1: number, x2: number, y2: number): number {
    return Math.atan2(y2 - y1, x2 - x1);
  }

  /**
   * Constrain point to bounds
   * Prevents elements from moving outside canvas
   */
  static constrainToBounds(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
  }

  /**
   * Linear interpolation between values
   * Used for smooth animations
   */
  static lerp(start: number, end: number, t: number): number {
    return start + (end - start) * Math.max(0, Math.min(1, t));
  }

  /**
   * Exponential smoothing (low-pass filter)
   * Reduces jitter in pointer tracking
   */
  static exponentialSmoothing(current: number, target: number, alpha: number = 0.3): number {
    return current + (target - current) * alpha;
  }
}

/**
 * Velocity tracker with moving average
 * Maintains history for smooth velocity calculations
 */
export class VelocityTracker {
  private velocityHistoryX: number[] = [];
  private velocityHistoryY: number[] = [];
  private readonly maxHistory: number;
  private lastTime: number = 0;

  constructor(maxHistory: number = 8) {
    this.maxHistory = maxHistory;
  }

  /**
   * Add new velocity sample
   */
  addSample(vx: number, vy: number): void {
    this.velocityHistoryX.push(vx);
    this.velocityHistoryY.push(vy);

    if (this.velocityHistoryX.length > this.maxHistory) {
      this.velocityHistoryX.shift();
      this.velocityHistoryY.shift();
    }

    this.lastTime = performance.now();
  }

  /**
   * Get average velocity (dampens noise)
   */
  getAverageVelocity(): { vx: number; vy: number } {
    if (this.velocityHistoryX.length === 0) {
      return { vx: 0, vy: 0 };
    }

    const sumX = this.velocityHistoryX.reduce((a, b) => a + b, 0);
    const sumY = this.velocityHistoryY.reduce((a, b) => a + b, 0);

    return {
      vx: sumX / this.velocityHistoryX.length,
      vy: sumY / this.velocityHistoryY.length,
    };
  }

  /**
   * Get latest velocity
   */
  getLatestVelocity(): { vx: number; vy: number } {
    return {
      vx: this.velocityHistoryX[this.velocityHistoryX.length - 1] || 0,
      vy: this.velocityHistoryY[this.velocityHistoryY.length - 1] || 0,
    };
  }

  /**
   * Get smoothed velocity (weighted moving average)
   * Recent samples have higher weight
   */
  getSmoothedVelocity(): { vx: number; vy: number } {
    if (this.velocityHistoryX.length === 0) {
      return { vx: 0, vy: 0 };
    }

    let sumX = 0;
    let sumY = 0;
    let weightSum = 0;

    for (let i = 0; i < this.velocityHistoryX.length; i++) {
      const weight = (i + 1) / this.velocityHistoryX.length; // Linear weight increase
      sumX += this.velocityHistoryX[i] * weight;
      sumY += this.velocityHistoryY[i] * weight;
      weightSum += weight;
    }

    return {
      vx: sumX / weightSum,
      vy: sumY / weightSum,
    };
  }

  /**
   * Reset tracker
   */
  reset(): void {
    this.velocityHistoryX = [];
    this.velocityHistoryY = [];
    this.lastTime = 0;
  }

  /**
   * Get time since last sample (ms)
   */
  getTimeSinceLastSample(): number {
    return performance.now() - this.lastTime;
  }
}
