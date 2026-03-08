<script setup lang="ts">
	import { ref, watch } from "vue";
	import { useScoreStore } from "./score.store";

	const score = useScoreStore();

	const animatedScore = ref(score.score);

	const interval = 120;
	let lastIncrease = 0;

	function animate(time: number = performance.now()): void {
		if (score.score > animatedScore.value && time > lastIncrease + interval) {
			animatedScore.value += 1;
		}
		requestAnimationFrame(animate);
	}

	const added = ref(0);
	const hasChanged = ref(false);
	watch(() => score.score, (newScore, oldScore) => {
		animate();
		added.value = newScore - oldScore;
		hasChanged.value = true;

		setTimeout(() => {
			hasChanged.value = false
		}, 150);
		setTimeout(() => {
			added.value = 0;
		}, 300);
	});
</script>

<template>
	<div class="score">
		<div
			class="tally"
			:class="{'has-changed': hasChanged}"
		>{{ animatedScore }}
		</div>
		<transition appear name="score-proc">
			<div class="score-proc" v-show="added > 0" :key="added">+{{ added }}</div>
		</transition>
	</div>
</template>

<style scoped>
	.score {
		position: absolute;
		top: 0;
		left: 0;
		padding: 1em 2em;
		font-size: 2rem;
		font-weight: bold;
	}

	.tally {
		transition: transform ease-out 150ms;

		&.has-changed {
			transform: scale(120%);
		}
	}

	.score-proc {
		position: absolute;
		top: 100%;
		left: 50%;
	}

	.score-proc-enter-active {
		transition: 500ms ease-out;
		transition-property: transform, opacity;
	}

	.score-proc-enter-from {
		opacity: 1;
	}

	.score-proc-enter-to {
		opacity: 0;
		transform: translateY(5rem);
	}
</style>