import type { IDir } from './IDir';

/**
 * Represents a list of media directories.
 * Each directory in this list contains a list of media files.
 *
 * @property {IDir[]} dirs - An array of directory objects.
 */
export interface IMediaList {
  /**  An array of directory objects. */
  dirs: IDir[];
}
