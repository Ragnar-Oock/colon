import { slotKeyBuilder } from "./save-format.helper";

export const currentVersion = [0, 1, 0] as const satisfies versionNumber;
export type versionNumber = [major: number, minor: number, patch: number];

const getSlotKey = slotKeyBuilder('version')

export function getSaveFormatVersion(slot = 0): versionNumber {
	let version = localStorage.getItem(getSlotKey(slot));
	if (version === null || version === '') {
		return currentVersion;
	}
	return version
		.split('.')
		.map(segment => parseInt(segment, 10)) as versionNumber;
}

export function setSaveFormatVersion(version: versionNumber, slot = 0): void {
	localStorage.setItem(
		getSlotKey(slot),
		version.map(segment => segment.toString(10)).join('.')
	);
}

export function isCompatible(version: versionNumber): boolean {
	return (
		version[0] === currentVersion[0]
		&& version[1] === currentVersion[1]
		&& version[2] === currentVersion[2]
	)
}