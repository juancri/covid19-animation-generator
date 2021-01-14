
import * as Enumerable from 'linq';
import logger from './Logger';

type CsvData = { [key: string]: unknown }[];

const MAX_SAMPLE_PROPERTIES = 10;

export default class CsvDebug
{
	public static print(title: string, csvData: CsvData): void
	{
		logger.info(title);
		console.table(CsvDebug.sampleProperties(csvData));
	}

	private static sampleProperties(data: CsvData): unknown[]
	{
		const first = data[0];
		const properties = Object.keys(first);
		const firstProperties = Enumerable
			.from(properties)
			.take(MAX_SAMPLE_PROPERTIES)
			.toArray();
		return data.map(item => Enumerable
			.from(firstProperties)
			.toObject(
				key => key,
				key => item[key]));
	}
}
