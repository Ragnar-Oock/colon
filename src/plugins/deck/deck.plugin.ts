import { addService, definePlugin, defineService, dependsOn } from "@xoram/core";
import type { StoreAsService } from "@xoram/plugin-panoramique";
import { panoramiquePlugin } from "@xoram/plugin-panoramique";
import type { DeckStore } from "./deck.store";
import { useDeckStore } from "./deck.store";

declare module '@xoram/core' {
	interface ServiceCollection {
		deck: StoreAsService<DeckStore>
	}
}

export const deckPlugin = definePlugin('deck', () => {
	dependsOn(panoramiquePlugin);
	addService('deck', defineService(({services: {pinia}}) => useDeckStore(pinia.pinia)))
});