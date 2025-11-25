/**
 * Merge all arrays into a single one, keeping only one instance of each element (comparison is made by reference)
 *
 * @param all the arrays to combine
 */
export function merge<T>(...all: T[][]): T[] {
	return Array.from(
		new Set(all
			.reduce((union, array) => union.concat(array), [] as T[])
		)
	);
}