import { definePlugin, dependsOn, onBeforeCreate } from "@xoram/core";
import {
	addChild,
	defineComponentDefinition,
	panoramiquePlugin,
	register,
	rootHarness
} from "@xoram/plugin-panoramique";
import { watchEffect } from "vue";
import { basicCardsPlugin } from "../basic-cards/basic-cards.plugin";
import { deckPlugin } from "../deck/deck.plugin";
import { loadHand, saveHand } from "../save/save-hand.helper";
import HandDisplay from "./hand-display.vue";

const hand = defineComponentDefinition('hand', HandDisplay);

export const handPlugin = definePlugin('hand', () => {
	dependsOn(panoramiquePlugin);
	dependsOn(deckPlugin);
	dependsOn(basicCardsPlugin);

	register(hand);
	addChild(rootHarness, hand.id);

	onBeforeCreate(({services: {deck}}) => {
		deck.hand = loadHand();

		watchEffect(() => saveHand(deck.hand));
	})
})