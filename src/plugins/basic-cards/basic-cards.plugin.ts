import { definePlugin, dependsOn, onBeforeCreate } from "@xoram/core";
import { deckPlugin } from "../deck/deck.plugin";
import { cards } from "./cards.data";

export const basicCardsPlugin = definePlugin('basicCards', () => {
	dependsOn(deckPlugin);
	onBeforeCreate(({services}) => {
		cards.forEach(card => services.deck.register(card))
	})
})