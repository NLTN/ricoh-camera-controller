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
