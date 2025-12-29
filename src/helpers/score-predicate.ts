import type { MaybeCard } from "../stores/grid.store";
import type { CardGroup, CardType } from "./card.helper";

export type ScorePredicate = (card: MaybeCard) => boolean;

/**
 * Check
 * @param types
 */
export const ofType = (...types: CardType[]): ScorePredicate =>
	card => types.includes(card?.name!)

export const ofGroup = (...groups: CardGroup[]): ScorePredicate =>
	card => card?.groups?.some(group => groups.includes(group)) ?? false