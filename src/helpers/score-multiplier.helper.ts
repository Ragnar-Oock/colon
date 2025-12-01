import { Cell } from "../stores/grid.store";
import { CardInstance, CardType } from "./card.helper";

export type ScoreMultiplierHelper = (neighbors: Cell[]) => number;

export const countType = (...is: CardType[]): ScoreMultiplierHelper =>
	neighbors =>
		neighbors
			.filter(neighbor => (is as (string | undefined)[]).includes(neighbor.card?.name))
			.length

export const sumUp = (...helpers: ScoreMultiplierHelper[]): ScoreMultiplierHelper =>
	neighbors =>
		helpers.reduce(
			(multiplier, helper) => multiplier + helper(neighbors)
			, 0
		)

export const countNeighborBonuses = (card: CardInstance): ScoreMultiplierHelper =>
	neighbors =>
		neighbors.reduce((bonuses, neighbor) => bonuses + (neighbor.card?.bonus?.(card) ?? 0), 0)

export const countEmpty = (): ScoreMultiplierHelper =>
	neighbors =>
		neighbors.reduce((multiplier, neighbor) => multiplier + (neighbor.card === undefined ? 1 : 0), 0)