<script lang="ts" setup>
	defineProps<{ score: number, main?: boolean }>()
</script>

<template>
	<Transition appear>
		<div
			v-if="score > 0"
			:key="score"
			:class="{'accent': main}"
			class="score"
		>+ {{ score }}
		</div>
	</Transition>
</template>

<style scoped>
	.score {
		position: absolute;
		top: -.5rem;
		left: 50%;
		translate: -50%;
		font-size: 1.5em;

		&.accent {
			top: -1rem;
			font-size: 2em;
			font-weight: bold;
		}
	}

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
</style>