export interface CommandCollection {
	// commands will be added here with module augmentation
	undo: () => void;

	// Reserved for the chain functionality.
	run: never;
	// Reserved for the chain functionality.
	chain: never;
}

export type SingleCommand = {
	readonly [name in keyof CommandCollection as CommandCollection[name] extends never ? never : name]: () => boolean;
}
export type ChainedCommand = {
	readonly [name in keyof CommandCollection as CommandCollection[name] extends never ? never : name]: () => ChainedCommand;
} & {
	run: () => boolean;
}

export type CanCommand = {
	readonly [name in keyof CommandCollection as CommandCollection[name] extends never ? never : name]: () => boolean;
} & {
	chain: () => ChainedCommand;
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

export interface Command {
	/**
	 * Add the steps implementing the command's action to the given transaction
	 * @param transaction the transaction to add steps to
	 * @returns can the command be played in the current context ?
	 */
	(transaction: TransactionInterface): boolean;
}

export interface CommandConstructor {
	(): Command;
}

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

export interface TransactionInterface {
	// steps: readonly Step[];

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
	public transaction: TransactionInterface;

	constructor(msg: string, cause: Error, transaction: TransactionInterface) {
		super(msg, cause);
		this.transaction = transaction;
	}
}

class Transaction implements TransactionInterface {
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

		for (const step of playedSteps.reverse()) {
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
		if (!(name in this._commands)) return this;
		
		this._commands[name] = command;
		
		return this;
	}

	get can(): CanCommand {
		return undefined; // todo implement can functionality
	}

	get chain(): ChainedCommand {
		return undefined; // todo implement chain functionality
	}

	get commands(): SingleCommand {
		const transaction = new Transaction();
		return new Proxy<SingleCommand>({} as SingleCommand, {
			get: (_, property: string | symbol) => {
				// @ts-expect-error property can't index _commands
				const commandConstructor = this._commands[property] as CommandConstructor | undefined;
				if (!commandConstructor) return undefined;

				commandConstructor()(transaction);

				transaction.apply();
			}
		});
	}

}