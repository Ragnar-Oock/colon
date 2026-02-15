<script lang="ts" setup>
	import { useEventListener, useMounted, useMouse } from "@vueuse/core";
	import { storeToRefs } from "pinia";
	import { computed, reactive, watchEffect } from "vue";
	import { clamp } from "../helpers/math.helper";
	import { useDraggableStore } from "../stores/draggable.store";

	const {dragged} = storeToRefs(useDraggableStore());

	useEventListener(window, 'dragover', event => {
		if (event.dataTransfer?.getData('draggable-item')) {
			event.preventDefault();
		}
	});

	const {x, y} = useMouse({type: 'page'})
	const previousResults: { delta: number, x: number, y: number }[] = reactive(Array.from({length: 10}, () => ({
		delta: 1,
		x: 0,
		y: 0
	})));
	let previousTime = 0;
	let pX = 0;
	let pY = 0;

	const pollPosition: FrameRequestCallback = time => {
		if (!isMounted.value) {
			return
		}

		previousResults.pop();
		previousResults.unshift({
			delta: time - previousTime,
			x: x.value - pX,
			y: y.value - pY,
		});
		previousTime = time;
		pX = x.value;
		pY = y.value;

		requestAnimationFrame(pollPosition);
	}

	const isMounted = useMounted();

	watchEffect(() => {
		if (isMounted.value) {
			requestAnimationFrame(pollPosition);
		}
	})

	const isDragging = computed(() => dragged.value !== null);
	const left = computed(() => `${ x.value }px`);
	const top = computed(() => `${ y.value }px`);
	const offsetX = computed(() => `${ -(dragged.value?.height ?? 0) / 2 }px`);
	const offsetY = computed(() => `${ -(dragged.value?.height ?? 0) / 2 }px`);
	const width = computed(() => `${dragged.value?.width}px`);
	const height = computed(() => `${dragged.value?.height}px`);

	const angles = computed(() => ({
		x: `${ Math.tan(previousResults.reduce((acc, {x}) => acc + x, 0) / (previousResults.length * 50)) }rad`,
		y: `${ clamp(
			-0.75,
			Math.tan(previousResults.reduce((acc, {y}) => acc + y, 0) / (previousResults.length * 30)),
			0.75
		) }rad`,
	}));
</script>

<template>
	<div v-if="isDragging" class="dragging-viewport">
		<div class="dragged">
			<Component :is="dragged.component" v-if="dragged?.type === 'component'"/>
			<span v-if="dragged?.type === 'emoji'" class="emoji">
				{{ dragged.char }}	
			</span>
		</div>
	</div>
</template>

<style scoped>
	.dragging-viewport {
		position: fixed;
		top: 0;
		left: 0;
		transform: translate(v-bind(left), v-bind(top));
		pointer-events: none;
		perspective: 15cm;
		perspective-origin: top left;
	}

	.dragged {
		position: fixed;
		top: v-bind(offsetY);
		left: v-bind(offsetX);
		transform: rotateZ(v-bind(angles.x)) rotateX(v-bind(angles.y));
		transition: rotate linear 100ms;
		width: v-bind(width);
		height: v-bind(height);
		display: grid;
		place-content: center;
	}

	.emoji {
		font-size: 5rem;
	}

</style>