import { defineStore } from "pinia";
import { computed, reactive, ref } from "vue";
import { card, CardDescriptor, CardInstance } from "../helpers/card.helper";

export const useDeckStore = defineStore('deck', () => {
	const hand = ref<CardInstance[]>([]);
	const active = ref<CardInstance | null>(null);

	/**
	 * All possible cards that can be drawn into a deck
	 */
	const deck = reactive<CardDescriptor[]>([]);

	const registry = computed(() =>
		new Map(
			deck
				.map(descriptor => [
					descriptor.proto.name,
					descriptor
				])
		)
	)


	/**
	 * create a new card and put it in the hand
	 */
	function draw(): void {
		hand.value.push(card(pick().proto))
	}

	/**
	 * pick a card from all the available cards taking the ponderation into account.
	 */
	function pick() {
		const drawIndex = Math.random() * totalPonderation.value;

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
		return pick
	}

	/**
	 * Remove a card from the hand (to be used, discarded or anything else)
	 * If the card is active it will be unmarked as such.
	 * @param card
	 */
	function remove(card: CardInstance): void {
		if (!hand.value.includes(card)) {
			throw new Error("I don't know that card sir");
		}

		hand.value = hand.value.filter(cardInHand => cardInHand !== card);
		if (active.value === card) {
			active.value = null;
		}
	}

	function register(descriptor: CardDescriptor): void {
		deck.push(descriptor);
	}

	const totalPonderation = computed(() => deck.reduce((acc, {ponderation}) => acc + ponderation, 0));


	return {
		deck,
		registry,
		hand,
		active,
		draw,
		register,
		pick,
		remove
	}
})
