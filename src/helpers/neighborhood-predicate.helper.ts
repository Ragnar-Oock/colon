import type { Cell } from "../stores/grid.store";
import type { CardGroup, CardType } from "./card.helper";

export type NeighborhoodPredicate = (neighborhood: Cell[]) => boolean;

// region neighbor type predicates

/**
 * Check that at least one of the neighbors is of a required set of types
 * @param types a set of types, at least one of which should be present at least once in the future neighbors
 * @returns is the neighborhood suitable ?
 */
export const atLeastOneOfType = (...types: CardType[]): NeighborhoodPredicate =>
	neighborhood =>
		neighborhood.some(neighbor => types.includes(neighbor.card?.name!));
/**
 * Check that none of the neighbors is of a given set of types
 * @param types a set of types, none of which should be present in the future neighbors
 * @returns `true` if none of the neighbor match any of the given types
 */
export const noneOfType = (...types: CardType[]): NeighborhoodPredicate => neighborhood =>
	!neighborhood.some(neighbor => types.includes(neighbor.card?.name!))
/**
 * Check that at least one of the neighbors is of a required set of type. Types are counted as a whole, to
 * count each type individually use multiple instances of {@link atMostOfType `atMostOfType()`} with
 * {@link combine `combine()`}.
 * @param amount how many neighbors to expect
 * @param types a set of types that should be present at least `amount` times
 * @returns is the neighborhood suitable ?
 */
export const atMostNOfType = (amount: number, ...types: CardType[]): NeighborhoodPredicate =>
	neighborhood => neighborhood.reduce(
		(count, neighbor) => count + (types.includes(neighbor.card?.name!) ? 1 : 0),
		0
	) > amount;

// endregion

// region neighbor group predicates
export const atLeastOneInGroup = (...groups: CardGroup[]): NeighborhoodPredicate =>
	neighborhood =>
		neighborhood.some(neighbor =>
			groups.some(group => neighbor.card?.groups?.includes(group))
		)
// endregion

// region combinators

/**
 * Combine multiple {@link NeighborhoodPredicate} into a single one, all of which should match. Similar to a logical
 * AND.
 * @param predicates
 */
export const combine = (...predicates: NeighborhoodPredicate[]): NeighborhoodPredicate =>
	neighborhood => predicates.every(predicate => predicate(neighborhood));
/**
 * Combine multiple {@link NeighborhoodPredicate} into a single one, at least one of which should match. Similar to a
 * logical OR.
 * @param predicates
 */
export const either = (...predicates: NeighborhoodPredicate[]): NeighborhoodPredicate =>
	neighborhood => predicates.some(predicate => predicate(neighborhood));

// endregion