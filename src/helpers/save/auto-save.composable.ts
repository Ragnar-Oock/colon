import { tryOnMounted, tryOnUnmounted } from "@vueuse/core";
import type { EffectScope } from "vue";
import { effectScope, watchEffect } from "vue";
import type { FilledCell } from "../../domains/cell/cell";
import { useScoreStore } from "../../domains/score/score.store";
import { useDeckStore } from "../../stores/deck.store";
import { useGridStore } from "../../stores/grid.store";
import { loadHand, saveHand } from "./save-hand.helper";
import { loadMap, saveMap } from "./save-map.helper";
import { loadScore, saveScore } from "./save-score.helper";
import { currentVersion, getSaveFormatVersion, isCompatible, setSaveFormatVersion } from "./save-version.helper";

export type AutoSaveOptions = {
	slot?: number,
	newMap?: () => FilledCell[],
}

export function useAutoSave({slot = 0, newMap = () => []}: AutoSaveOptions): EffectScope {
	const scope = effectScope();

	tryOnMounted(() => {
		scope.run(() => {
			const version = getSaveFormatVersion(slot);
			if (!isCompatible(version)) {
				// would need to handle format upgrade here somehow... problem for latter
				throw new Error(`Save Version in slot ${ slot.toString(10) } is not compatible with current version :(`);
			}

			setSaveFormatVersion(currentVersion, slot);

			const grid = useGridStore();
			grid.cells = loadMap(slot, newMap);
			watchEffect(() => saveMap(grid.cells, slot));

			const deck = useDeckStore();
			deck.hand = loadHand(slot);
			watchEffect(() => saveHand(deck.hand, slot));

			const score = useScoreStore();
			score.score = loadScore(slot);
			watchEffect(() => saveScore(score.score, slot));
		})
	})

	tryOnUnmounted(() => {
		scope.stop();
	})

	return scope;
}