// oxlint-disable-next-line no-abusive-eslint-disable
// oxlint-disable
// this contains experiments that needs to be refined and moved somewhere else, we'll ignore linting/formating for it
// until it's worked on again

import { noOp } from "../helpers/no-op";

export interface CommandCollection {
	// commands will be added here with module augmentation
	undo: () => void;

	// Reserved for the chain functionality.
	run: never;
	// Reserved for the chain functionality.
	chain: never;
}

/**
 * Run a command and apply the transaction if appropriate.
 */
export type Invoker = () => boolean;

export type SingleCommand = {
	readonly [name in keyof CommandCollection as CommandCollection[name] extends never ? never : name]: Invoker;
}
export type ChainedCommand = {
	readonly [name in keyof CommandCollection as CommandCollection[name] extends never ? never : name]: () => ChainedCommand;
} & {
	run: Invoker;
}

export type CanCommand = {
	readonly [name in keyof CommandCollection as CommandCollection[name] extends never ? never : name]: Invoker;
} & {
	chain: ChainedCommand;
}

export interface Commander {
	/**
	 * A set of all commands available to run on their own, each call creates a step in the history.
	 */
	get commands(): SingleCommand;

	/**
	 * A set of all commands available to run as a group, a chain of command will create a single step in the history.
	 * You can add more commands by invoking the corresponding method in the returned object. Execute the chain by calling
	 * the `.run()` method.
	 *
	 * ⚠️ do not reuse a chain once you called the `.run()` method on it.
	 */
	get chain(): ChainedCommand;

	/**
	 * A set of all commands available to check if they can be played in the current context.
	 *
	 * When used in concert with `.chain` will return `false` if at least one command in the chain can't run.
	 *
	 * Remember to call `.run()` to complete the check when used with `.chain()`.
	 */
	get can(): CanCommand;

	/**
	 * Add a new command.
	 * @param name a valid JS identifier string, will be used to invoke the command.
	 * @param command the command implementation.
	 */
	register: (name: keyof NonNever<CommandCollection>, command: CommandConstructor) => this;
}

/**
	 * Add the steps implementing the command's action to the given transaction
	 * @param transaction the transaction to add steps to
	 * @param dispatch
	 * @returns can the command be played in the current context ?
	 */
export type Command = (transaction: Transaction, dispatch?: (transaction: Transaction) => void) => boolean;

export type CommandConstructor = () => Command;

export interface Step {
	/**
	 * Execute the steps action
	 */
	apply: () => void;
	/**
	 * Undo the actions taken in `apply`
	 */
	remove: () => void;
}

export interface Transaction {
	/**
	 * add a step in the transaction to be played when the transaction is applied
	 * @param step
	 */
	add: (step: Step) => this;
	/**
	 * Apply all the steps in order.
	 *
	 * Will try to undo applied steps if on throws and error.
	 *
	 * @throws TransactionError failed to undo applied steps after error
	 */
	apply: () => boolean;
	/**
	 * Undo all the steps in reverse order
	 */
	remove: () => boolean;
}
/**
 * Filter out any property of `record` that evaluates to `never`.
 *
 * @public
 */
export type NonNever<record> = {
	[K in keyof record as record[K] extends never ? never : K]: record[K];
}


type _Commands = {
	[name in keyof CommandCollection as CommandCollection[name] extends never ? never : name]: CommandConstructor;
}

class TransactionError extends Error {
	public transaction: Transaction;

	constructor(msg: string, cause: Error, transaction: Transaction) {
		super(msg, cause);
		this.transaction = transaction;
	}
}

class BaseTransaction implements Transaction {
	private readonly steps: Step[] = [];
	
	public add(step: Step): this {
		this.steps.push(step);
		return this;
	}
	
	public apply(): boolean {
		const playedSteps: Step[] = []
		// play steps
		
		for (const step of this.steps) {
			try {
				step.apply()
			}
			catch (error) {
				console.error(new TransactionError('Failed to apply transaction', error as Error, this));
			}
			playedSteps.push(step);
		}
		
		if (playedSteps.length === this.steps.length) {
			return true;
		}
		
		// rollback on fail

		for (const step of playedSteps.toReversed()) {
			try {
				step.remove();
			}
			catch (error) {
				throw new TransactionError('Failed to rollback transaction after error', error as Error, this);
			}
		}

		return false;
	}

	public remove(): boolean {
		for (const step of this.steps.toReversed()) {
			try {
				step.remove();
			}
			catch (error) {
				// throw? log? something else ?
				throw new TransactionError('Failed to remove transaction', error as Error, this);
			}
		}

		return true;
	}
}

export class CommandService implements Commander {
	private readonly _commands: _Commands = {} as _Commands;

	register(name: keyof NonNever<CommandCollection>, command: CommandConstructor): this {
		if (!(name in this._commands)) {
			return this;
		}
		
		this._commands[name] = command;
		
		return this;
	}

	get can(): CanCommand {
		const transaction = this.transaction;
		const dispatch = undefined;
		return new Proxy({} as CanCommand, {
			get: (_, property): ChainedCommand | Invoker | undefined => {

				if (property === 'chain') {
					return this.getChain(transaction, dispatch);
				}

				// @ts-expect-error property can't index _commands
				const commandConstructor = this._commands[property] as CommandConstructor | undefined;
				if (!commandConstructor) {
					return undefined;
				}

				return () => commandConstructor()(transaction, dispatch) && transaction.apply();
			}
		});
	}

	/**
	 * Create a new transaction to play commands with.
	 * @private
	 */
	private get transaction() {
		return new BaseTransaction();
	}

	get chain(): ChainedCommand {
		return this.getChain(this.transaction, noOp);
	}

	get commands(): SingleCommand {
		const transaction = this.transaction;
		const dispatch = noOp;
		return new Proxy({} as SingleCommand, {
			get: (_, property): Invoker | undefined => {
				// @ts-expect-error property can't index _commands
				const commandConstructor = this._commands[property] as CommandConstructor | undefined;
				if (!commandConstructor) {
					return undefined;
				}

				return () => commandConstructor()(transaction, dispatch) && transaction.apply()
			}
		});
	}

	/**
	 * Create a chain of commands to apply on the given transaction.
	 * @param transaction the transaction commands should add their steps to
	 * @param dispatch the dispatch function to pass to the commands invoked in the chain
	 * @private
	 */
	private getChain(transaction: BaseTransaction, dispatch?: (transaction: Transaction) => void): ChainedCommand {
		const chain = new Proxy({} as ChainedCommand, {
			get: (_, property): (() => ChainedCommand) | Invoker | undefined => {
				// invoke the chain
				if (property === 'run') {
					return () => transaction.apply()
				}

				// @ts-expect-error property can't index _commands
				const commandConstructor = this._commands[property] as CommandConstructor | undefined;

				// no command exists with the name held by property
				if (!commandConstructor) {
					return undefined;
				}

				// add a command in the chain
				return () => {
					commandConstructor()(transaction, dispatch);
					return chain;
				};
			}
		});

		return chain;
	}
}

const commander = new CommandService();

export interface CommandCollection {
	hi: () => void
}

commander.register('hi', () => (tr, dispatch) => {})