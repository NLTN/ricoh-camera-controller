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
import type { PhotoSize } from './enums/PhotoSize';
export * from './enums/PhotoSize';

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
      this.getAllProperties()
        .then((data) => {
          if ('model' in data) {
            this.stopCameraDetectionAndPairing();

            const isGR2 = data.model === 'GR II';

            this.adapter = isGR2 ? new GR2Adapter() : new GR3Adapter();

            this.forwardAdapterEvents(Object.values(CameraEvents));

            // this.emit(CameraEvents.Connected, data);
            this.adapter.once(CameraEvents.Disconnected, () => this.reset());

            this.adapter.startListeningToEvents();
          }
        })
        .catch((error) => {
          if (!axios.isAxiosError(error)) {
            throw error;
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
  /**
   * Subscribes and forwards all the events from the adapter events to the consumers.
   *
   * @param {string[]} events - List of event names to forward (e.g., from CameraEvents).
   */
  private forwardAdapterEvents(events: string[]) {
    for (const event of events) {
      const handler = (...args: any[]) => {
        this.emit(event, ...args);
      };
      this.adapter?.on(event, handler);
      this.adapterListeners.push({ event, handler });
    }
  }

  /**
   * Removes all previously registered adapter event listeners and clears the list.
   */
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

  // #region Delegates - Getter methods to expose variables

  get isConnected(): boolean {
    return this.adapter !== null && this.adapter.isConnected;
  }

  get info(): IDeviceInfo | null {
    if (this.adapter === null) {
      return null;
    }
    return this.adapter.info;
  }

  get captureSettings(): ICaptureSettings | null {
    if (this.adapter === null) {
      return null;
    }
    return this.adapter.captureSettings;
  }

  // #endregion

  // #region Delegates the command to the detected adapter

  getLiveViewURL(): string {
    return this.safeAdapter.getLiveViewURL();
  }

  async getStatus(): Promise<any> {
    return this.safeAdapter.getStatus();
  }

  async lockFocus(x: number, y: number): Promise<any> {
    return this.safeAdapter.lockFocus(x, y);
  }

  async capturePhoto(
    x: number | null = null,
    y: number | null = null
  ): Promise<any> {
    return this.safeAdapter.capturePhoto(x, y);
  }

  async getCaptureSettings(): Promise<any> {
    return this.safeAdapter.getCaptureSettings();
  }

  async setCaptureSettings(settings: Record<string, any>): Promise<any> {
    return this.safeAdapter.setCaptureSettings(settings);
  }

  getDialModeList(): (string | null)[] {
    return this.safeAdapter.getDialModeList();
  }

  async setDialMode(mode: string): Promise<any> {
    return this.safeAdapter.setDialMode(mode);
  }

  getDriveModeList(): string[] {
    return this.safeAdapter.getDriveModeList();
  }

  getDriveMode(): string {
    return this.safeAdapter.getDriveMode();
  }

  getSelfTimerOptionList(): string[] {
    return this.safeAdapter.getSelfTimerOptionList();
  }

  getSelfTimerOption(): string {
    return this.safeAdapter.getSelfTimerOption();
  }

  async setShootMode(driveMode: string, selfTimerOption: string): Promise<any> {
    return this.safeAdapter.setShootMode(driveMode, selfTimerOption);
  }

  getFocusModeList() {
    return this.safeAdapter.getFocusModeList();
  }

  async setFocusMode(mode: string): Promise<any> {
    return this.safeAdapter.setFocusMode(mode);
  }

  getFocusSetting(): string {
    return this.safeAdapter.getFocusSetting();
  }

  async getAllProperties(): Promise<any> {
    const response = await this._apiClient.get('/v1/props');
    return response.data;
  }

  async sendCommand(command: string | GR_COMMANDS): Promise<any> {
    return this.safeAdapter.sendCommand(command);
  }

  async refreshDisplay(): Promise<any> {
    return this.safeAdapter.refreshDisplay();
  }

  async getMediaList(): Promise<any> {
    return this.safeAdapter.getMediaList();
  }

  getResizedPhotoURL(
    directory: string,
    filename: string,
    size: PhotoSize
  ): string {
    return this.safeAdapter.getResizedPhotoURL(directory, filename, size);
  }

  getMostRecentPhotoURL(size: PhotoSize): Promise<string> {
    return this.safeAdapter.getMostRecentPhotoURL(size);
  }

  getOriginalMediaURL(directory: string, filename: string): string {
    return this.safeAdapter.getOriginalMediaURL(directory, filename);
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

  startListeningToEvents(): void {
    this.safeAdapter.startListeningToEvents();
  }

  stopListeningToEvents(): void {
    this.safeAdapter.stopListeningToEvents();
  }

  setPollInterval(ms: number): void {
    this.safeAdapter.setPollInterval(ms);
  }

  setPollIntervalTemporarily(ms: number, cycles: number): void {
    this.safeAdapter.setPollIntervalTemporarily(ms, cycles);
  }

  // #endregion
}

export default RicohCameraController;
