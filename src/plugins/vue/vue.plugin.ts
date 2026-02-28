import { definePlugin, dependsOn, onBeforeCreate } from "@xoram/core";
import { panoramiquePlugin } from "@xoram/plugin-panoramique";

export const vuePlugin = definePlugin('vue', () => {
	dependsOn(panoramiquePlugin.id);
	onBeforeCreate(app => {
		app.services.vue.app.mount('#app');
	})
})