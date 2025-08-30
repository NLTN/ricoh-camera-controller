import axios, { type AxiosInstance } from 'axios';
import { EventEmitter } from 'events';
import { CameraEvents } from '../CameraEvents';
export { CameraEvents }; // Explicitly import and re-export it
import type {
  IRicohCameraController,
  IDeviceInfo,
  ICaptureSettings,
} from '../interfaces';
import { findDifferences } from '../utils';
import {
  shootModeLookup,
  shootModeReverseMap,
  type DriveMode,
  type TimerOption,
} from '../GR3/shootModeLookup';
import { FOCUS_MODE_TO_COMMAND_MAP, GR_COMMANDS } from '../Constants';
export { GR_COMMANDS, FOCUS_MODE_TO_COMMAND_MAP };
export type { IRicohCameraController, IDeviceInfo, ICaptureSettings }; // Explicitly import and re-export it

class GR3Adapter extends EventEmitter implements IRicohCameraController {
  private readonly BASE_URL = 'http://192.168.0.1';
  private readonly DEFAULT_TIMEOUT_MS = 1000;
  private _intervalId: NodeJS.Timeout | null = null;
  private _apiClient: AxiosInstance;
  private _isConnected: boolean = false;
  private _cachedDeviceInfo: IDeviceInfo | null;
  private _cachedCaptureSettings: ICaptureSettings | null;

  constructor() {
    super();
    // Initial values
    this._cachedDeviceInfo = null;
    this._cachedCaptureSettings = null;

    // API Client
    this._apiClient = axios.create({
      baseURL: this.BASE_URL,
      headers: {
        'Accept': '*/*',
        'Accept-Language': 'en-US,en;q=0.9,vi;q=0.8',
        'Connection': 'keep-alive',
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      },
      timeout: this.DEFAULT_TIMEOUT_MS,
    });

    this.startListeningToEvents();
  }

  // #region Getter methods to expose the variables

  /**
   * Indicates whether a camera is currently connected.
   * @returns {boolean} `true` if a camera is connected. Otherwise, returns `false`
   */
  get isConnected(): boolean {
    return this._isConnected;
  }

  /**
   * Retrieves the cached device information.
   *
   * This function returns the stored device information, which is intended
   * to be a cached copy of data fetched from the camera.
   * Accessing this cache avoids redundant computations or network requests.
   *
   * @returns {IDeviceInfo | null} The cached device information. Returns `null` if no
   * device information is currently cached.
   */
  get info(): IDeviceInfo | null {
    return this._cachedDeviceInfo;
  }

  /**
   * Retrieves the cached capture settings.
   *
   * This function returns the stored capture settings, which are intended
   * to be a cached copy of settings obtained from the camera.
   * Accessing this cache avoids redundant computations or external calls.
   *
   * @returns {ICaptureSettings | null} The cached capture settings. Returns `null` if no
   * capture settings are currently cached.
   */
  get captureSettings(): ICaptureSettings | null {
    return this._cachedCaptureSettings;
  }

  // #endregion

  getLiveViewURL(): string {
    return `${this.BASE_URL}/v1/liveview`;
  }

  // #region Camera Status
  /**
   * Get camera status
   *
   * @returns {Promise<any>} A promise that resolves with an object containing camera status.
   */
  async getStatus(): Promise<any> {
    const response = await this._apiClient.get('/v1/ping');
    return response.data;
  }
  // #endregion

  // #region Lens Focus Controls

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
  async lockFocus(x: number, y: number): Promise<any> {
    // Validation: Value Constraints
    // Throw an error if `x` or `y` is outside the range of 0 to 100.
    if (x < 0 || x > 100 || y < 0 || y > 100) {
      throw new Error(
        `Invalid focus coordinates: x=${x}, y=${y}. Values must be between 0 and 100 (inclusive).`
      );
    }

    // Convert x and y to integers
    x = Math.round(x);
    y = Math.round(y);

    // Send request
    const rawData = `pos=${x},${y}`;
    const response = await this._apiClient.post('/v1/lens/focus', rawData);
    return response.data;
  }

  // #endregion

  // #region Capture Controls

  /**
   * Captures a photo, optionally with x, y coordinates
   *
   * @param {number | null} x The x-coordinate of the photo. If null, coordinates are not specified.
   * @param {number | null} y The y-coordinate of the photo. If null, coordinates are not specified.
   * @returns {Promise<any>} A promise that resolves with the response data from the camera API.
   * @throws {Error} If there is an error during the API request.
   */
  async capturePhoto(x: number | null, y: number | null): Promise<any> {
    if (x != null && y != null) {
      const rawData = `pos=${x},${y}&af=on`;
      const response = await this._apiClient.post('/v1/camera/shoot', rawData);
      return response.data;
    } else {
      const response = await this._apiClient.post('/v1/camera/shoot');
      return response.data;
    }
  }

  // #endregion

  // #region Capture Settings
  /**
   * Retrieves the current capture settings of the camera.
   *
   * @returns {Promise<any>} A promise that resolves with an object containing capture settings.
   */
  async getCaptureSettings(): Promise<any> {
    const response = await this._apiClient.get('/v1/props');
    return response.data;
  }

  /**
   * Sets the capture settings of the camera.
   *
   * @param {Record<string, any>} settings - An object containing the capture settings to be applied.
   * @returns {Promise<any>} A promise that resolves when the settings are successfully applied.
   */
  async setCaptureSettings(settings: Record<string, any>): Promise<any> {
    // Convert the object to a query-like string
    const rawData = Object.entries(settings)
      .map(([key, value]) => `${key}=${value}`)
      .join('&');

    const response = await this._apiClient.put('/v1/params/camera', rawData);
    return response.data;
  }

  /**
   * Retrieves the list of dial modes of the camera.
   *
   * @returns {string[]} The list of focus modes.
   */
  getDialModeList(): (string | null)[] {
    return ['U3', 'U2', 'U1', 'P', 'AV', 'TV', 'M', null];
  }

  /**
   * Sets the dial mode.
   *
   * @param {string} mode - Dial mode name.
   * @returns {Promise<any>} A promise that resolves when the settings are successfully applied.
   */
  setDialMode(mode: string): Promise<any> {
    return this.sendCommand(`cmd=bdial ${mode}`);
  }

  /**
   * Retrieves the list of drive modes of the camera.
   *
   * @returns {string[]} The list of drive modes.
   */
  getDriveModeList(): string[] {
    return Object.keys(shootModeLookup) as (keyof typeof shootModeLookup)[];
  }

  /**
   * Retrieves the currently selected drive mode.
   *
   * @returns The name of the current drive mode (e.g., "single", "continuous").
   * @throws Error if the shoot mode is not found.
   */
  getDriveMode(): DriveMode {
    const shootMode = this._cachedCaptureSettings?.shootMode;
    if (shootMode !== undefined) {
      return shootModeReverseMap[shootMode]!.driveMode as DriveMode;
    } else {
      throw new Error(`Shoot mode "${shootMode}" not found.`);
    }
  }

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
  getSelfTimerOptionList(): string[] {
    const driveMode = this.getDriveMode();
    return Object.keys(shootModeLookup[driveMode]) as TimerOption<DriveMode>[];
  }

  /**
   * Retrieves the currently selected self-timer option.
   *
   * @returns {string} The current self-timer option (e.g., "off", "2s", "10s").
   * @throws Error if the shoot mode is not found.
   */
  getSelfTimerOption(): string {
    const shootMode = this._cachedCaptureSettings?.shootMode;
    if (shootMode !== undefined) {
      return shootModeReverseMap[shootMode]!.selfTimer;
    } else {
      throw new Error(`Shoot mode "${shootMode}" not found.`);
    }
  }

  /**
   * Sets the shoot mode / drive mode / self timer.
   *
   * @param {DriveMode} driveMode - Drive mode.
   * @param {TimerOption} selfTimerOption - Self-timer option.
   * @returns {Promise<any>} A promise that resolves when the settings are successfully applied.
   */
  setShootMode<D extends DriveMode, T extends TimerOption<D>>(
    driveMode: D,
    selfTimerOption: T
  ): Promise<any> {
    const supportedSelfTimerOptions = Object.keys(
      shootModeLookup[driveMode]
    ) as string[];

    if (supportedSelfTimerOptions.includes(selfTimerOption as string)) {
      const shootMode = shootModeLookup[driveMode][selfTimerOption];
      return this.setCaptureSettings({ shootMode: shootMode });
    } else {
      const shootMode = shootModeLookup[driveMode].off;
      return this.setCaptureSettings({ shootMode: shootMode });
    }
  }

  /**
   * Retrieves the list of focus modes of the camera.
   *
   * @returns {string[]} The list of focus modes.
   */
  getFocusModeList() {
    return Object.keys(FOCUS_MODE_TO_COMMAND_MAP);
  }

  /**
   * Sets the focus mode.
   *
   * @param {string} mode - Focus mode name.
   * @returns {Promise<any>} A promise that resolves when the settings are successfully applied.
   */
  setFocusMode(mode: string): Promise<any> {
    const command = Object.entries(FOCUS_MODE_TO_COMMAND_MAP).find(
      ([key, _]) => key === mode
    );

    if (command !== undefined) {
      return this.sendCommand(command[1]);
    } else {
      return Promise.reject(new Error('Invalid focus mode'));
    }
  }
  // #endregion

  // #region Camera Settings

  /**
   * Retrieve all the properties of the device.
   *
   * @returns {Promise<any>} A promise that resolves with an object containing the device properties.
   */
  async getAllProperties(): Promise<any> {
    const response = await this._apiClient.get('/v1/props');
    return response.data;
  }
  // #endregion

  // #region Camera Display

  /**
   * Send a command to the device.
   *
   * @returns {Promise<any>} A promise that resolves with an object containing the device properties.
   */
  async sendCommand(command: string | GR_COMMANDS): Promise<any> {
    const response = await this._apiClient.post('/_gr', command);
    return response.data;
  }

  // Force refresh the display
  async refreshDisplay(): Promise<any> {
    return Promise.reject(
      new Error('refreshDisplay() is not supported on Ricoh GR III')
    );
  }

  // #endregion

  // #region Polling Functions
  /**
   * Checks and updates the camera's connection status and settings.
   *
   * - If connected, fetches capture settings and updates the cache. On success, emits
   *   `CaptureSettingsChanged`; on failure, resets the cache and emits `Disconnected`.
   * - If disconnected, attempts to retrieve all properties. On success, marks the
   *   camera as connected and emits `Connected`; otherwise, remains disconnected.
   */
  private fetchData(): void {
    if (this._isConnected) {
      this.getCaptureSettings()
        .then((data) => {
          // Compare and raise an event if there is a change
          const result = findDifferences(
            this._cachedCaptureSettings ?? {},
            data,
            ['datetime', 'storages']
          );
          if (result.size > 0) {
            this._cachedCaptureSettings = data;
            this.emit(
              CameraEvents.CaptureSettingsChanged,
              data,
              result.differences
            );
          }
        })
        .catch((_) => {
          this.disconnect();
        });
    } else {
      // Attempt to retrieve all properties and store the data in the cache.
      // If successful, the device is considered connected, and an event is raised.
      // Otherwise, an error occurs, indicating that the device is not connected.
      this.getAllProperties().then((data) => {
        this._isConnected = true;
        this._cachedDeviceInfo = data;
        this._cachedCaptureSettings = data;
        this.emit(CameraEvents.Connected, this._cachedDeviceInfo);
      });
    }
  }

  disconnect(): void {
    this._isConnected = false;
    this._cachedDeviceInfo = null;
    this._cachedCaptureSettings = null;
    this.stopListeningToEvents();
    this.emit(CameraEvents.Disconnected);
  }

  /**
   * Starts the polling process to periodically check for updates.
   */
  startListeningToEvents(): void {
    if (this._intervalId == null) {
      this.fetchData();

      this._intervalId = setInterval(() => {
        this.fetchData();
      }, 2000);
    }
  }

  /**
   * Stops the periodic updates when they are no longer needed.
   */
  stopListeningToEvents(): void {
    if (this._intervalId) {
      clearInterval(this._intervalId);
      this._intervalId = null;
    }
  }
  // #endregion
}

export default GR3Adapter;
