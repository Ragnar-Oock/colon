import { definePlugin, dependsOn } from "@xoram/core";
import {
	addChild,
	defineComponentDefinition,
	panoramiquePlugin,
	register,
	rootHarness
} from "@xoram/plugin-panoramique";
import DraggedItem from "./dragged-item.vue";


const draggedItem = defineComponentDefinition('dragged', DraggedItem);

export const draggedPlugin = definePlugin('dragged', () => {
	dependsOn(panoramiquePlugin);
	register(draggedItem);
	addChild(rootHarness, draggedItem.id);
})