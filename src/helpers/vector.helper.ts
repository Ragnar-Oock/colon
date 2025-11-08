export interface Vector2 {
	/**
	 * a signed integer designating a row of the grid
	 */
	x: number;
	/**
	 * a signed integer designating a column of the grid
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