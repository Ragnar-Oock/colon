<script lang="ts" setup>
	import { useScoreContribution } from "../helpers/useScoreContribution";
	import { FilledCell, GridVec } from "../stores/grid.store";

	const {
		cell
	} = defineProps<{
		cell: FilledCell & { visiblePosition: GridVec }
	}>();

	const contribution = useScoreContribution(cell.position);

</script>

<template>
	<div class="board-card">
		<Transition appear>
			<div
				v-if="contribution !== null"
				:key="contribution"
				class="score"
			>+ {{ contribution }}
			</div>
		</Transition>
		<div class="icon">{{ cell.card?.icon }}</div>
		<!--				<span
							v-if="cell.card?.trigger !== undefined"
							class="trigger"
							title="trigger harvest on :"
						>{{ cell.card?.trigger }}</span>-->
	</div>
</template>

<style scoped>
	.board-card {
		grid-area: v-bind('cell.visiblePosition.y') / v-bind('cell.visiblePosition.x');
		position: relative;
		user-select: none;

		.icon {
			font-size: 5em;
			pointer-events: none;
		}

		.score {
			position: absolute;
			top: -1rem;
			left: 50%;
			translate: -50%;
			font-size: 2em;
		}

		/*.trigger {
			position: absolute;
			top: 0;
			left: 0;
			min-width: 3ch;
			height: 3ch;
			text-align: center;

			background: #2c3e50;
			border-radius: 100%;
		}*/

		.v-enter-active,
		.v-leave-active {
			transition: 0.3s ease;
			transition-property: transform, opacity;
		}

		/*.v-leave-active {*/
		/*	transition-delay: 300ms;*/
		/*}*/

		.v-enter-from {
			transform: translateY(1em);
			opacity: 0;
		}

		.v-leave-to {
			transform: translateY(-1em);
			opacity: 0;
		}
	}
</style>