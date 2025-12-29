import { useDeckStore } from "../../stores/deck.store";
import type { Cell, FilledCell, GridVec } from "../../stores/grid.store";
import type { CardType } from "../card.helper";
import { card } from "../card.helper";
import { entitySeparator, integerRadix, propertySeparator, slotKeyBuilder } from "./save-format.helper";


export type SerializedGame = {
	cells: string,
	lut: string,
}

function serializeMap(map: FilledCell[]): SerializedGame {
	const types = new Set(map.map(cell => cell.card.name));
	const typeLookUpTable = Object.fromEntries(
		types
			.values()
			.map((value, index) => [value, index.toString(integerRadix)])
	);

	const cells = map
		.map(cell => [
			typeLookUpTable[cell.card.name],
			cell.position.x.toString(integerRadix),
			cell.position.y.toString(integerRadix)
		].join(propertySeparator))
		.join(entitySeparator);

	return {
		cells,
		lut: types.values().toArray().join(entitySeparator),
	};
}

function deserialize(cells: string, types: string): FilledCell[] {
	if (cells === '') {
		return [];
	}

	const {registry} = useDeckStore();

	const typeLookUpTable = Object.fromEntries(
		types
			.split(entitySeparator)
			.map((value, index) => [index.toString(integerRadix), value])
	)

	return cells
		.split(entitySeparator)
		.map((entity, index) => {
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
				throw new TypeError(`unable to parse coordinates at index ${ index } : x = ${ x }, y = ${ y }`, {
					error,
					cause: error
				});
			}
			return {
				card: card(descriptor.proto),
				position,
			} satisfies Cell
		})
}

const getSlotKey = slotKeyBuilder('game');


export function saveMap(map: FilledCell[], slot: number = 0): void {
	const game = serializeMap(map);
	localStorage.setItem(getSlotKey(slot), JSON.stringify(game));
}

export function loadMap(slot = 0, newMap: () => FilledCell[] = () => []): FilledCell[] {
	const game = localStorage.getItem(getSlotKey(slot));
	if (game === null) {
		return newMap();
	}
	const {cells, lut} = JSON.parse(game);
	return deserialize(cells, lut);
}

export function forgetMap(slot = 0): void {
	localStorage.removeItem(getSlotKey(slot))
}