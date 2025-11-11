import { MaybeCard } from "../stores/grid.store";

export type ScorePredicate = (card: MaybeCard) => boolean;

/**
 * Check
 * @param types
 */
export const ofType = (...types: string[]): ScorePredicate =>
	card => (types as (string | undefined)[]).includes(card?.name)
