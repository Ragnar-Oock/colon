export function iter(): Generator<number>
export function iter(length: 0): Generator<never>
export function iter(length: number): Generator<number>
export function iter<T>(length: number, items: (index: number) => T): Generator<T>;
export function* iter<T>(length = Number.POSITIVE_INFINITY, items?: (index: number) => T): Generator<number | NonNullable<T>> {
	for (let i = 0; i < length; i++) {
		yield items?.(i) ?? i;
	}
}
