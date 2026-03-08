import { addService, definePlugin, defineService, dependsOn, onBeforeCreate, onCreated } from "@xoram/core";
import type { StoreAsService } from '@xoram/plugin-panoramique';
import { panoramiquePlugin } from "@xoram/plugin-panoramique";
import { watchEffect } from "vue";
import type { CardType } from "../deck/card.helper";
import { card } from "../deck/card.helper";
import { deckPlugin } from "../deck/deck.plugin";
import { entitySeparator, integerRadix, propertySeparator } from "../save/save-format.const";
import { savePlugin } from "../save/save.plugin";
import { vuePlugin } from "../vue/vue.plugin";
import type { Cell, FilledCell } from "./cell";
import { cell as createCell } from "./cell";
import type { GridVec } from './grid.store';
import { gridVec, useGridStore } from './grid.store';

const GRID = 'colon.grid' as const;

declare module '../save/save.service' {
	interface DataTypes {
		[GRID]: FilledCell[];
	}
}

declare module '@xoram/core' {
	interface ServiceCollection {
		grid: StoreAsService<typeof useGridStore>;
	}
}


export const gridPlugin = definePlugin('grid', () => {
	dependsOn(vuePlugin);
	dependsOn(panoramiquePlugin);
	dependsOn(savePlugin);
	dependsOn(deckPlugin);
	addService('grid', defineService(() => useGridStore()));

	onBeforeCreate(({services: {deck, save}}) => {
		save.registerSerDe({
			type: GRID,
			serialize(map) {
				const types = new Set<CardType>(map.map(cell => cell.card.name));
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

				return JSON.stringify({
					cells,
					lut: types.values().toArray().join(entitySeparator),
				});
			},
			deserialize(data) {
				const {cells, lut} = JSON.parse(data);

				if (typeof cells !== "string" || typeof lut !== "string") {
					throw new TypeError('Invalid map data');
				}

				if (cells === '') {
					return [];
				}

				const {registry} = deck;

				const typeLookUpTable = Object.fromEntries(
					lut
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
							throw new TypeError(`unable to parse coordinates at index ${ index } : x = ${ x }, y = ${ y }`, {cause: error});
						}
						return {
							card: card(descriptor.proto),
							position,
						} satisfies Cell
					})
			}
		})
	});

	onCreated(({services: {deck, save, grid}}) => {
		grid.cells = save.load(GRID, () => {
			const townProto = deck.registry.get('town')?.proto;
			if (townProto === undefined) {
				throw new Error('Default tile type not available. Did you fuck up the load order ?');
			}
			return [
				createCell(gridVec(0, 0), card(townProto)),
			];
		});
		watchEffect(() => save.save(GRID, grid.cells));
	})
})