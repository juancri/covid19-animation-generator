
const MAGNITUDES = new Map<number, string>([
	[1_000_000, 'M'],
	[1_000, 'K']
]);

export default class ScaleLabelGenerator
{
	public static generate(value: number)
	{
		for (const magnitudeValue of MAGNITUDES.keys())
			if (value >= magnitudeValue)
				return `${Math.floor(value / magnitudeValue)}${MAGNITUDES.get(magnitudeValue)}`;
		return value.toString();
	}
}
