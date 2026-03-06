import { addService, definePlugin } from "@xoram/core";
import type { SaveService } from "./save.service";
import { saveService } from "./save.service";


declare module '@xoram/core' {
	interface ServiceCollection {
		save: SaveService
	}
}

export const savePlugin = definePlugin('save', () => {
	addService('save', saveService);
})