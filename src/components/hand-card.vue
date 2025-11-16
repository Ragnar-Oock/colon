<script setup lang="ts">

	import { computed, onUnmounted, ref } from "vue";
	import { CardInstance } from "../helpers/card.helper";
	import { useDeckStore } from "../stores/deck.store";
	import { useDraggableStore } from "../stores/draggable.store";
	import { useResourceStore } from "../stores/resource.store";


	const {card} = defineProps<{
		card: CardInstance,
	}>()

	const resourceStore = useResourceStore();
	const deckStore = useDeckStore();
	const draggable = useDraggableStore();
	const index = computed(() => deckStore.idleHand.indexOf(card))

	const canUse = computed(() => resourceStore.canConsume(...card.cost))
	const isActive = computed(() => index.value === -1);

	const seed = ref(0);
	const hoverAngle = computed(() => `${ (seed.value - .5) * 15 }deg`)
	const hover = () => seed.value = Math.random();

	const parameter = computed(() => (index.value / (deckStore.idleHand.length - 1)) - 0.5);

	function dragStart(event: DragEvent) {
		draggable.start({
			type: 'image',
			src: `data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text x=%22-0.06em%22 y=%221em%22 font-size=%2278%22>${ card.icon }</text></svg>`,
			height: 120,
			width: 120
		}, {
			onCancel: () => {
			},
			onEnd() {
				deckStore.active = null
			},
		})

		const dataTransfer = event.dataTransfer!;

		dataTransfer.setDragImage(new Image(), 0, 0);
		dataTransfer.setData('text/card-id', card.id);
		dataTransfer.effectAllowed = 'move';

		deckStore.active = card;
	}

	onUnmounted(() => console.log('unmounted'))


</script>

<template>
	<Transition appear>
		<div
			:class="{
		'can-use': canUse,
		'is-dragged': isActive,
	}"
			class="card"
			draggable="true"
			@dragstart="dragStart"
			@mouseenter="hover"
		>
			<p>{{ card.icon }} {{ card.name }}</p>
		</div>
	</Transition>
</template>

<style scoped>
	@property --bgc-pos {
		syntax: "<percentage>";
		inherits: false;
		initial-value: 100%;
	}

	@property --bgc-angle {
		syntax: "<angle>";
		inherits: false;
		initial-value: -146deg;
	}

	@property --vertical-offset {
		syntax: "<number>";
		inherits: false;
		initial-value: 0;
	}

	.card {
		--bgc: #2c3e50;
		--card-accent-1: oklch(0.508 0.043 110.214);
		--card-accent-2: oklch(0.833 0.076 109.607);

		background-color: var(--bgc);
		/*@formatter:off*/
		background:
			linear-gradient(var(--bgc), var(--bgc)) padding-box,
			linear-gradient(
				var(--bgc-angle),
				var(--card-accent-1) 0%,
				var(--card-accent-1) 25%,
				var(--card-accent-2) 50%,
				var(--card-accent-1) 75%,
				var(--card-accent-1) 100%
			) var(--bgc-pos) var(--bgc-pos) / 200% border-box;
		/*@formatter:on*/
		border-radius: 10px;
		padding: .5em;
		font-size: 1.5rem;
		isolation: isolate;
		box-shadow: 0 0 15px hsla(0, 0%, 0%, 18%),
		0 0 5px hsla(0, 0%, 0%, 45%);
		user-select: none;
		cursor: grab;
		border: solid transparent 5px;
		position: relative;


		grid-area: 1/1;
		--hovered: 0deg;
		--unit: 23vmin;
		--radius: 1.97;
		--arc-length: 0.9rad;
		--vertical-offset: calc(var(--radius) * cos((-1 * var(--arc-length)) / 2));
		--x: calc(var(--unit) * var(--radius) * sin(v-bind(parameter) * var(--arc-length)));
		--y: calc(var(--unit) * -1 * (var(--radius) * cos(v-bind(parameter) * var(--arc-length)) - var(--vertical-offset)));

		--idle-angle: calc(tan(v-bind(parameter)) * 1rad);

		/*@formatter:off*/
		transform:
			translateX(var(--x))
			translateY(var(--y))
			rotate(var(--idle-angle))
			translateY(var(--offset, 0px))
			rotate(var(--hovered))
		;
		/*@formatter:on*/
		--position-easing: linear(0, 0.007 0.9%, 0.027 1.9%, 0.117 4.2%, 0.634 12.9%, 0.838 17.1%, 0.914 19.2%, 0.976 21.4%, 1.021 23.6%, 1.053 26%, 1.073 29.2%, 1.075 32.9%, 1.014 48%, 0.996 57.5%, 1);
		--border-easing: linear(0, 0.008 1.1%, 0.034 2.3%, 0.134 4.9%, 0.264 7.3%, 0.683 14.3%, 0.797 16.5%, 0.89 18.6%, 0.967 20.7%, 1.027 22.8%, 1.073 25%, 1.104 27.3%, 1.123 30.6%, 1.119 34.3%, 1.018 49.5%, 0.988 58.6%, 0.985 65.2%, 1 84.5%, 1);
		transition: transform var(--position-easing) 650ms,
		--bgc-pos var(--border-easing) 550ms,
		--bgc-angle ease-out 550ms;


		&:not(.can-use) {
			filter: saturate(60%);
		}

		/* todo use aria stuff instead */

		&.is-dragged {
			display: none;
		}

		&:hover {
			--offset: -2.5rem;
			--hovered: v-bind(hoverAngle);
			--bgc-pos: 0%;
			--bgc-angle: -60deg;
			transition-delay: 50ms;
		}

		&::after {
			content: '';
			display: block;
			width: 100%;
			aspect-ratio: 1;
		}

		&::before {
			content: '';
			display: block;
			width: 100%;
			aspect-ratio: 1;
			top: 100%;
			position: absolute;
		}
	}

	.v-enter-active {
		transition: --vertical-offset ease-in 500ms;
	}

	.v-enter-from {
		--vertical-offset: -2;
	}
</style>