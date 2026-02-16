/**
 * High-level connectivity state derived from polling success/failure patterns.
 *
 * - CONNECTED: Healthy communication, recent successful responses.
 * - DEGRADED: Transient instability detected (failures observed but not yet disconnected).
 * - DISCONNECTED: Confirmed loss of communication (threshold or timeout exceeded).
 */
export type ConnectionState = 'CONNECTED' | 'DEGRADED' | 'DISCONNECTED';

/**
 * Configuration options controlling failure tolerance and timeout behavior.
 */
export interface ConnectionHealthOptions {
  /**
   * Number of consecutive failures required before transitioning
   * to DISCONNECTED.
   *
   * Default: 3
   */
  maxConsecutiveFailures?: number;

  /**
   * Maximum allowed time (ms) since the last successful response
   * before forcing DISCONNECTED.
   *
   * Protects against silent stalls where no failures are recorded.
   *
   * Default: 10000
   */
  disconnectTimeoutMs?: number;

  /**
   * Number of consecutive failures required before transitioning
   * from CONNECTED → DEGRADED.
   *
   * Default: 1
   */
  degradedAfterFailures?: number;

  /**
   * Interval (ms) for internal health checks.
   * Determines how often timeout-based disconnection is evaluated.
   *
   * Default: 1000
   */
  checkIntervalMs?: number;
}

/**
 * Optional lifecycle callbacks emitted by the monitor.
 */
export interface ConnectionHealthCallbacks {
  /**
   * Fired whenever the connection state changes.
   * Not triggered if the state remains unchanged.
   */
  onStateChange?: (state: ConnectionState) => void;
}

/**
 * Connection Health Monitor
 *
 * A transport-agnostic resilience engine designed for polling-based
 * device communication (e.g., WiFi IoT devices).
 *
 * Responsibilities:
 * - Track consecutive failures
 * - Track time since last success
 * - Derive high-level connection state
 * - Emit deterministic state transitions
 */
export class ConnectionHealthMonitor {
  /** Current derived connection state */
  private state: ConnectionState = 'DISCONNECTED';

  /** Number of consecutive failures since last success */
  private failureCount = 0;

  /** Timestamp (performance.now) of last successful response */
  private lastSuccessTime = 0;

  /** Internal interval timer for timeout-based health checks */
  private healthTimer?: NodeJS.Timeout;

  private readonly maxConsecutiveFailures: number;
  private readonly degradedAfterFailures: number;
  private readonly disconnectTimeoutMs: number;
  private readonly checkIntervalMs: number;

  private readonly onStateChange?: (state: ConnectionState) => void;

  constructor(
    options: ConnectionHealthOptions = {},
    callbacks: ConnectionHealthCallbacks = {}
  ) {
    this.maxConsecutiveFailures = options.maxConsecutiveFailures ?? 3;
    this.degradedAfterFailures = options.degradedAfterFailures ?? 1;
    this.disconnectTimeoutMs = options.disconnectTimeoutMs ?? 10000;
    this.checkIntervalMs = options.checkIntervalMs ?? 1000;

    this.onStateChange = callbacks.onStateChange;
  }

  /**
   * Starts the internal health evaluation loop.
   * Safe to call multiple times (idempotent).
   */
  start() {
    if (this.healthTimer) return;

    this.lastSuccessTime = performance.now();

    this.healthTimer = setInterval(
      () => this.checkHealth(),
      this.checkIntervalMs
    );
  }

  /**
   * Stops the internal health evaluation loop.
   * Does not reset state.
   */
  stop() {
    if (this.healthTimer) {
      clearInterval(this.healthTimer);
      this.healthTimer = undefined;
    }
  }

  /**
   * Records a successful polling response.
   *
   * Effects:
   * - Resets failure counter
   * - Updates last success timestamp
   * - Transitions to CONNECTED if not already
   */
  recordSuccess() {
    this.failureCount = 0;
    this.lastSuccessTime = performance.now();

    if (this.state !== 'CONNECTED') {
      this.transitionTo('CONNECTED');
    }
  }

  /**
   * Records a failed polling attempt.
   *
   * Effects:
   * - Increments consecutive failure count
   * - May transition to DEGRADED
   * - May transition to DISCONNECTED if threshold exceeded
   */
  recordFailure() {
    this.failureCount++;

    if (this.failureCount >= this.maxConsecutiveFailures) {
      this.transitionTo('DISCONNECTED');
      return;
    }

    if (
      this.failureCount >= this.degradedAfterFailures &&
      this.state === 'CONNECTED'
    ) {
      this.transitionTo('DEGRADED');
    }
  }

  /**
   * Periodic health evaluation.
   *
   * Forces DISCONNECTED if no successful response has been
   * observed within the configured timeout window.
   */
  private checkHealth() {
    const now = performance.now();

    const timeSinceLastSuccess = now - this.lastSuccessTime;

    if (timeSinceLastSuccess >= this.disconnectTimeoutMs) {
      this.transitionTo('DISCONNECTED');
    }
  }

  /**
   * Internal state transition handler.
   * Ensures transitions are emitted only when state changes.
   */
  private transitionTo(next: ConnectionState) {
    if (this.state === next) return;

    this.state = next;
    this.onStateChange?.(next);
  }

  /**
   * Returns the current derived connection state.
   */
  getState(): ConnectionState {
    return this.state;
  }
}
