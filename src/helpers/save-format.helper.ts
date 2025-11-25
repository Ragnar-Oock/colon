export const propertySeparator = ',';
export const entitySeparator = ';';
export const integerRadix = 10;

export const slotKeyBuilder = <scopeName extends string>(scope: scopeName) =>
	(slot = 0): `${ scopeName }.${ string }` =>
		`${ scope }.${ slot.toString(10) }`;

