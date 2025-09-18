import type { ICaptureSettings } from './ICaptureSettings';

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
