import type { CardType } from "../../domains/card/card.helper";
import { card } from "../../domains/card/card.helper";
import { useDeckStore } from "../../stores/deck.store";
import type { CellMap, GridVec } from "../../stores/grid.store";
import { entitySeparator, integerRadix, propertySeparator, slotKeyBuilder } from "./save-format.helper";


export type SerializedGame = {
	cells: string,
	lut: string,
}

function serializeMap(map: CellMap): SerializedGame {
	const types = new Set(
		Iterator
			.from(map.values())
			.flatMap(column => column.values())
			.map(cell => cell.card.name)
	);
	const typeLookUpTable = Object.fromEntries(
		types
			.values()
			.map((value, index) => [value, index.toString(integerRadix)])
	);

	const cells = Iterator
		.from(map.values())
		.flatMap(column => column.values())
		.map(cell => [
			typeLookUpTable[cell.card.name],
			cell.position.x.toString(integerRadix),
			cell.position.y.toString(integerRadix)
		].join(propertySeparator))
		.toArray()
		.join(entitySeparator);

	return {
		cells,
		lut: types.values().toArray().join(entitySeparator),
	};
}

function deserialize(cells: string, types: string): CellMap {
	const map: CellMap = new Map();

	if (cells === '') {
		return map;
	}

	const {registry} = useDeckStore();

	const typeLookUpTable = Object.fromEntries(
		types
			.split(entitySeparator)
			.map((value, index) => [index.toString(integerRadix), value])
	)

	cells
		.split(entitySeparator)
		.forEach((entity, index) => {
			const [typeId, x, y] = entity.split(propertySeparator);
			const descriptor = registry.get(typeLookUpTable[typeId] as CardType);
			if (descriptor === undefined) {
				throw new ReferenceError(`unknown card "${ typeLookUpTable[typeId] }" (${ typeId }) in cells at index ${ index }`);
			}

			let position = {x: 0, y: 0} as GridVec;
			try {
				position.x = Number.parseInt(x, integerRadix);
				position.y = Number.parseInt(y, integerRadix);
			}
			catch (error) {
				throw new TypeError(`unable to parse coordinates at index ${ index } : x = ${ x }, y = ${ y }`, {cause: error});
			}

			let column = map.get(position.x);

			if (column === undefined) {
				column = new Map();
				map.set(position.x, column);
			}

			column.set(position.y, {
				card: card(descriptor.proto),
				position,
			})
		})

	return map;
}

const getSlotKey = slotKeyBuilder('game');


export function saveMap(map: CellMap, slot = 0): void {
	const game = serializeMap(map);
	localStorage.setItem(getSlotKey(slot), JSON.stringify(game));
}

export function loadMap(slot = 0, newMap?: () => CellMap): CellMap {
	const game = localStorage.getItem(getSlotKey(slot));
	if (game === null) {
		return newMap?.() ?? new Map();
	}
	const {cells, lut} = JSON.parse(game);
	return deserialize(cells, lut);
}

export function forgetMap(slot = 0): void {
	localStorage.removeItem(getSlotKey(slot))
}