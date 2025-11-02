<script setup lang="ts">

import { computed, ref } from "vue";
import { CardInstance, useDeckStore } from "../stores/deck.store";
import { useDraggableStore } from "../stores/draggable.store";
import { useResourceStore } from "../stores/resource.store";
import CostDisplay from "./cost-display.vue";


const {card} = defineProps<{
	card: CardInstance,
}>()

const resourceStore = useResourceStore();
const deckStore = useDeckStore();
const draggable = useDraggableStore();

const isPlacable = computed(() => resourceStore.canConsume(...card.cost))
const isActive = computed(() => deckStore.active === card);
function select() {
	deckStore.active = card;
}

const seed = ref(0);
const hoverAngle = computed(() => `${ (seed.value - .5) * 15 }deg`)

function hover() {
	seed.value = Math.random();
}

function dragStart(event: DragEvent) {
	deckStore.dragged = card;

	draggable.dragged = {
		type: 'image',
		src: `data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2280%22>${ card.icon }</text></svg>`,
		height: 120,
		width: 120
	}

	event.dataTransfer?.setDragImage(new Image(), 25, 25);
	event.dataTransfer?.setData('text/card-id', card.id);
}

const isDragged = computed(() => deckStore.dragged === card)
</script>

<template>
	<div
			:class="{placable: isPlacable, active: isActive, 'is-dragged': isDragged}"
			class="card"
			draggable="true"
			@click="select"
			@dragstart="dragStart"
			@mouseenter="hover"
	>
			<p>{{card.icon}} {{ card.name }}</p>
			<CostDisplay :cost="card.cost"/>
	</div>
</template>

<style scoped>
	.card {
		background: #2c3e50;
		border-radius: 5px;
		padding: .5em;
		font-size: 1.5rem;
		transition: transform ease-in-out 500ms;
		isolation: isolate;
		box-shadow: 0 0 10px hsla(0, 0%, 0%, 18%),
		0 0 3px hsla(0, 0%, 0%, 80%);

		&.is-dragged {
			opacity: 0;
		}

		&:not(.placable) {
			filter: saturate(60%);
		}
		/* todo use aria stuff instead */

		&.active {
			--offset: -5em;
		}

		&:hover,
		&.active {
			transform: translateY(var(--offset, -2.5em)) rotate(v-bind(hoverAngle));
			transition-duration: 300ms;
			transition-delay: 50ms;
		}

		&::after {
			content: '';
			//background-color: lime;
			display: block;
			width: 100%;
			aspect-ratio: 1;
		}
	}
</style>