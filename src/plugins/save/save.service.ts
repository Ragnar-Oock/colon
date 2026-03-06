import { defineService } from "@xoram/core";
import { slotKeyBuilder } from "./save-format.helper";

type SerDe<Data, Serialised extends string = string, Type extends string = string> = {
	type: Type;
	serialize(data: Data): Serialised;
	deserialize(input: Serialised): Data;
}

export interface DataTypes {
	// data type will be added to this interface by augmentation
	// oxlint-disable-next-line typescript/consistent-indexed-object-style
	[type: string]: unknown;
}

export interface SaveService {
	load<Type extends keyof DataTypes & string>(type: Type): DataTypes[Type] | undefined;

	load<Type extends keyof DataTypes & string>(type: Type, fallback?: () => DataTypes[Type]): DataTypes[Type];

	save<Type extends keyof DataTypes & string>(type: Type, data: DataTypes[Type]): this;

	clear(): this;

	registerSerDe<Type extends keyof DataTypes & string>(serDe: SerDe<DataTypes[Type], string, Type>): this;
}

export const saveService = defineService<{}, SaveService>(() => new _SaveService())

class _SaveService implements SaveService {
	private serializers = new Map<keyof DataTypes, SerDe<unknown, string, keyof DataTypes & string>>();

	public registerSerDe<Type extends keyof DataTypes & string>(serDe: SerDe<DataTypes[Type], string, Type>): this {
		this.serializers.set(serDe.type, serDe);
		return this;
	}

	public save<Type extends keyof DataTypes & string>(type: Type, data: DataTypes[Type]): this {
		const serialized = this.serializers.get(type)?.serialize(data);

		if (serialized === undefined) {
			throw new TypeError(`no serializer available for type ${ type }`);
		}

		localStorage.setItem(slotKeyBuilder(type)(0), serialized);
		return this;
	}

	public load<Type extends keyof DataTypes & string>(type: Type, fallback?: () => DataTypes[Type]): DataTypes[Type] | undefined {
		const serialized = localStorage.getItem(slotKeyBuilder(type)(0));
		if (serialized === null) {
			return fallback?.();
		}
		const deserializer = this.serializers.get(type);
		if (deserializer === undefined) {
			throw new TypeError(`no deserializer available for type ${ type }`);
		}

		return deserializer.deserialize(serialized) ?? fallback?.();
	}

	public clear(): this {
		this.serializers
			.values()
			.forEach(({type}) => localStorage.removeItem(slotKeyBuilder(type)(0)))
		return this;
	}
}