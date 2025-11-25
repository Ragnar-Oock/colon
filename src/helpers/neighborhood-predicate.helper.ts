import { Cell } from "../stores/grid.store";
import { CardType } from "./card.helper";

export type NeighborhoodPredicate = (neighborhood: Cell[]) => boolean;
/**
 * Check that at least one of the neighbors is of a required set of types
 * @param oneOf a set of types, at least one of which should be present at least once in the future neighbors
 * @returns is the neighborhood suitable ?
 */
export const expectAtLeast = (...oneOf: CardType[]): NeighborhoodPredicate =>
	neighborhood =>
		neighborhood.some(neighbor => oneOf.includes(neighbor.card?.name!));
/**
 * Check that none of the neighbors is of a given set of types
 * @param of a set of types, none of which should be present in the future neighbors
 * @returns is the neighborhood suitable ?
 */
export const expectNone = (...of: CardType[]): NeighborhoodPredicate => neighborhood =>
	!neighborhood.some(neighbor => of.includes(neighbor.card?.name!))
/**
 * Check that at least one of the neighbors is of a required set of type. Types are counted as a whole, to count each
 * type individually use multiple instances of {@link expectAtMost `expectAtMost()`} with {@link combine `combine()`}.
 * @param amount how many neighbors to expect
 * @param of a set of types that should be present at least `amount` times
 * @returns is the neighborhood suitable ?
 */
export const expectAtMost = (amount: number, ...of: CardType[]): NeighborhoodPredicate =>
	neighborhood => neighborhood.reduce(
		(count, neighbor) => count + (of.includes(neighbor.card?.name!) ? 1 : 0),
		0
	) > amount;
/**
 * Combine multiple {@link NeighborhoodPredicate} into a single one, all of which should match.
 * @param predicates
 */
export const combine = (...predicates: NeighborhoodPredicate[]): NeighborhoodPredicate =>
	neighborhood => predicates.every(predicate => predicate(neighborhood));
/**
 * Combine multiple {@link NeighborhoodPredicate} into a single one, at least one of which should match.
 * @param predicates
 */
export const either = (...predicates: NeighborhoodPredicate[]): NeighborhoodPredicate =>
	neighborhood => predicates.some(predicate => predicate(neighborhood));