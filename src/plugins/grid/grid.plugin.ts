import { addService, definePlugin, defineService, dependsOn } from "@xoram/core";
import { panoramiquePlugin } from "@xoram/plugin-panoramique";
import { vuePlugin } from "../vue/vue.plugin";
import { useGridStore } from "./grid.store";


export const gridPlugin = definePlugin('grid', () => {
	dependsOn(vuePlugin.id);
	dependsOn(panoramiquePlugin.id);
	addService('grid', defineService(() => useGridStore()))
})