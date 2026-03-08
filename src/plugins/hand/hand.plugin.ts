import { definePlugin, dependsOn, onBeforeCreate, onCreated } from "@xoram/core";
import {
	addChild,
	defineComponentDefinition,
	panoramiquePlugin,
	register,
	rootHarness
} from "@xoram/plugin-panoramique";
import { watchEffect } from "vue";
import { iter } from "../../helpers/iterator.helper";
import { basicCardsPlugin } from "../basic-cards/basic-cards.plugin";
import type { CardInstance, CardType } from "../deck/card.helper";
import { card } from "../deck/card.helper";
import { deckPlugin } from "../deck/deck.plugin";
import { entitySeparator } from "../save/save-format.const";
import { savePlugin } from "../save/save.plugin";
import HandDisplay from "./hand-display.vue";

const hand = defineComponentDefinition('hand', HandDisplay);

const HAND = 'colon.hand' as const;
const DEFAULT_HAND_SIZE = 7;

declare module '../save/save.service' {
	interface DataTypes {
		[HAND]: CardInstance[];
	}
}

export const handPlugin = definePlugin('hand', () => {
	dependsOn(panoramiquePlugin);
	dependsOn(deckPlugin);
	dependsOn(basicCardsPlugin);
	dependsOn(savePlugin);

	register(hand);
	addChild(rootHarness, hand.id);

	onBeforeCreate(({services: {deck, save}}) => {
		save.registerSerDe({
			type: HAND,
			serialize(cards) {
				return cards
					.map(({name}) => name)
					.join(entitySeparator)
			},
			deserialize(data) {
				if (data.length === 0) {
					return [];
				}

				const {registry} = deck;

				return data
					.split(entitySeparator)
					.map((cardType, index) => {
						const descriptor = registry.get(cardType as CardType);
						if (descriptor === undefined) {
							throw new ReferenceError(`unknown card "${ cardType }" in hand at index ${ index }`)
						}
						else {
							return card(descriptor.proto);
						}
					})
			}
		});

	});

	onCreated(({services: {deck, save}}) => {
		deck.hand = save.load(HAND, () => {
			const {pick} = deck;
			return iter(DEFAULT_HAND_SIZE)
				.map(() => card(pick().proto))
				.toArray();
		});
		watchEffect(() => save.save(HAND, deck.hand));
	})
})