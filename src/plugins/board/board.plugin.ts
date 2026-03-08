import { definePlugin, dependsOn } from "@xoram/core";
import {
	addChild,
	defineComponentDefinition,
	panoramiquePlugin,
	register,
	rootHarness
} from "@xoram/plugin-panoramique";
import { gridPlugin } from "../grid/grid.plugin";
import BoardView from "./board-view.vue";

const board = defineComponentDefinition('board', BoardView);
export const boardPlugin = definePlugin('board', () => {
	dependsOn(gridPlugin);
	dependsOn(panoramiquePlugin);
	register(board);
	addChild(rootHarness, board.id)
})