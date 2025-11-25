import { watchEffect, WatchHandle } from "vue";
import { useDeckStore } from "../stores/deck.store";
import { useGridStore } from "../stores/grid.store";
import { loadHand, saveHand } from "./save-hand.helper";
import { loadMap, saveMap } from "./save-map.helper";

export function useAutoSave(slot = 0): WatchHandle {
	const grid = useGridStore();
	grid.cells = loadMap(slot);
	const mapSaveHandle = watchEffect(() => saveMap(grid.cells, slot));

	const deck = useDeckStore();
	deck.hand = loadHand(slot);
	const handSaveHandle = watchEffect(() => saveHand(deck.hand, slot));

	const stopWatching: WatchHandle = () => stopWatching.stop();

	stopWatching.stop = () => {
		mapSaveHandle.stop();
		handSaveHandle.stop();
	};
	stopWatching.pause = () => {
		mapSaveHandle.pause();
		handSaveHandle.pause();
	}
	stopWatching.resume = () => {
		mapSaveHandle.resume();
		handSaveHandle.resume();
	}

	return stopWatching;
}