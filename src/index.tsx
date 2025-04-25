import axios, { type AxiosInstance } from 'axios';
import { EventEmitter } from 'events';
import { CameraEvents } from './CameraEvents';
export { CameraEvents }; // Explicitly import and re-export it
import type {
  IRicohCameraController,
  IDeviceInfo,
  ICaptureSettings,
} from './interfaces';
import { FOCUS_MODE_TO_COMMAND_MAP, GR_COMMANDS } from './Constants';
export { GR_COMMANDS, FOCUS_MODE_TO_COMMAND_MAP };
export type { IRicohCameraController, IDeviceInfo, ICaptureSettings }; // Explicitly import and re-export it
import { GR2Adapter, GR3Adapter } from './adapters';

interface IAdapterListener {
  event: string;
  handler: (...args: any[]) => void;
}

class RicohCameraController
  extends EventEmitter
  implements IRicohCameraController
{
  private readonly BASE_URL = 'http://192.168.0.1';
  private readonly DEFAULT_TIMEOUT_MS = 1000;
  private _intervalId: NodeJS.Timeout | null = null;
  private _apiClient: AxiosInstance;
  private adapter: IRicohCameraController | null = null;
  private adapterListeners: IAdapterListener[] = [];

  constructor() {
    super();

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
  }

  // #region Adapter: Camera Detections
  /**
   * Detects and inittializes the camera
   */
  async detectAndInitialize() {
    if (this.adapter == null) {
      this.getAllProperties().then((data) => {
        if ('model' in data) {
          this.stopCameraDetectionAndPairing();

          const isGR2 = data.model === 'GR II';

          this.adapter = isGR2 ? new GR2Adapter() : new GR3Adapter();

          this.forwardAdapterEvents([
            CameraEvents.Connected,
            CameraEvents.Disconnected,
            CameraEvents.CaptureSettingsChanged,
          ]);

          // this.emit(CameraEvents.Connected, data);
          this.adapter.once(CameraEvents.Disconnected, () => this.reset());

          this.adapter.startListeningToEvents();
        }
      });
    }
  }

  /**
   * Starts the camera detection and pairing process.
   *
   * Once a camera is detected, it attempts to automatically pair and connect to it.
   * Detection will stop after the first successful connection.
   *
   * Emits:
   * - 'connected' when a camera is successfully connected
   */
  startCameraDetectionAndPairing(): void {
    if (this._intervalId == null) {
      this._intervalId = setInterval(() => {
        this.detectAndInitialize();
      }, 1000);
    }
  }

  /**
   * Stops the camera detection and pairing process.
   */
  stopCameraDetectionAndPairing(): void {
    if (this._intervalId) {
      clearInterval(this._intervalId);
      this._intervalId = null;
    }
  }
  // #endregion

  // #region Adapter: Event Forwarding
  private forwardAdapterEvents(events: string[]) {
    for (const event of events) {
      const handler = (...args: any[]) => {
        this.emit(event, ...args);
      };
      this.adapter?.on(event, handler);
      this.adapterListeners.push({ event, handler });
    }
  }

  private cleanupListeners() {
    for (const { event, handler } of this.adapterListeners) {
      this.adapter?.off(event, handler);
    }
    this.adapterListeners = [];
  }
  // #endregion

  // #region Adapter: Safe Adapter
  /**
   * Safely retrieves the active adapter instance.
   *
   * If no adapter is currently set, this throws an error,
   * ensuring that downstream code never has to manually check
   * for null or undefined.
   *
   * Usage:
   *   this.safeAdapter.lockFocus(50, 50);
   *
   * @throws Error if no adapter is set
   * @returns The non-null adapter instance
   */
  private get safeAdapter(): IRicohCameraController {
    if (!this.adapter) {
      throw new Error('Camera not connected');
    }
    return this.adapter;
  }
  // #endregion

  // #region Getter methods to expose the variables

  /**
   * Indicates whether a camera is currently connected.
   * @returns {boolean} `true` if a camera is connected. Otherwise, returns `false`
   */
  get isConnected(): boolean {
    return this.adapter !== null && this.adapter.isConnected;
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
    if (this.adapter === null) {
      return null;
    }
    return this.adapter.info;
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
    if (this.adapter === null) {
      return null;
    }
    return this.adapter.captureSettings;
  }

  // #endregion

  getLiveViewURL(): string {
    return this.safeAdapter.getLiveViewURL();
  }

  // #region Camera Status
  /**
   * Get camera status
   *
   * @returns {Promise<any>} A promise that resolves with an object containing camera status.
   */
  async getStatus(): Promise<any> {
    return this.safeAdapter.getStatus();
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
    this.safeAdapter.lockFocus(x, y);
  }

  // #endregion

  // #region Capture Controls

  async capturePhoto(x: number | null, y: number | null): Promise<any> {
    return this.safeAdapter.capturePhoto(x, y);
  }

  // #endregion

  // #region Capture Settings
  /**
   * Retrieves the current capture settings of the camera.
   *
   * @returns {Promise<any>} A promise that resolves with an object containing capture settings.
   */
  async getCaptureSettings(): Promise<any> {
    return this.safeAdapter.getCaptureSettings();
  }

  /**
   * Sets the capture settings of the camera.
   *
   * @param {Record<string, any>} settings - An object containing the capture settings to be applied.
   * @returns {Promise<any>} A promise that resolves when the settings are successfully applied.
   */
  async setCaptureSettings(settings: Record<string, any>): Promise<any> {
    return this.safeAdapter.setCaptureSettings(settings);
  }

  /**
   * Retrieves the list of dial modes of the camera.
   *
   * @returns {string[]} The list of focus modes.
   */
  getDialModeList(): (string | null)[] {
    return this.safeAdapter.getDialModeList();
  }

  /**
   * Sets the dial mode.
   *
   * @param {string} mode - Dial mode name.
   * @returns {Promise<any>} A promise that resolves when the settings are successfully applied.
   */
  setDialMode(mode: string): Promise<any> {
    return this.safeAdapter.setDialMode(mode);
  }

  /**
   * Retrieves the list of focus modes of the camera.
   *
   * @returns {string[]} The list of focus modes.
   */
  getFocusModeList() {
    return this.safeAdapter.getFocusModeList();
  }

  /**
   * Sets the focus mode.
   *
   * @param {string} mode - Focus mode name.
   * @returns {Promise<any>} A promise that resolves when the settings are successfully applied.
   */
  setFocusMode(mode: string): Promise<any> {
    return this.safeAdapter.setFocusMode(mode);
  }
  // #endregion

  // #region Camera Settings

  /**
   * Retrieve all the properties of the device.
   *
   * @returns {Promise<any>} A promise that resolves with an object containing the device properties.
   */
  async getAllProperties(): Promise<any> {
    try {
      const response = await this._apiClient.get('/v1/props');
      return response.data;
    } catch (error) {
      throw error;
    }
  }
  // #endregion

  // #region Camera Display

  /**
   * Send a command to the device.
   *
   * @returns {Promise<any>} A promise that resolves with an object containing the device properties.
   */
  async sendCommand(command: string | GR_COMMANDS): Promise<any> {
    try {
      const response = await this._apiClient.post('/_gr', command);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Force refresh the display
  async refreshDisplay(): Promise<any> {
    try {
      const rawData = 'cmd=mode refresh';
      const response = await this._apiClient.post('/_gr', rawData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // #endregion

  // #region Other Functions

  private reset(): void {
    this.cleanupListeners();
    this.stopListeningToEvents();
    this.adapter = null;
  }

  disconnect(): void {
    if (this.isConnected) {
      this.reset();
      this.emit(CameraEvents.Disconnected);
    }
  }

  /**
   * Starts the polling process to periodically check for updates.
   */
  startListeningToEvents(): void {
    this.safeAdapter.startListeningToEvents();
  }

  /**
   * Stops the periodic updates when they are no longer needed.
   */
  stopListeningToEvents(): void {
    this.safeAdapter.stopListeningToEvents();
  }
  // #endregion
}

export default RicohCameraController;
