import emitter from "mitt";

export type AppEvents = {
	placed: undefined,
}

export const bus = emitter<AppEvents>();