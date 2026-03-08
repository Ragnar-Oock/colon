import { addService, definePlugin, defineService, dependsOn } from "@xoram/core";
import {
	addChild,
	defineComponentDefinition,
	panoramiquePlugin,
	register,
	rootHarness,
	type StoreAsService
} from "@xoram/plugin-panoramique";
import { useDraggableStore } from "./draggable.store";
import DraggedItem from "./dragged-item.vue";


const draggedItem = defineComponentDefinition('dragged', DraggedItem);


declare module '@xoram/core' {
	interface ServiceCollection {
		draggable: StoreAsService<typeof useDraggableStore>;
	}
}


export const draggablePlugin = definePlugin('draggable', () => {
	dependsOn(panoramiquePlugin);
	register(draggedItem);
	addChild(rootHarness, draggedItem.id);

	addService('draggable', defineService(({services: {pinia}}) => useDraggableStore(pinia.pinia)));
})