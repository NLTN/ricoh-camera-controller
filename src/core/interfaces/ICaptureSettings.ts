/**
 * Capture Settings Interface
 *
 * This interface defines the settings that can be used to capture images.
 */
export interface ICaptureSettings {
  /** Aperture Value */
  av: string;

  /** Time Value (Shutter Speed) */
  tv: string;

  /** Sensitivity Value (ISO) */
  sv: string;

  /** Exposure Value (EV) */
  xv: string;

  /** Flash Exposure Value */
  flashxv: string;

  /** Shoot Mode (Drive Mode) */
  shootMode: string;

  /** White Balance Mode */
  WBMode: string;

  /** Exposure Mode (e.g., "auto", "P", "TV", "AV") */
  exposureMode: string;

  /** Light Metering Mode (e.g., "multi", "center", "spot", "hightlight") */
  meteringMode: string;

  /** Effect (e.g., "efc_posiFilm", "efc_monochrome") */
  effect: string;

  /** Still Size (e.g., "FHD30p") */
  stillSize: string;

  /** Movie Size (e.g., "FHD30p") */
  movieSize: string;

  /** Focus Mode (e.g., "af", "mf") */
  focusMode: string;

  /** Focus setting (e.g., "multiauto", "spot", "pinpoint", "snap", "inf").
   *
   * Supported devices: GRII*/
  AFMode: string;

  /** Focus setting (e.g., "multiauto", "spot", "pinpoint", "snap", "inf").
   *
   * Supported devices: GRIII & GR IIIx */
  focusSetting: string;

  /** SSID (Wi-Fi network name) */
  ssid: string;

  /** WiFi Password */
  key: string;

  /** WiFi channel */
  channel: number;

  //   datetime: string; // ISO 8601 formatted date-time string
}
