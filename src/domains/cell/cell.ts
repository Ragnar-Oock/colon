import type { GridVec } from "../../stores/grid.store";
import type { CardInstance } from "../card/card.helper";
import type { MaybeCard } from "../card/card.type";

export interface Cell<card extends MaybeCard = MaybeCard> {
	card: card;
	position: GridVec
}

export interface FilledCell<card extends MaybeCard = MaybeCard> extends Cell<card> {
	card: NonNullable<card>;
}

export interface EmptyCell extends Cell {
	card: undefined;
}

export const isFilled = (cell: Cell): cell is FilledCell => cell.card !== undefined
export const isEmpty = (cell: Cell): cell is EmptyCell => cell.card === undefined

export function cell(position: Readonly<GridVec>, card?: undefined): EmptyCell;
export function cell<instance extends CardInstance>(position: Readonly<GridVec>, card?: instance): FilledCell<instance>;
export function cell(position: Readonly<GridVec>, card?: CardInstance): Cell {
	return {
		card,
		position,
	}
}