import type { Application } from "@xoram/core";
import { createApp } from "@xoram/core";
import { panoramiquePlugin } from "@xoram/plugin-panoramique";
import { basicCardsPlugin } from "./plugins/basic-cards/basic-cards.plugin";
import { boardPlugin } from "./plugins/board/board.plugin";
import { deckPlugin } from "./plugins/deck/deck.plugin";
import { draggedPlugin } from "./plugins/dragged/dragged.plugin";
import { gridPlugin } from "./plugins/grid/grid.plugin";
import { handPlugin } from "./plugins/hand/hand.plugin";
import { savePlugin } from "./plugins/save/save.plugin";
import { vuePlugin } from "./plugins/vue/vue.plugin";


export const start = (): Application =>
	createApp([
		panoramiquePlugin,
		vuePlugin,
		gridPlugin,
		boardPlugin,
		deckPlugin,
		handPlugin,
		basicCardsPlugin,
		draggedPlugin,
		savePlugin,
	], {
		id: 'colon'
	})