import type { ComputedRef } from "vue";
import { computed } from "vue";

export interface Vector2 {
	/**
	 * a signed integer designating a position along the horizontal axis of the grid
	 */
	x: number;
	/**
	 * a signed integer designating a position along the vertical axis of the grid
	 */
	y: number;
}

export type ReadonlyVector2 = Readonly<Vector2>;

export const addVec = <vec extends Vector2>(a: Readonly<vec>, b: Readonly<vec>): vec => ({
	x: a.x + b.x,
	y: a.y + b.y,
} as vec);

export const subtractVec = <vec extends Vector2>(a: Readonly<vec>, b: Readonly<vec>): vec => ({
	x: a.x - b.x,
	y: a.y - b.y,
} as vec);

export const setVec = <vec extends Vector2>(vector: vec, to: Readonly<vec>): vec => {
	vector.x = to.x;
	vector.y = to.y;
	return vector;
}

export const inverseVec = <vec extends Vector2>({x, y}: vec): vec => ({
	x: -x,
	y: -y,
} as vec)

export const toString = (
	{x, y}: Vector2
): string =>
	`(${ x.toString(10).padStart(3, ' ') } | ${ y.toString(10).padStart(3, ' ') })`

export const equalsVec = <vec extends Vector2>(a: Readonly<vec>, b: Readonly<vec>): boolean =>
	a.x === b.x && a.y === b.y

export const vec2 = <kind extends Vector2>(x: number, y: number): kind => ({x, y} as kind)

/**
 * Check if 2 vectors are equivalent and return the old one if they are so to avoid triggering Vue's reactivity for
 * nothing.
 * @param oldValue the current value of the reactive thing we want to suppress the updates on
 * @param newValue the new value to check against
 */
export const suppressUpdate = <T extends Vector2>(oldValue: T | undefined, newValue: T): T =>
	oldValue && oldValue !== newValue && equalsVec(oldValue, newValue)
		? oldValue
		: newValue

/**
 * Prevent triggering Vue's reactivity if the new value is equivalent to the old one
 * @param getter a getter to feed to Vue's computed function
 */
export const suppressedComputed = <T extends Vector2>(getter: (old: T | undefined) => T,): ComputedRef<T> =>
	computed(old => suppressUpdate(old, getter(old)))