import { defineStore } from "pinia";
import { type Component, ref } from "vue";

export type DraggedElement = {
	type: 'component';
	component: Component,
	width: number,
	height: number,
} | {
	type: 'image'
	src: string,
	width: number,
	height: number,
}

export const useDraggableStore = defineStore('draggable', () => {
	const dragged = ref<DraggedElement | null>(null);

	return {
		dragged,
	}
})