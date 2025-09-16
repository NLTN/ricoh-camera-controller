/**
 * Represents the size of a media file.
 *
 * Possible values:
 * - THUMBNAIL: A thumbnail-sized photo (160 x 120).
 * - SMALL: A small-sized photo (720 x 480).
 * - LARGE: A large-sized photo (1920 x 1280).
 */
export const PhotoSize = {
  /** A thumbnail-sized photo (160 x 120). */
  THUMBNAIL: 'thumbnail',
  /** A small-sized photo (720 x 480). */
  SMALL: 'small',
  /** A large-sized photo (1920 x 1280). */
  LARGE: 'large',
} as const;

export type PhotoSize = (typeof PhotoSize)[keyof typeof PhotoSize];
