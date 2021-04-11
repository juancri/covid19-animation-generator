
import * as Enumerable from 'linq';

type CsvObject = { [key: string]: string | number };

interface Params
{
	groupColumn: string;
	dateColumn: string;
	valueColumn: string;
}

export default class ExpandDatesCsvDataProcessor
{
	public static run(data: unknown[], uParams: unknown): unknown[]
	{
		// Check parameters
		const params = uParams as Params;

		return Enumerable
			.from(data as CsvObject[])
			.groupBy(o => o[params.groupColumn])
			.select(g => {
				const base = { [params.groupColumn]: g.key() };
				const datesAndValues = g
					.toObject(o => o[params.dateColumn], o => o[params.valueColumn]);
				return { ...base, ...datesAndValues };

			})
			.toArray();
	}
}
