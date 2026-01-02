import type { Cell, FilledCell, GridVec } from "../stores/grid.store";
import { merge } from "./array.helper";
import type { ScorePredicate } from "./score-predicate";

export interface ScoreHelpers {
	/**
	 * Get the 8 cells around the give position. Returned cells might be empty.
	 * @param position the position we want the neighbors of
	 */
	getNeighborsAt: (position: Readonly<GridVec>) => Cell[];
	/**
	 * Fetch all the filled cells connected to the start position and matching the `predicate`
	 * @param predicate check if a cells should be included in the fetched collection
	 * @param limit stop searching when we find that many elements or when all the map has been explored
	 */
	floodFetch: (predicate: ScorePredicate, limit?: number) => FilledCell[];

	get placement(): Readonly<GridVec>;

	/**
	 * Get the 8 cells around the target. Returned cells might be empty.
	 */
	get neighbors(): Cell[];
}

export type ContributorFinder = (helper: ScoreHelpers) => Cell[];

/**
 * Fetch all the filled cells connected to the start position and matching the `predicate`
 * @param predicate check if a cells should be included in the fetched collection
 * @param limit stop searching when we find that many elements or when all the map has been explored
 */
export const floodFetch = (predicate: ScorePredicate, limit?: number): ContributorFinder =>
	/**
	 * @param helper the score helper object provided by the store invoking this function
	 */
	helper => helper.floodFetch(predicate, limit);

export const neighborFetch = (predicate: ScorePredicate): ContributorFinder =>
	helper => helper
		.neighbors
		.filter(({card}) => predicate(card));

/**
 * Limit the number of contributors returned and optionally reduce their number if the limit is reached
 * @param finder find the contributors
 * @param limit discard any contributor after that many are found
 * @param overLimit if `limit` is reached return at most that many contributors. MUST be between 0 and `limit`
 * @composite
 */
export const limitContribution = (finder: ContributorFinder, limit: number, overLimit: number = limit): ContributorFinder =>
	helpers => {
		const cells = finder(helpers);
		return cells.length > limit ? cells.slice(0, Math.min(limit, overLimit)) : cells;
	}

export const mergeContribution = (...finders: ContributorFinder[]): ContributorFinder =>
	helper => merge(...finders.map(finder => finder(helper)))