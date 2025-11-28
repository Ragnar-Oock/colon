<script lang="ts" setup>
	import { computed } from "vue";
	import { useBoardStore } from "../stores/board.store";
	import { GridVec } from "../stores/grid.store";

	const {bonus = 0, main = false, score, placement} = defineProps<{
		score: number,
		bonus?: number,
		main?: boolean,
		/**
		 * position of the score on the map
		 */
		placement?: GridVec,
	}>();

	const board = useBoardStore();

	const gridArea = computed(() => {
		if (placement) {
			const {x, y} = board.toDisplayGrid(placement);
			return `${ y } / ${ x }`;
		}
		else {
			return undefined;
		}
	});
</script>

<template>
	<div
		:style="{ gridArea }"
		class="placement-score"
	>
		<Transition>
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
		<Transition>
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
		inset: 0;
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
		--offset-y: calc(1em * var(--direction, 1));
		opacity: 0;
	}

	.v-leave-to {
		--offset-y: calc(-1em * var(--direction, 1));
		opacity: 0;
	}
</style>