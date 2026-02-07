/**
 * Camera operation modes controlling lens state and device functionality.
 */
export enum OperationMode {
  /** Capture mode - lens extended, ready to take photos/videos */
  CAPTURE = 'capture',

  /** Playback mode - lens retracted, viewing existing media */
  PLAYBACK = 'playback',

  /**
   * BLE startup mode - initializing Bluetooth Low Energy connection
   *
   * Supported devices: GR III series, GR IV series
   */
  BLE_STARTUP = 'bleStartup',

  /** Other mode - e.g., in menu settings */
  OTHER = 'other',

  /**
   * Power off transfer mode - image transfer while off
   *
   * Supported devices: GR III series, GR IV series
   */
  POWER_OFF_TRANSFER = 'powerOffTransfer',
}

/**
 * Writable camera operation modes that can be set via API.
 */
export type WritableOperationMode =
  | OperationMode.CAPTURE
  | OperationMode.PLAYBACK;
