import { defineService } from "@xoram/core";

type SerDe<Data, Serialised extends string = string, Type extends string = string> = {
	type: Type;
	serialize(data: Data): Serialised;
	deserialize(input: Serialised): Data;
}
const VERSION = 'save.version' as const;
export type VersionNumber = readonly [
	major: number,
	minor: number,
	patch: number,
]
export interface DataTypes {
	// data type will be added to this interface by augmentation
	// oxlint-disable-next-line typescript/consistent-indexed-object-style
	[type: string]: unknown;

	[VERSION]: VersionNumber;
}

const currentVersion = [0, 1, 0] as const;

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

	constructor() {
		this.registerSerDe({
			type: VERSION,
			serialize([major, minor, patch]) {
				return `${ major.toFixed(0) }.${ minor.toFixed(0) }.${ patch.toFixed(0) }`;
			},
			deserialize(data) {
				const [major = 0, minor = 0, patch = 0] = data
					.split('.')
					.map(segment => Number.parseInt(segment, 10));
				return [
					major,
					minor,
					patch
				] as const;
			}
		});

		const version = this.load(VERSION);

		if (version === undefined) {
			this.save(VERSION, currentVersion);
			return;
		}

		if (!isCompatible(version)) {
			// would need to handle format upgrade here somehow... problem for latter
			throw new Error(`Save Version (${ version?.toString() }) is not compatible with current version (${ currentVersion.toString() })`);
		}
	}

	public registerSerDe<Type extends keyof DataTypes & string>(serDe: SerDe<DataTypes[Type], string, Type>): this {
		this.serializers.set(serDe.type, serDe);
		return this;
	}

	public save<Type extends keyof DataTypes & string>(type: Type, data: DataTypes[Type]): this {
		const serialized = this.serializers.get(type)?.serialize(data);

		if (serialized === undefined) {
			throw new TypeError(`no serializer available for type ${ type }`);
		}

		localStorage.setItem(type, serialized);
		return this;
	}

	public load<Type extends keyof DataTypes & string>(type: Type, fallback?: () => DataTypes[Type]): DataTypes[Type] | undefined {
		const serialized = localStorage.getItem(type);
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
			.forEach(({type}) => localStorage.removeItem(type))
		return this;
	}
}

export function isCompatible([major, minor, patch]: VersionNumber): boolean {
	return (
		major === currentVersion[0]
		&& minor === currentVersion[1]
		&& patch === currentVersion[2]
	)
}