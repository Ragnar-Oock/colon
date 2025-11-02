<script lang="ts" setup>
import { useEventListener, useMouse } from "@vueuse/core";
import { storeToRefs } from "pinia";
import { computed } from "vue";
import { useDraggableStore } from "../stores/draggable.store";

const {dragged} = storeToRefs(useDraggableStore());

useEventListener(window, 'dragover', event => {
	if (event.dataTransfer?.getData('draggable-item')) {
		event.preventDefault();
	}
});

const {x, y} = useMouse({type: 'page'})
let previous = 0;
const previousResults: number[] = Array.from({length: 10});
const dx = computed(() => {
	previousResults.pop();
	previousResults.unshift(previous - x.value);
	previous = x.value;
	return previousResults.reduce((acc, cur) => acc + cur, 0) / previousResults.length;
});

const isDragging = computed(() => dragged.value !== null);
const left = computed(() => `${ x.value - (dragged.value?.width ?? 0) / 2 }px`);
const top = computed(() => `${ y.value - (dragged.value?.height ?? 0) / 2 }px`);
const angle = computed(() => `${ Math.atan(dx.value / 10) }rad`);
</script>

<template>
	<div v-if="isDragging" class="dragged">
		<Component :is="dragged.component" v-if="dragged?.type === 'component'"/>
		<img v-if="dragged?.type === 'image'" :height="dragged.height" :src="dragged.src" :width="dragged.width"
				 alt="drop image" aria-hidden="true">
	</div>
</template>

<style scoped>
.dragged {
	pointer-events: none;
	position: fixed;
	top: v-bind(top);
	left: v-bind(left);
	rotate: v-bind(angle);
	transition: rotate linear 100ms;
}

</style>