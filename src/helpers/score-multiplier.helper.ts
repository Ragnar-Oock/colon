import { Cell } from "../stores/grid.store";

export type ScoreMultiplierHelper = (neighbors: Cell[]) => number;

export const countType = (...is: string[]): ScoreMultiplierHelper =>
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

export const countNeighborBonuses = (type: string): ScoreMultiplierHelper =>
	neighbors =>
		neighbors.reduce((bonuses, neighbor) => bonuses + (neighbor.card?.bonus?.(type) ?? 0), 0)

export const countEmpty = (): ScoreMultiplierHelper =>
	neighbors =>
		neighbors.reduce((multiplier, neighbor) => multiplier + (neighbor.card === undefined ? 1 : 0), 0)