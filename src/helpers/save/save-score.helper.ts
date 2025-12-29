import { slotKeyBuilder } from "./save-format.helper";


const getSlotKey = slotKeyBuilder('score');


const scoreSaveRadix = 32;

export function saveScore(score: number, slot = 0): void {
	localStorage.setItem(getSlotKey(slot), JSON.stringify(score.toString(scoreSaveRadix)));
}

export function loadScore(slot = 0): number {
	return parseInt(JSON.parse(localStorage.getItem(getSlotKey(slot)) ?? "0"), scoreSaveRadix);
}