import type { CardGroup, CardType } from "../card/card.helper";
import type { MaybeCard } from "../card/card.type";

export type ScorePredicate = (card: MaybeCard) => boolean;

/**
 * Create a predicate checking if a given card type is in the given list of types
 * @param types a list of types to check the card against
 * @composite
 */
export const ofType = (...types: CardType[]): ScorePredicate =>
	card => card !== undefined && types.includes(card.name)

/**
 * Create a predicate checking if a given card is part of one of the given groups
 * @param groups a list of groups to check the card against
 * @composite
 */
export const ofGroup = (...groups: CardGroup[]): ScorePredicate =>
	card => card?.groups?.some(group => groups.includes(group)) ?? false