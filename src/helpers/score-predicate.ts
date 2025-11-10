import { MaybeCard } from "../stores/grid.store";

export type ScorePredicate = (card: MaybeCard) => boolean;

export const sameType = (name: string) =>
	(card: MaybeCard) => card?.name === name
export const ofType = (...types: string[]) =>
	(card: MaybeCard) => (types as (string | undefined)[]).includes(card?.name)

