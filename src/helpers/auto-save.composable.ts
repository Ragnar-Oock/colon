import { watchEffect, WatchHandle } from "vue";
import { useDeckStore } from "../stores/deck.store";
import { useGridStore } from "../stores/grid.store";
import { loadHand, saveHand } from "./save-hand.helper";
import { loadMap, saveMap } from "./save-map.helper";
import { currentVersion, getSaveFormatVersion, isCompatible, setSaveFormatVersion } from "./save-version.helper";

export function useAutoSave(slot = 0): WatchHandle {
	const version = getSaveFormatVersion(slot);
	if (!isCompatible(version)) {
		// would need to handle format upgrade here somehow... problem for latter
		throw new Error(`Save Version in slot ${ slot.toString(10) } is not compatible with current version :(`);
	}

	setSaveFormatVersion(currentVersion, slot);

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