/**
 * Interface representing the difference between two objects for a specific key.
 */
export interface Difference {
  obj1?: any; // Value from the first object
  obj2?: any; // Value from the second object
}

/**
 * Interface representing the result of the findDifferences function.
 */
interface DifferenceResult {
  differences: Record<string, Difference>; // An object containing all differences
  size: number; // The total number of differences
}

/**
 * Compares two objects and returns an object containing the differences.
 * For each key that exists in either of the two objects, it checks if the values are different.
 * If they are different, it stores the differing values in the result.
 *
 * @param {Record<string, any>} obj1 - The first object to compare.
 * @param {Record<string, any>} obj2 - The second object to compare.
 * @returns {DifferenceResult} - An object containing the differences and the total number of differences.
 *
 * Example:
 * ```typescript
 * const obj1 = { a: 1, b: 2, c: 3 };
 * const obj2 = { a: 1, b: 3, d: 4 };
 *
 * const result = findDifferences(obj1, obj2);
 * console.log(result.differences);
 * // Output: { b: { obj1: 2, obj2: 3 }, c: { obj1: 3, obj2: undefined }, d: { obj1: undefined, obj2: 4 } }
 * console.log(result.size); // Output: 3
 * ```
 */
export const findDifferences = (
  obj1: Record<string, any>,
  obj2: Record<string, any>
): DifferenceResult => {
  let differences: Record<string, Difference> = {};
  let size = 0; // Track the number of differences

  // Get all unique keys from both objects
  const keys = new Set([...Object.keys(obj1), ...Object.keys(obj2)]);

  keys.forEach((key) => {
    if (obj1[key] !== obj2[key]) {
      differences[key] = { obj1: obj1[key], obj2: obj2[key] };
      ++size; // Increase the count of differences
    }
  });

  return { differences, size };
};

/**
 * Performs a deep comparison between two values to determine if they are equivalent.
 *
 * This function recursively checks if all properties in `obj1` and `obj2` have
 * the same values, ensuring that nested objects are also compared deeply.
 *
 * @param {any} obj1 - The first object to compare.
 * @param {any} obj2 - The second object to compare.
 * @returns {boolean} - Returns `true` if both objects are deeply equal, otherwise `false`.
 *
 * @example
 * ```ts
 * import { deepEqual } from './utils';
 *
 * const objA = { a: 1, b: { c: 2 } };
 * const objB = { a: 1, b: { c: 2 } };
 * const objC = { a: 1, b: { c: 3 } };
 *
 * console.log(deepEqual(objA, objB)); // true
 * console.log(deepEqual(objA, objC)); // false
 * ```
 */
export const deepEqual = (obj1: any, obj2: any): boolean => {
  if (obj1 === obj2) return true;

  if (
    typeof obj1 !== 'object' ||
    typeof obj2 !== 'object' ||
    obj1 === null ||
    obj2 === null
  ) {
    return false;
  }

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) return false;

  for (const key of keys1) {
    if (!keys2.includes(key) || !deepEqual(obj1[key], obj2[key])) {
      return false;
    }
  }

  return true;
};
