/**
 * Represents a single Directory.
 *
 * @property {string} name - The name of the directory.
 * @property {string[]} files - An array of file names in the directory.
 */
export interface IDir {
  /** The name of the directory. */
  name: string;

  /**  An array of file names in the directory. */
  files: string[];
}
