export type ConnectionState = 'CONNECTED' | 'DEGRADED' | 'DISCONNECTED';

export interface ConnectionHealthOptions {
  maxConsecutiveFailures?: number;
  disconnectTimeoutMs?: number;
  degradedAfterFailures?: number;
  checkIntervalMs?: number;
}

export interface ConnectionHealthCallbacks {
  onStateChange?: (state: ConnectionState) => void;
}

export class ConnectionHealthMonitor {
  private state: ConnectionState = 'DISCONNECTED';

  private failureCount = 0;
  private lastSuccessTime = 0;
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

  start() {
    if (this.healthTimer) return;

    this.lastSuccessTime = performance.now();

    this.healthTimer = setInterval(
      () => this.checkHealth(),
      this.checkIntervalMs
    );
  }

  stop() {
    if (this.healthTimer) {
      clearInterval(this.healthTimer);
      this.healthTimer = undefined;
    }
  }

  /**
   * Call this after a successful poll response
   */
  recordSuccess() {
    this.failureCount = 0;
    this.lastSuccessTime = performance.now();

    if (this.state !== 'CONNECTED') {
      this.transitionTo('CONNECTED');
    }
  }

  /**
   * Call this when a poll fails (timeout, network error, 5xx, etc.)
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

  private checkHealth() {
    const now = performance.now();

    const timeSinceLastSuccess = now - this.lastSuccessTime;

    if (timeSinceLastSuccess >= this.disconnectTimeoutMs) {
      this.transitionTo('DISCONNECTED');
    }
  }

  private transitionTo(next: ConnectionState) {
    if (this.state === next) return;

    this.state = next;
    this.onStateChange?.(next);
  }

  getState(): ConnectionState {
    return this.state;
  }
}
