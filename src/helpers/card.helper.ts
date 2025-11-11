import emitter, { Emitter, EventHandlerMap } from "mitt";
import { Cell, FilledCell, GridVec } from "../stores/grid.store";
import { Cost, ResourceTrigger } from "../stores/resource.store";
import { ScorePredicate } from "./score-predicate";

export type CardHook = (...args: unknown[]) => void;

export interface CardHooks {
	// hooks declarations added by extending this interface
	[x: string | symbol]: CardHook;
}

export type CardType = string;
export type ProtoCard<card extends CardInstance> = Omit<card, 'id' | 'hooks'>

export function card<card extends CardInstance>(proto: ProtoCard<card>, hooks?: EventHandlerMap<CardHooks>): Required<card> {
	return {
		...proto,
		id: crypto.randomUUID(),
		hooks: emitter(hooks)
	} as unknown as Required<card>
}

export interface ScoreHelpers {
	getNeighbors: (at: Readonly<GridVec>) => Cell[];
	floodFetch: (start: Readonly<GridVec>, predicate: ScorePredicate) => Cell[];
}

export interface CardInstance {
	name: CardType;
	icon: string;
	cost: Cost[];
	id: string;
	trigger?: ResourceTrigger;
	hooks: Emitter<CardHooks>;
	/**
	 * Invoked before being placed to check if the current position is viable.
	 *
	 * Resolves to true if not provided, i.e. all placement near any other card is valid.
	 *
	 * @param neighbors a list of all future neighbors and their relative position
	 */
	checkNeighbors?: (neighbors: Cell[]) => boolean;
	/**
	 * Compute the list of cards that will contribute to the score of a card placement, final score will be the sum of the
	 * returned card's multipliers
	 *
	 * Resolves to an empty array if not provided, i.e. placement score is not impacted by neighboring cards.
	 */
	scoreContributors?: (
		placement: GridVec,
		helpers: ScoreHelpers
	) => FilledCell[],

	/**
	 * Compute the score value of a card from itself, and it's direct neighbors.
	 *
	 * Resolves to a value of 0 if not provided.
	 *
	 * @param neighbors a list of all neighbors and their relative position.
	 * @returns the value of the card given its placement on the board,
	 * **MUST** be an integer, **CAN** be negative, positive or 0.
	 */
	multiplier?: (neighbors: Cell[]) => number;

	/**
	 * Compute the score multiplier bonus this card can grant to it's neighbors.
	 *
	 * Resolves to a value of 0 if not provided, i.e. no bonus
	 *
	 * @param type the type of the neighbor asking for a bonus.
	 */
	bonus?: (type: CardType) => number;
}

export interface CardDescriptor {
	/**
	 * a ponderation of the likeliness of drawing a specific card :
	 * - 1 : as likely as anything else
	 * - \>1 : more likely
	 * - \<1 : less likely
	 */
	ponderation: number;

	/**
	 * Create a card instance to use in a hand
	 */
	create(): CardInstance
}