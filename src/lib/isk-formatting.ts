export const formatIsk = (value: number, longVersion = false) => {
	return formatValue(Math.floor(value), longVersion) + ' ISK';
};

function toF(v: number, d: number): string {
	if (v % 1 == 0) {
		return `${v}`;
	} else {
		return v.toFixed(d);
	}
}

export function formatValue(value: number, longVersion = false) {
	if (longVersion) {
		return value.toLocaleString();
	}
	const v = Math.abs(value);
	if (v < 1000) {
		return toF(value, 2);
	}
	if (v < 1_000_000) {
		return toF(value / 1000, 2) + 'k';
	}
	if (v < 1_000_000_000) {
		return toF(value / 1_000_000, 2) + 'm';
	}
	return toF(value / 1_000_000_000, 2) + 'b';
};