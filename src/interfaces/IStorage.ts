/**
 * Interface representing a storage device.
 */
export interface IStorage {
  /**
   * Name of the storage device. For example, `in` for internal storage or `sd1` for SD card 1.
   */
  name: string;

  /**
   * Whether the storage device is currently equipped, such as an SD card inserted.
   */
  equipped: boolean;

  /**
   * Whether the storage device is available for use.
   */
  available: boolean;

  /**
   * Whether the storage device can be written to. This indicates whether the storage is write locked or not.
   */
  writable: boolean;

  /**
   * Current file format, such as jpeg, dng, or rawdng.
   */
  format: string;

  /**
   * The remaining number of photos that can be taken.
   */
  remain: number;

  /**
   * (Optional) Estimated recordable time remaining in minutes.
   *
   * Supported cameras: GR III, GR IIIx
   */
  recordableTime?: number;

  /**
   * (Optional) Total number of photos stored on the device.
   *
   * Supported cameras: GR III, GR IIIx
   */
  numOfPhotos?: number;

  /**
   * (Optional) Total number of movies stored on the device.
   *
   * Supported cameras: GR III, GR IIIx
   */
  numOfMovies?: number;
}
