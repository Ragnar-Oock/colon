import { defineStore } from "pinia";
import type { Component } from 'vue';
import { computed, reactive, ref, watchEffect } from 'vue';

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

export type DragOptions = {
	onCancel?: () => void;
	onEnd?: () => void;
}

export const useDraggableStore = defineStore('draggable', () => {
	const dragged = ref<DraggedElement | null>(null);
	let cancel: VoidFunction | null = null;

	function start(element: DraggedElement, options?: DragOptions): () => void {
		dragged.value = element;
		let hasChanged = false;

		const stopWatching = watchEffect(() => {
			// it looks silly but that's the only way to do a reference comparison
			// see https://vuejs.org/guide/essentials/reactivity-fundamentals.html#reactive-proxy-vs-original-1
			hasChanged = dragged.value !== reactive(element);

			if (hasChanged) {
				options?.onEnd?.();
				stopWatching();
				hasChanged = false;
			}
		});

		cancel = () => {
			cancel = null;

			if (hasChanged) {
				return;
			}

			options?.onCancel?.();
			dragged.value = null;
		};

		return cancel;
	}

	function end() {
		dragged.value = null;
	}

	return {
		dragged: computed(() => dragged.value),
		start,
		end,
		cancel: computed(() => cancel ?? (() => void 0)),
	}
})