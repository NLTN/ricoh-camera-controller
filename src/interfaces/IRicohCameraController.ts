import { EventEmitter } from 'events';
import type { IDeviceInfo } from './IDeviceInfo';
import type { ICaptureSettings } from './ICaptureSettings';
import type { GR_COMMANDS } from '../Constants';
import type { PhotoSize } from '../enums/PhotoSize';
import type { WritableOperationMode } from '../enums/OperationMode';

export interface IRicohCameraController extends EventEmitter {
  // #region Data

  /**
   * Indicates whether a camera is currently connected.
   * @returns {boolean} `true` if a camera is connected. Otherwise, returns `false`
   */
  get isConnected(): boolean;

  /**
   * Retrieves the cached device information.
   *
   * @returns {IDeviceInfo | null} The cached device information. Returns `null` if no
   * device information is currently cached.
   */
  get info(): IDeviceInfo | null;

  /**
   * Retrieves the cached capture settings.
   *
   * @returns {ICaptureSettings | null} The cached capture settings. Returns `null` if no
   * capture settings are currently cached.
   */
  get captureSettings(): ICaptureSettings | null;

  // #endregion

  // #region Device Management

  /**
   * Get camera status
   *
   * @returns {Promise<any>} A promise that resolves with an object containing camera status.
   */
  getStatus(): Promise<any>;

  /**
   * Sets the camera operation mode.
   *
   * @param mode - The target operation mode to switch to
   * @returns Promise resolving to the API response data
   * @throws Error if the API request fails or the mode is invalid
   *
   * **Example usage:**
   * ```typescript
   * // Switch to capture mode
   * await setOperationMode(OperationMode.CAPTURE);
   * ```
   */
  setOperationMode(mode: WritableOperationMode): Promise<void>;

  /**
   * Turns off the camera.
   *
   * @returns Promise resolving to void when the camera has been turned off
   * @throws Error if the API request fails
   */
  turnOff(): Promise<void>;

  // #endregion

  // #region Camera Functions

  /**
   * Returns the URL for the live view stream.
   *
   * @returns {string} The full URL for accessing the live view endpoint.
   */
  getLiveViewURL(): string;

  /**
   * Retrieves the list of dial modes of the camera.
   *
   * @returns {string[]} The list of focus modes.
   */
  getDialModeList(): (string | null)[];

  /**
   * Sets the dial mode.
   *
   * @param {string} mode - Dial mode name.
   * @returns {Promise<any>} A promise that resolves when the settings are successfully applied.
   */
  setDialMode(mode: string): Promise<any>;

  /**
   * Retrieves the list of drive modes of the camera.
   *
   * @returns {string[]} The list of drive modes.
   */
  getDriveModeList(): string[];

  /**
   * Retrieves the currently selected drive mode.
   *
   * @returns The name of the current drive mode (e.g., "single", "continuous").
   * @throws Error if the shoot mode is not found.
   */
  getDriveMode(): string;

  /**
   * Returns the list of supported self-timer options for the selected drive mode.
   *
   * @returns An array of timer option keys (e.g. "off", "2s", "10s") supported by the selected drive mode.
   *
   * Example:
   * ```ts
   * getSelfTimerOptionList(); // ["off", "2s", "10s"]
   * ```
   */
  getSelfTimerOptionList(): string[];

  /**
   * Retrieves the currently selected self-timer option.
   *
   * @returns {string} The current self-timer option (e.g., "off", "2s", "10s").
   * @throws Error if the shoot mode is not found.
   */
  getSelfTimerOption(): string;

  /**
   * Sets the shoot mode / drive mode / self timer.
   *
   * @param {string} driveMode - Drive mode.
   * @param {string} selfTimerOption - Self-timer option.
   * @returns {Promise<any>} A promise that resolves when the settings are successfully applied.
   */
  setShootMode(driveMode: string, selfTimerOption: string): Promise<any>;

  /**
   * Retrieves the list of focus modes of the camera.
   *
   * @returns {string[]} The list of focus modes.
   */
  getFocusModeList(): string[];

  /**
   * Sets the focus mode.
   *
   * @param {string} mode - Focus mode name.
   * @returns {Promise<any>} A promise that resolves when the settings are successfully applied.
   */
  setFocusMode(mode: string): Promise<any>;

  /**
   * Retrieves the current of focus setting of the camera.
   * (e.g., "multiauto", "spot", "pinpoint", "snap", "inf").
   *
   * @returns {string} The current focus setting.
   */
  getFocusSetting(): string;

  /**
   * Locks the camera focus at a specific area within the frame.
   *
   * This function instructs the camera to focus on a specific point in the frame,
   * where `x` and `y` are expressed as percentages (0 to 100) of the frame's width and height.
   * For example, (50, 50) would lock focus at the center of the frame.
   *
   * @param x - The horizontal percentage (0 to 100) representing the focus point in the frame.
   * @param y - The vertical percentage (0 to 100) representing the focus point in the frame.
   * @returns A promise that resolves when the focus is successfully locked.
   */
  lockFocus(x: number, y: number): Promise<any>;

  /**
   * Captures a photo using provided coordinates.
   *
   * @param {number | null} x The x-coordinate (optional).
   * @param {number | null} y The y-coordinate (optional).
   * @returns {Promise<any>} A promise resolving with the result of the capture.
   */
  capturePhoto(x: number | null, y: number | null): Promise<any>;

  /**
   * Retrieves the current capture settings of the camera.
   *
   * @returns {Promise<any>} A promise that resolves with an object containing capture settings.
   */
  getCaptureSettings(): Promise<any>;

  /**
   * Sets the capture settings of the camera.
   *
   * @param {Record<string, any>} settings - An object containing the capture settings to be applied.
   * @returns {Promise<any>} A promise that resolves when the settings are successfully applied.
   */
  setCaptureSettings(settings: Record<string, any>): Promise<any>;

  /**
   * Retrieve all the properties of the device.
   *
   * @returns {Promise<any>} A promise that resolves with an object containing the device properties.
   */
  getAllProperties(): Promise<any>;

  /**
   * Force refresh the camera display.
   * Useful when the camera display is out of sync after changing certain settings.
   *
   * Supported device: Ricoh GR II only.
   *
   * @returns A promise that resolves once the refresh operation is complete.
   */
  refreshDisplay(): Promise<any>;

  /**
   * Send a command to the device.
   *
   * @returns {Promise<any>} A promise that resolves with an object containing the device properties.
   */
  sendCommand(command: string | GR_COMMANDS): Promise<any>;

  /**
   * Retrieves a list of available media files and directories on the camera.
   *
   * @returns {Promise<any>} A promise that resolves with an object containing the available media files.
   */
  getMediaList(): Promise<any>;

  /**
   * Retrieves a URL for accessing a compressed photo from the given directory and filename.
   *
   * **IMPORTANT NOTES**
   * - The returned URL will be of a resized JPG photo, not the original full-resolution image.
   *
   * **LIMITATIONS**
   * - For Ricoh GR II cameras, using `PhotoSize.LARGE` is equivalent to using `PhotoSize.SMALL`
   *    because this camera model does not support generating light-weight large-sized photos.
   * @param {string} directory - The path to the directory containing the media file.
   * @param {string} filename - The name of the media file (including extension).
   * @param {PhotoSize} size - The desired size for the photo ('thumbnail', 'small', or 'large').
   * @returns {string} A string representing the URL for accessing the resized photo.
   * 
   * Example usage:
   * ```typescript
    const camera = new RicohCameraController();
    const imageUrl = camera.getResizedPhotoURL('425_0914', 'R0178820.JPG', PhotoSize.THUMB);
    console.log(imageUrl); // Output: http://192.168.0.1/v1/photos/425_0914/R0178820.JPG?size=thumb
   */
  getResizedPhotoURL(
    directory: string,
    filename: string,
    size: PhotoSize
  ): string;

  /**
   * Retrieves a URL for accessing an original media file from the given directory and filename.
   *
   * **IMPORTANT NOTES**
   * - The returned URL can be of type JPG, DNG, or video (e.g., MOV).
   * @param {string} directory - The path to the directory containing the media file.
   * @param {string} filename - The name of the media file (including extension).
   * @returns {string} A string representing the URL for accessing the original media file.
   */
  getOriginalMediaURL(directory: string, filename: string): string;

  // #endregion

  // #region Polling Functions

  /**
   * Starts the polling process to periodically check for updates.
   */
  startListeningToEvents(): void;

  /**
   * Stops the periodic updates when they are no longer needed.
   */
  stopListeningToEvents(): void;

  /**
   * Sets the polling interval for fetching data.
   *
   * @param ms - New polling interval in milliseconds
   */
  setPollInterval(ms: number): void;

  /**
   * Temporarily changes the polling interval for fetching data
   * for a fixed number of cycles before reverting to the default.
   *
   * @param ms - Temporary polling interval in milliseconds
   * @param cycles - Number of polling cycles to run at the temporary interval
   * @throws If `cycles` is not an integer ≥ 1
   */
  setPollIntervalTemporarily(ms: number, cycles: number): void;

  // #endregion
}
