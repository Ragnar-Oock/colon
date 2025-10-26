import { defineStore } from "pinia";
import { computed, reactive, ref } from "vue";
import { Cost } from "./resource.store";

export interface CardInstance {
	name: string;
	icon: string;
	cost: Cost[];
	id: string;
}

export interface CardDescriptor {
	/**
	 * Create a card instance to use in a hand
	 */
	create(): CardInstance
	/**
	 * a ponderation of the likeliness of drawing a specific card :
	 * - 1 : as likely as anything else
	 * - \>1 : more likely
	 * - \<1 : less likely
	 */
	ponderation: number;
}

export const useDeckStore = defineStore('deck',() => {
	const hand = reactive<CardInstance[]>([]);

	/**
	 * All possible cards that can be drawn into a deck
	 */
	const deck = reactive<CardDescriptor[]>([]);


	function draw(): void {
		const drawIndex = Math.random() * totalPonderation.value;

		console.log(`drawing ${drawIndex}`)

		// is that default useful and sensible ?
		let visitedPonderation = 0;
		let deckIndex = 0;
		let pick: CardDescriptor | undefined;
		do {
				pick = deck.at(deckIndex);
				visitedPonderation += pick!.ponderation;
				deckIndex++;
		} while (visitedPonderation < drawIndex)

		if (pick === undefined) {
			throw new Error('No card available to draw.');
		}

		hand.push(pick.create())
	}

	function register(descriptor: CardDescriptor): void {
		deck.push(descriptor);
	}

	const totalPonderation = computed(() => deck.reduce((acc, {ponderation}) => acc + ponderation, 0))

	return {
		deck,
		hand,
		draw,
		register
	}
})
