
const PREFIXES: { [key: string]: string } = {
	'24': 'Y',
	'21': 'Z',
	'18': 'E',
	'15': 'P',
	'12': 'T',
	'9': 'G',
	'6': 'M',
	'3': 'k',
	'0': '',
	'-3': 'm',
	'-6': 'µ',
	'-9': 'n',
	'-12': 'p',
	'-15': 'f',
	'-18': 'a',
	'-21': 'z',
	'-24': 'y'
};

export default class NumberSuffix
{
	public static format(num: number): string
	{
		if (num === 0) {
			return '0';
		}
		let sig = Math.abs(num); // significand
		let exponent = 0;
		while (sig >= 1000 && exponent < 24) {
		sig /= 1000;
		exponent += 3;
		}
		while (sig < 1 && exponent > -24) {
		sig *= 1000;
		exponent -= 3;
		}

		const signPrefix = num < 0 ? '-' : '';
		if (sig > 1000) { // exponent == 24
		// significand can be arbitrarily long
		return signPrefix + sig.toFixed(0) + PREFIXES[exponent];
		}
		return signPrefix + parseFloat(sig.toPrecision(3)) + PREFIXES[exponent];
	}
}
