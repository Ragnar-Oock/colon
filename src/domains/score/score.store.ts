import { defineStore } from "pinia";
import type { ComputedRef, MaybeRefOrGetter } from "vue";
import { computed, ref, toValue } from "vue";
import { bus } from "../../event.helper";
import { toString } from "../../helpers/vector.helper";
import type { GridVec } from "../../stores/grid.store";
import { useGridStore } from "../../stores/grid.store";
import type { CardInstance } from "../card/card.helper";
import type { MaybeCard } from "../card/card.type";
import type { Cell } from "../cell/cell";
import { isFilled } from "../cell/cell";
import type { ScoreHelpers } from "./score.helper";


export interface ScoreContributor extends Cell {
	score: number;
	bonus: number;
}

const emptyArray = Object.freeze([]);


export const useScoreStore = defineStore('score', () => {
	const score = ref(0);

	const grid = useGridStore();

	function getScoreHelpers(at: Readonly<GridVec>): ScoreHelpers {
		return {
			get neighbors() {
				return grid.getNeighbors(at)
			},
			get placement() {
				return at;
			},
			getNeighborsAt: (position: Readonly<GridVec>) => grid.getNeighbors(position),
			floodFetch: (predicate, limit) => grid.floodFetch(at, predicate, limit)
		}
	}

	function getScoreContributors(card: CardInstance, position: GridVec): ScoreContributor[] {
		if (card === null || position === null || !grid.canPlace(card, position)) {
			return [];
		}

		const helpers = getScoreHelpers(position);

		const bonuses = new Map(
			grid.getNeighbors(position)
				.filter(isFilled)
				// oxlint-disable-next-line no-map-spread
				.map(neighbor => ({
					...neighbor,
					bonus: neighbor.card.bonus?.(card) ?? 0,
					score: 0,
				}))
				.filter(({bonus}) => bonus > 0)
				.map(neighbor => [toString(neighbor.position), neighbor])
		);
		const contributors = new Map(
			card
				.scoreContributors?.(helpers)
				// oxlint-disable-next-line no-map-spread
				.map(contributor => ({
					...contributor,
					score: (contributor.card?.scoreContribution ?? 1) * Math.max(contributor.card?.multiplier?.(grid.getNeighbors(contributor.position)) ?? 1, 1),
					bonus: 0
				}))
				.map(contributor => [toString(contributor.position), contributor])
		);

		bonuses.forEach((bonus, position) => {
			const contributor = contributors.get(position);
			if (contributor) {
				contributor.bonus = bonus.bonus
			}
			else {
				contributors.set(position, bonus);
			}
		})

		return contributors.values().toArray();
	}

	/**
	 * Create a computed that lists the cells that contributes to the score of placing a given `card` `at` a given
	 * position.
	 *
	 * @param card the card to check scoring for
	 * @param at where on the map should the scoring be computed
	 */
	function getContributors(card: MaybeRefOrGetter<MaybeCard>, at: MaybeRefOrGetter<GridVec | undefined>): ComputedRef<readonly ScoreContributor[]> {
		return computed(() => {
			const cardInstance = toValue(card);
			const position = toValue(at);

			if (cardInstance === undefined || position === undefined || !grid.canPlace(cardInstance, position)) {
				return emptyArray;
			}

			const contributors = getScoreContributors(cardInstance, position);

			return contributors.length === 0 ? emptyArray : contributors;
		})
	}

	function updateScore({card, at, forced}: { card: CardInstance, at: Readonly<GridVec>, forced: boolean }): void {
		if (forced) {
			return
		}

		const baseScore = card.baseScore ?? 1;
		const placementScore =
			getScoreContributors(card, at)
				?.reduce((acc, {score, bonus}) => acc + score + bonus, baseScore)
			?? baseScore;
		score.value += placementScore;
	}

	bus.on('placed', updateScore);

	return {
		score,
		getContributors,
		$dispose: (): void => {
			bus.off('placed', updateScore)
		}
	}
})