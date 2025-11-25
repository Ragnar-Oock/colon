import { useDeckStore } from "../stores/deck.store";
import { card, CardInstance, CardType } from "./card.helper";
import { iter } from "./iterator.helper";
import { entitySeparator, slotKeyBuilder } from "./save-format.helper";

function serializeHand(hand: CardInstance[]): string {
	return hand
		.map(card => card.name)
		.join(entitySeparator);
}

function deserializeHand(save: string): CardInstance[] {
	if (save.length === 0) {
		return [];
	}

	const {registry} = useDeckStore();

	return save
		.split(entitySeparator)
		.map((cardType, index) => {
			const descriptor = registry.get(cardType as CardType);
			if (descriptor === undefined) {
				throw new ReferenceError(`unknown card "${ cardType }" in hand at index ${ index }`)
			}
			else {
				return card(descriptor.proto);
			}
		})
}

const getSlotKey = slotKeyBuilder('hand');

export function saveHand(hand: CardInstance[], slot = 0): void {
	localStorage.setItem(
		getSlotKey(slot),
		JSON.stringify(serializeHand(hand))
	);
}

export function loadHand(slot = 0): CardInstance[] {
	const save = localStorage.getItem(getSlotKey(slot));
	if (save === null) {
		const {pick} = useDeckStore();
		// TODO declare this value somewhere
		return iter(7)
			.map(() => card(pick().proto))
			.toArray();
	}
	return deserializeHand(JSON.parse(save));
}

export function forgetHand(slot = 0): void {
	localStorage.removeItem(getSlotKey(slot))
}