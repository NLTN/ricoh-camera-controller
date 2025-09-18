import { EventEmitter } from 'events';
import type { GR_COMMANDS } from './Constants';
import type { PhotoSize } from './enums/PhotoSize';

export interface IRicohCameraController extends EventEmitter {
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

  /**
   * Returns the URL for the live view stream.
   *
   * @returns {string} The full URL for accessing the live view endpoint.
   */
  getLiveViewURL(): string;

  /**
   * Get camera status
   *
   * @returns {Promise<any>} A promise that resolves with an object containing camera status.
   */
  getStatus(): Promise<any>;

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
}

export interface IDeviceInfo extends ICaptureSettings {
  /** List of resolutions. */
  resoList: string[];

  /** List of supported shooting modes. */
  shootModeList: string[];

  /** List of supported white balance modes. */
  WBModeList: string[];

  /** List of supported metering modes. */
  meteringModeList: string[];

  /** List of supported effects. */
  effectList: string[];

  /** List of supported exposure modes (e.g., "auto", "P", "TV", "AV"). */
  exposureModeList: string[];

  /** List of supported photo sizes. */
  stillSizeList: string[];

  /** Movie sizes */
  movieSizeList: string[];

  /** Model (e.g., "GR II", "GR III")*/
  model: string;

  /** Firmware Version (e.g., "03.00")*/
  firmwareVersion: string;

  /** MAC Address */
  macAddress: string;

  /** Device Serial Number */
  serialNo: string;

  /** List of WiFi channels. */
  channelList: number[];

  /** List of aperture values (e.g., "2.8", "4.0")  */
  avList: string[];

  /** List of time values, also referred to as Shutter Speeds. */
  tvList: string[];

  /** List of sensitivity values, also referred to as ISO values. */
  svList: string[];

  /**  List of exposure values (e.g., "-0.7", "-0.3", "0.0", "+0.3", "+0.7"). */
  xvList: string[];

  /** List of flash exposure values: (e.g., "-0.7", "-0.3", "0.0", "+0.3", "+0.7"). */
  flashxvList: string[];

  /** Current state (e.g., "Idle"). */
  state: string;

  /** Indicates whether the element is focused. */
  focused: boolean;

  /** Indicates whether the focus is locked. */
  focusLocked: boolean;

  /** Battery level, represented as a value ranging from 0 to 100. */
  battery: number;

  /** Camera Orientation values: positive, vertical_left, vertical_right, reverse.
   *
   * Supported cameras: GR III, GR IIIx
   */
  cameraOrientation: string;
}

export interface ICaptureSettings {
  av: string;
  tv: string;
  sv: string;
  xv: string;
  flashxv: string;
  shootMode: string;
  WBMode: string;
  exposureMode: string;
  meteringMode: string;
  effect: string;
  stillSize: string;
  movieSize: string;
  focusMode: string;

  /** Focus setting (e.g., "multiauto", "spot", "pinpoint", "snap", "inf").
   *
   * Supported devices: GRII*/
  AFMode: string;

  /** Focus setting (e.g., "multiauto", "spot", "pinpoint", "snap", "inf").
   *
   * Supported devices: GRIII & GR IIIx */
  focusSetting: string;

  ssid: string;
  key: string;
  channel: number;
  //   datetime: string; // ISO 8601 formatted date-time string
}
