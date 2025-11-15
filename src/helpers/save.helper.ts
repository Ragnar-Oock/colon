import { useDeckStore } from "../stores/deck.store";
import { Cell, FilledCell, GridVec } from "../stores/grid.store";
import { card } from "./card.helper";

const propertySeparator = ',';
const entitySeparator = ';';
const integerRadix = 10;


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
			const descriptor = registry.get(typeLookUpTable[typeId]);
			if (descriptor === undefined) {
				throw new ReferenceError(`unknown card "${ typeId }" at index ${ index }`);
			}

			let position = {x: 0, y: 0} as GridVec;
			try {
				position.x = parseInt(x, integerRadix);
				position.y = parseInt(y, integerRadix);
			}
			catch (cause) {
				throw new TypeError(`unable to parse coordinates at index ${ index } : x = ${ x }, y = ${ y }`, {cause});
			}
			return {
				card: card(descriptor.proto),
				position,
			} satisfies Cell
		})
}

function getSlotKey(slot = 0): string {
	return `game.${ slot.toString(10) }`
}

export function saveMap(map: FilledCell[], slot: number = 0): void {
	const game = serializeMap(map);
	localStorage.setItem(getSlotKey(slot), JSON.stringify(game));
}

export function loadMap(slot = 0): FilledCell[] {
	const game = localStorage.getItem(getSlotKey(slot));
	if (game === null) {
		return [];
	}
	const {cells, lut} = JSON.parse(game);
	return deserialize(cells, lut);
}

export function forget(slot = 0): void {
	localStorage.removeItem(getSlotKey(slot))
}