
type CsvValue = string | number;
type CsvObject = { [key: string]: CsvValue };

interface MapInfo
{
	from: CsvValue;
	to: CsvValue;
}

export default class MapValuesCsvDataProcessor
{
	public static run(data: unknown[], params: unknown): unknown[]
	{
		const maps = params as MapInfo[];
		const csvData = data as CsvObject[];
		return csvData.map(row => MapValuesCsvDataProcessor.mapRow(row, maps));
	}

	private static mapRow(row: CsvObject, maps: MapInfo[]): CsvObject
	{
		const copy = { ...row };
		const keys = Object.keys(copy);
		for (const key of keys)
			copy[key] = MapValuesCsvDataProcessor.mapValue(copy[key], maps);
		return copy;
	}

	private static mapValue(value: CsvValue, maps: MapInfo[]): CsvValue
	{
		for (const map of maps)
			if (map.from === value)
				return map.to;
		return value;
	}
}
