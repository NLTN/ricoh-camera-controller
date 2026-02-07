import axios, { type AxiosInstance } from 'axios';
import { EventEmitter } from 'events';
import { CameraEvents } from '../../core/enums/CameraEvents';
export { CameraEvents }; // Explicitly import and re-export it
import type {
  IRicohCameraController,
  IDeviceInfo,
  ICaptureSettings,
  IMediaList,
} from '../../core/interfaces';
import {
  findDifferences,
  hasAnyKey,
  type Difference,
} from '../../shared/utils/ObjectComparison';
import {
  shootModeLookup,
  shootModeReverseMap,
  type DriveMode,
  type TimerOption,
} from './ShootModeLookup';
import { EVENT_KEY_MAP } from '../../core/constants/EventMap';
import { Poller } from '../../shared/infrastructure/Poller';
import { PhotoSize } from '../../core/enums/PhotoSize';
import type { WritableOperationMode } from '../../core/enums/OperationMode';
export type { IRicohCameraController, IDeviceInfo, ICaptureSettings }; // Explicitly import and re-export it

class GR3Adapter extends EventEmitter implements IRicohCameraController {
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

  // #region Data
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

  // #region Device Management

  async getStatus(): Promise<any> {
    const response = await this._apiClient.get('/v1/ping');
    return response.data;
  }

  async setOperationMode(mode: WritableOperationMode): Promise<void> {
    const rawData = `operationMode=${mode}`;
    const response = await this._apiClient.put('/v1/params/device', rawData);
    return response.data;
  }

  async turnOff(): Promise<void> {
    const response = await this._apiClient.post('/v1/device/finish');
    if (response.data.errCode === 200) {
      return response.data;
    }
    throw new Error(response.data.errMsg);
  }

  // #endregion

  // #region Live View

  getLiveViewURL(): string {
    return `${this.BASE_URL}/v1/liveview`;
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
    const response = await this._apiClient.post('/v1/lens/focus', rawData);
    return response.data;
  }

  // #endregion

  // #region Capture Controls

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

  // #region Camera Properties & Settings

  async getAllProperties(): Promise<any> {
    const response = await this._apiClient.get('/v1/props');
    return response.data;
  }

  async getCaptureSettings(): Promise<any> {
    const response = await this._apiClient.get('/v1/props');
    return response.data;
  }

  async setCaptureSettings(settings: Record<string, any>): Promise<any> {
    // Convert the object to a query-like string
    const rawData = Object.entries(settings)
      .map(([key, value]) => `${key}=${value}`)
      .join('&');

    const response = await this._apiClient.put('/v1/params/camera', rawData);
    return response.data;
  }

  getDialModeList(): (string | null)[] {
    return ['U3', 'U2', 'U1', 'P', 'AV', 'TV', 'M', null];
  }

  async setDialMode(mode: string): Promise<any> {
    return this.sendCommand(`cmd=bdial ${mode}`);
  }

  getDriveModeList(): string[] {
    return Object.keys(shootModeLookup) as (keyof typeof shootModeLookup)[];
  }

  getDriveMode(): DriveMode {
    const shootMode = this._cachedDeviceInfo?.shootMode;
    if (shootMode !== undefined) {
      return shootModeReverseMap[shootMode]!.driveMode as DriveMode;
    } else {
      throw new Error(`Shoot mode "${shootMode}" not found.`);
    }
  }
  getSelfTimerOptionList(): string[] {
    const driveMode = this.getDriveMode();
    return Object.keys(shootModeLookup[driveMode]) as TimerOption<DriveMode>[];
  }

  getSelfTimerOption(): string {
    const shootMode = this._cachedDeviceInfo?.shootMode;
    if (shootMode !== undefined) {
      return shootModeReverseMap[shootMode]!.selfTimer;
    } else {
      throw new Error(`Shoot mode "${shootMode}" not found.`);
    }
  }

  async setShootMode<D extends DriveMode, T extends TimerOption<D>>(
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

  getFocusModeList() {
    const focusModes = this._cachedDeviceInfo?.focusSettingList;
    return focusModes !== undefined ? focusModes : [];
  }

  async setFocusMode(_: string): Promise<any> {
    return Promise.reject(
      new Error('setFocusMode() is not supported on Ricoh GR III')
    );
  }

  getFocusSetting() {
    const value = this._cachedDeviceInfo?.focusSetting;
    if (value !== undefined) {
      return value;
    }
    throw new Error('Focus Setting is not available');
  }

  // #endregion

  // #region Command

  async sendCommand(command: string): Promise<any> {
    const response = await this._apiClient.post('/_gr', command);
    return response.data;
  }

  /**
   * Force refresh the display.
   *
   * @throws This function is not supported on Ricoh GR III
   */
  async refreshDisplay(): Promise<any> {
    return Promise.reject(
      new Error('refreshDisplay() is not supported on Ricoh GR III')
    );
  }

  // #endregion

  // #region Media Files: Photos & Videos

  async getMediaList(): Promise<IMediaList> {
    const response = await this._apiClient.get('/v1/photos');
    if (response.data.errCode === 200) {
      return response.data;
    }
    throw new Error(response.data.errMsg);
  }

  getResizedPhotoURL(
    directory: string,
    filename: string,
    size: PhotoSize
  ): string {
    const url = `${this.BASE_URL}/v1/photos/${directory}/${filename}`;

    switch (size) {
      case PhotoSize.THUMBNAIL:
        return `${url}?size=thumb`;
      case PhotoSize.SMALL:
        return `${url}?size=view`;
      case PhotoSize.LARGE:
        return `${url}?size=xs`;
    }
  }

  getOriginalMediaURL(directory: string, filename: string): string {
    return `${this.BASE_URL}/v1/photos/${directory}/${filename}`;
  }

  // #endregion

  // #region Helpers
  private dispatchChangedEvents(differences: Record<string, Difference>) {
    // Event: Capture Settings Changed
    if (hasAnyKey(differences, EVENT_KEY_MAP.CaptureSettingsChanged)) {
      this.emit(CameraEvents.CaptureSettingsChanged, this.info, differences);
    }

    // Event: Lens Focus Changed
    if (hasAnyKey(differences, EVENT_KEY_MAP.FocusChanged)) {
      this.emit(CameraEvents.FocusChanged, this.info, differences);
    }

    // Event: Storage Changed
    if (hasAnyKey(differences, EVENT_KEY_MAP.StorageChanged)) {
      this.emit(CameraEvents.StorageChanged, this.info, differences);
    }

    // Event: Camera orientation change
    if (hasAnyKey(differences, EVENT_KEY_MAP.OrientationChanged)) {
      this.emit(CameraEvents.OrientationChanged, this.info, differences);
    }
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

export default GR3Adapter;
