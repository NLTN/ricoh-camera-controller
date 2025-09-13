import axios, { type AxiosInstance } from 'axios';
import { EventEmitter } from 'events';
import { CameraEvents } from '../CameraEvents';
export { CameraEvents }; // Explicitly import and re-export it
import type {
  IRicohCameraController,
  IDeviceInfo,
  ICaptureSettings,
} from '../interfaces';
import { findDifferences, hasAnyKey, type Difference } from '../utils';
import { FOCUS_MODE_TO_COMMAND_MAP, GR_COMMANDS } from '../Constants';
import { EVENT_KEY_MAP } from '../eventMap';
import { Poller } from '../Poller';
export { GR_COMMANDS, FOCUS_MODE_TO_COMMAND_MAP };
export type { IRicohCameraController, IDeviceInfo, ICaptureSettings }; // Explicitly import and re-export it

class GR2Adapter extends EventEmitter implements IRicohCameraController {
  private readonly BASE_URL = 'http://192.168.0.1';
  private readonly DEFAULT_TIMEOUT_MS = 1000;
  private _poller: Poller;
  private _apiClient: AxiosInstance;
  private _isConnected: boolean = false;
  private _cachedDeviceInfo: IDeviceInfo | null;

  constructor() {
    super();
    // Initial values
    this._cachedDeviceInfo = null;

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

    this._poller = new Poller(() => this.fetchData(), 2000);
    this._poller.start(); // this.startListeningToEvents();
  }

  // #region Getter methods to expose the variables

  get isConnected(): boolean {
    return this._isConnected;
  }

  /**
   * Returns the stored device information, which is intended
   * to be a cached copy of data fetched from the camera.
   * Accessing this cache avoids redundant computations or network requests.
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
    return this._cachedDeviceInfo;
  }

  // #endregion

  getLiveViewURL(): string {
    return `${this.BASE_URL}/v1/display`;
  }

  // #region Camera Status
  async getStatus(): Promise<any> {
    const response = await this._apiClient.get('/v1/ping');
    return response.data;
  }
  // #endregion

  // #region Lens Focus Controls

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
    const response = await this._apiClient.post('/v1/lens/focus/lock', rawData);
    return response.data;
  }

  // #endregion

  // #region Capture Controls

  async capturePhoto(x: number | null, y: number | null): Promise<any> {
    if (x != null && y != null) {
      const rawData = `pos=${x},${y}`;
      const response = await this._apiClient.post('/v1/camera/shoot', rawData);
      return response.data;
    } else {
      const response = await this._apiClient.post('/v1/camera/shoot');
      return response.data;
    }
  }

  // #endregion

  // #region Camera Properties & Settings
  async getAllProperties(): Promise<any> {
    const response = await this._apiClient.get('/v1/props');
    return response.data;
  }

  async getCaptureSettings(): Promise<any> {
    const response = await this._apiClient.get('/v1/params');
    return response.data;
  }

  async setCaptureSettings(settings: Record<string, any>): Promise<any> {
    // Convert the object to a query-like string
    const rawData = Object.entries(settings)
      .map(([key, value]) => `${key}=${value}`)
      .join('&');

    const response = await this._apiClient.put('/v1/params/camera', rawData);
    await this.refreshDisplay();
    return response.data;
  }

  getDialModeList(): (string | null)[] {
    return ['Auto', 'P', 'AV', 'TV', 'TAV', 'M', 'MOV', 'MY3', 'MY2', 'MY1'];
  }

  async setDialMode(mode: string): Promise<any> {
    if (mode === 'MOV') mode = 'movie';
    return this.sendCommand(`cmd=bdial ${mode}`);
  }

  getDriveModeList() {
    return ['single', 'intervalComp', 'interval', 'continuous', 'bracket'];
  }

  getDriveMode(): string {
    throw new Error('getDriveMode() is not supported on Ricoh GR II');
  }

  getSelfTimerOptionList(): string[] {
    throw new Error('getSelfTimerOptionList() is not supported on Ricoh GR II');
  }

  getSelfTimerOption(): string {
    throw new Error('getSelfTimerOption() is not supported on Ricoh GR II');
  }

  async setShootMode(
    _driveMode: string,
    _selfTimerOption: string
  ): Promise<any> {
    return Promise.reject(
      new Error('setShootMode() is not supported on Ricoh GR II')
    );
  }

  getFocusModeList() {
    return Object.keys(FOCUS_MODE_TO_COMMAND_MAP);
  }

  async setFocusMode(mode: string): Promise<any> {
    const command = Object.entries(FOCUS_MODE_TO_COMMAND_MAP).find(
      ([key, _]) => key === mode
    );

    if (command !== undefined) {
      return this.sendCommand(command[1]);
    } else {
      return Promise.reject(new Error('Invalid focus mode'));
    }
  }

  getFocusSetting() {
    const value = this._cachedDeviceInfo?.AFMode;
    if (value !== undefined) {
      return value;
    }
    throw new Error('Focus Setting is not available');
  }

  // #endregion

  // #region Others

  async sendCommand(command: string | GR_COMMANDS): Promise<any> {
    const response = await this._apiClient.post('/_gr', command);
    return response.data;
  }

  async refreshDisplay(): Promise<any> {
    const rawData = 'cmd=mode refresh';
    const response = await this._apiClient.post('/_gr', rawData);
    return response.data;
  }

  // #endregion

  // #region Helpers
  private dispatchChangedEvents(differences: Record<string, Difference>) {
    // Event: Capture settings change
    if (hasAnyKey(differences, EVENT_KEY_MAP.CaptureSettingsChanged)) {
      this.emit(CameraEvents.CaptureSettingsChanged, this.info, differences);
    }
    // Event: Lens focus change
    if (hasAnyKey(differences, EVENT_KEY_MAP.FocusChanged)) {
      this.emit(CameraEvents.FocusChanged, this.info, differences);
    }

    // Event: Camera orientation change
    // Not supported on Ricoh GR II
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
      this.getAllProperties()
        .then((data) => {
          // Compare and raise an event if there is a change
          const result = findDifferences(this._cachedDeviceInfo ?? {}, data, [
            'datetime',
            'storages',
          ]);
          if (result.size > 0) {
            this._cachedDeviceInfo = data;
            this.dispatchChangedEvents(result.differences);
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
        this.emit(CameraEvents.Connected, this._cachedDeviceInfo);
      });
    }
  }

  disconnect(): void {
    this._isConnected = false;
    this._cachedDeviceInfo = null;
    this.stopListeningToEvents();
    this.emit(CameraEvents.Disconnected);
  }

  /**
   * Starts the polling process to periodically check for updates.
   */
  startListeningToEvents(): void {
    this._poller.start();
  }

  /**
   * Stops the periodic updates when they are no longer needed.
   */
  stopListeningToEvents(): void {
    this._poller.stop();
  }

  /**
   * Sets the polling interval for fetching data.
   * Delegates to the underlying Poller to restart with the new interval if active.
   *
   * @param ms - New polling interval in milliseconds
   */
  setPollInterval(ms: number): void {
    this._poller.setIntervalMs(ms);
  }

  /**
   * Temporarily changes the polling interval for fetching data
   * for a fixed number of cycles before reverting to the default.
   * Delegates to the underlying Poller to restart with the new interval if active.
   *
   * @param ms - Temporary polling interval in milliseconds
   * @param cycles - Number of polling cycles to run at the temporary interval
   * @throws If `cycles` is not an integer ≥ 1
   */
  setPollIntervalTemporarily(ms: number, cycles: number): void {
    this._poller.setIntervalTemporarily(ms, cycles);
  }
  // #endregion
}

export default GR2Adapter;
