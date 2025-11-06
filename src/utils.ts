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
 * @param {string[] | undefined } excludedKeys - (Optional) An array of keys to exclude from the comparison.
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
  obj2: Record<string, any>,
  excludedKeys: string[] = []
): DifferenceResult => {
  let differences: Record<string, Difference> = {};
  let size = 0; // Track the number of differences

  // Get all unique keys from both objects
  const keys = new Set([...Object.keys(obj1), ...Object.keys(obj2)]);

  keys.forEach((key) => {
    if (
      excludedKeys.includes(key) === false &&
      deepEqual(obj1[key], obj2[key]) === false
    ) {
      differences[key] = { obj1: obj1[key], obj2: obj2[key] };
      ++size; // Increase the count of differences
    }
  });

  return { differences, size };
};

/**
 * Checks if two arrays are equal.
 *
 * This function compares two arrays for equality. It checks if they have the same length
 * and if their corresponding elements are equal.
 *
 * @param {any[]} arr1 - The first array to compare.
 * @param {any[]} arr2 - The second array to compare.
 * @returns {boolean} - Returns `true` if the arrays are equal, otherwise `false`.
 *
 * @example
 * ```ts
 * import { arraysEqual } from './utils';
 *
 * const arr1 = [1, 2, 3];
 * const arr2 = [1, 2, 3];
 * const arr3 = [1, 2, 4];
 *
 * console.log(arraysEqual(arr1, arr2)); // true
 * console.log(arraysEqual(arr1, arr3)); // false
 * ```
 */
export const arraysEqual = (arr1: any[], arr2: any[]): boolean => {
  if (arr1.length !== arr2.length) {
    return false;
  }

  let i = 0;
  while (i < arr1.length && arr1[i] === arr2[i]) {
    ++i;
  }

  return i === arr1.length;
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

/**
 * Checks if an object contains at least one key from a given set.
 *
 * @template T - Type of valid keys (string | number | symbol).
 * @param obj - The object to inspect.
 * @param keys - A Set of keys to check against.
 * @returns `true` if at least one key in the object matches a key in the set,
 *          otherwise `false`.
 *
 * @example
 * const expectedKeys = new Set(["darkMode", "language"]);
 *
 * hasAnyKey({ darkMode: true }, expectedKeys); // true
 * hasAnyKey({ foo: 123 }, expectedKeys);       // false
 */
export const hasAnyKey = <T extends string | number | symbol>(
  obj: object | undefined,
  keys: Set<T> | ReadonlySet<T> | undefined
): boolean => {
  if (obj === undefined || keys === undefined) return false;
  return Object.keys(obj).some((k) => keys.has(k as T));
};
