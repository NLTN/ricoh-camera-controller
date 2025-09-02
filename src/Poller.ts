/**
 * Poller provides a simple utility for repeatedly executing a function
 * at a fixed interval. It supports:
 * - Starting and stopping polling.
 * - Permanently changing the interval.
 * - Temporarily changing the interval for a limited number of cycles,
 *   after which it automatically reverts to the default.
 *
 * Example:
 * ```ts
 * const poller = new Poller(() => console.log("tick"), 1000);
 * poller.start();                // Run every 1s
 * poller.setIntervalMs(500);     // Change interval to 0.5s
 * poller.setIntervalTemporarily(200, 5); // Run every 200ms for 5 cycles, then revert
 * poller.stop();                 // Stop polling
 * ```
 */
export class Poller {
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private currentInterval: number;

  /**
   * Creates a Poller instance to repeatedly run a function at a given interval.
   * @param fn - The function to execute on each polling cycle.
   * @param defaultInterval - The default polling interval in milliseconds.
   */
  constructor(
    private fn: () => void,
    private defaultInterval: number
  ) {
    this.currentInterval = defaultInterval;
  }

  /**
   * Start polling using the current interval.
   * If polling is already active, it restarts the poller.
   */
  start(): void {
    this.clear();
    this.intervalId = setInterval(this.fn, this.currentInterval);
  }

  /**
   * Stop polling immediately and clear any active interval.
   */
  stop(): void {
    this.clear();
  }

  /**
   * Permanently change the polling interval.
   * If polling is currently active, it restarts with the new interval.
   * @param ms - The new interval in milliseconds.
   */
  setIntervalMs(ms: number): void {
    this.currentInterval = ms;
    if (this.intervalId) {
      this.start(); // restart with new interval
    }
  }

  /**
   * Temporarily set a different polling interval for a limited number of cycles.
   * After the specified number of cycles, the poller automatically reverts
   * to the default interval.
   *
   * @param ms - Temporary interval in milliseconds.
   * @param cycles - Number of times to run at the temporary interval before reverting.
   * @throws Error if `cycles` is not a positive integer.
   */
  setIntervalTemporarily(ms: number, cycles: number): void {
    if (!Number.isInteger(cycles) || cycles < 1) {
      throw new Error(
        `"cycles" must be an integer greater than or equal to 1. Received: ${cycles}`
      );
    }

    let count = 0;
    this.clear();

    this.intervalId = setInterval(() => {
      this.fn();
      count++;
      if (count >= cycles) {
        this.setIntervalMs(this.defaultInterval);
      }
    }, ms);
  }

  /**
   * Clear the currently active polling interval, if any.
   * This is a private utility method used internally by start/stop.
   */
  private clear(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}
