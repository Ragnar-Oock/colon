import { Cell } from "../stores/grid.store";

export type ScoreMultiplierHelper = (neighbors: Cell[]) => number;

export const countType = (...is: string[]) =>
	(neighbors: Cell[]) =>
		neighbors
			.filter(neighbor => (is as (string | undefined)[]).includes(neighbor.card?.name))
			.length

export const sumUp = (...helpers: ScoreMultiplierHelper[]) =>
	(neighbors: Cell[]) =>
		helpers.reduce(
			(multiplier, helper) => multiplier + helper(neighbors)
			, 0
		)

export const countNeighborBonuses = (type: string) =>
	(neighbors: Cell[]) =>
		neighbors.reduce((bonuses, neighbor) => bonuses + (neighbor.card?.bonus?.(type) ?? 0), 0)