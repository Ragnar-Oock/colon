<script lang="ts" setup>
	import { computed } from "vue";
	import { useVisibleCellPosition } from "../domains/cell/cell-position.composable";
	import type { GridVec } from "../stores/grid.store";

	const {bonus = 0, main = false, score, placement} = defineProps<{
		score: number,
		bonus?: number,
		main?: boolean,
		/**
		 * position of the score on the map
		 */
		placement: GridVec,
	}>();

	const position = useVisibleCellPosition(placement)

	const showHighlight = computed(() => (score > 0 || bonus > 0));
	const delay = `${ Math.ceil(Math.random() * 5) * 16 * 2 }ms`
</script>

<template>
	<div
		class="placement-score"
	>
		<Transition appear>
			<div
				v-if="score > 0"
				:key="score"
				:class="{
					'accent': main,
					'has-bonus': bonus > 0
				}"
				class="score"
			>+ {{ score }}
			</div>
		</Transition>
		<Transition appear>
			<div
				v-if="bonus > 0"
				:key="bonus"
				:class="{
					'accent': main,
					'has-score': score > 0
				}"
				class="bonus"
			>+ {{ bonus }}
			</div>
		</Transition>
		<Transition appear name="blink">
			<div :class="{ highlight: showHighlight }"/>
		</Transition>
	</div>
</template>

<style scoped>
	@property --offset-x {
		initial-value: 0%;
		inherits: false;
		syntax: "<length-percentage>";
	}

	@property --offset-y {
		initial-value: 0%;
		inherits: false;
		syntax: "<length-percentage>";
	}

	.placement-score {
		user-select: none;
		position: relative;
		grid-area: v-bind('position.y') / v-bind('position.x');
	}

	.highlight {
		content: '';
		position: absolute;
		inset: 0;
		background-image: radial-gradient(circle at bottom center, rgba(90, 230, 90, 0.17), transparent);
		filter: blur(5px);

		&.blink-enter-active {
			--timing-function: linear(0, -0.019 9.2%, -0.008 15.6%, 0.036 21%, 0.117 25.7%, 0.246 30.3%, 0.423 34.7%, 0.999 44.7%, 0.443 54.3%, 0.326 57.8%, 0.296 59.5%, 0.287 61.1%, 0.296 62.6%, 0.323 64.2%, 0.43 67.4%, 0.997 77.4%, 0.83 81.6%, 0.792 83.5%, 0.779 85.4%, 0.787 86.9%, 0.812 88.6%, 0.972 95.9%, 0.994 97.9%, 1);
			transition: opacity 300ms v-bind(delay) var(--timing-function);
		}

		&.blink-enter-to {
			opacity: 1;
		}

		&.blink-enter-from {
			opacity: 0;
		}
	}

	.score,
	.bonus {
		position: absolute;
		top: -.5rem;
		left: 50%;
		translate: -50%;
		font-size: 1.5em;
		white-space: nowrap;
		transform: translateY(var(--offset-y, 0%)) translateX(var(--offset-x, 0%));

		--timing-function: cubic-bezier(0, 0.55, 0.45, 1);
		--reverse-timing-function: cubic-bezier(0.55, 0, 1, 0.45);

		transition: 0.3s var(--timing-function) --offset-y,
		0.3s var(--timing-function) --offset-x,
		0.3s var(--timing-function) opacity;

		&.accent {
			top: -1rem;
			font-size: 2em;
			font-weight: bold;
		}
	}

	.score {
		color: oklch(0.741 0.08 151.881);

		&.has-bonus {
			--offset-x: -50%;
		}
	}

	.bonus {
		color: oklch(0.741 0.081 203.738);

		&.has-score {
			--offset-x: 50%;
		}
	}

	.v-leave-active {
		transition-timing-function: var(--timing-function), var(--reverse-timing-function), var(--timing-function);
	}

	.v-enter-from {
		--offset-y: 50%;
		opacity: 0;
	}

	.v-leave-to {
		--offset-y: -50%;
		opacity: 0;
	}
</style>