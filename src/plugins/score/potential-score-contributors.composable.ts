import { ComputedRef } from "vue";
import { useBoardStore } from "../board/board.store";
import { useDeckStore } from "../deck/deck.store";
import type { ScoreContributor } from "./score.store";
import { useScoreStore } from "./score.store";

export function usePotentialScoreContributors(): ComputedRef<readonly ScoreContributor[]> {
	const deck = useDeckStore();
	const board = useBoardStore();
	return useScoreStore().getContributors(() => deck.active, () => board.hoveredCell);
}