import { Cell, FilledCell, GridVec } from "../stores/grid.store";
import { ScorePredicate } from "./score-predicate";

export interface ScoreHelpers {
	/**
	 * Get the 8 cells around the give position. Returned cells might be empty.
	 * @param position the position we want the neighbors of
	 */
	getNeighborsAt: (position: Readonly<GridVec>) => Cell[];
	/**
	 * Fetch all the filled cells connected to the start position and matching the `predicate`
	 * @param predicate check if a cells should be included in the fetched collection
	 */
	floodFetch: (predicate: ScorePredicate, limit?: number) => FilledCell[];

	get placement(): Readonly<GridVec>;

	/**
	 * Get the 8 cells around the target. Returned cells might be empty.
	 */
	get neighbors(): Cell[];
}

/**
 * {@inheritDoc ScoreHelpers.floodFetch}
 */
export const floodFetch = (predicate: ScorePredicate, limit?: number) =>
	(helper: ScoreHelpers) =>
		helper.floodFetch(predicate, limit);