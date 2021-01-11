
// Dependencies
import * as Enumerable from 'linq';

// Local
import { DataSource, TimeSeries, DateFormat, Options } from '../util/Types';
import Downloader from '../util/Downloader';
import PreProcessorLoader from './preprocessors/PreProcessorLoader';
import CsvDataProcessorLoader from './csvdataprocessors/CsvDataProcessorLoader';
import MonthDayYearDateFormat from './dateformat/MonthDayYearDateFormat';
import IsoDateFormat from './dateformat/IsoDateFormat';

const INPUT_DATE_FORMATS: { [key: string]: DateFormat } =
{
	ISO: IsoDateFormat,
	MonthDayYear: MonthDayYearDateFormat,
};

const DEFAULT_DATE_FORMAT = MonthDayYearDateFormat;
const MAX_SAMPLE_PROPERTIES = 10;

export default class DataLoader
{
	public static async load(dataSource: DataSource, options?: Options): Promise<TimeSeries[]>
	{
		const dateFormat = dataSource.inputDateFormat ?
			INPUT_DATE_FORMATS[dataSource.inputDateFormat] :
			DEFAULT_DATE_FORMAT;
		if (!dateFormat)
			throw new Error(`Date format not found: ${dataSource.inputDateFormat}`);
		const regexp = dateFormat.getRegularExpression();
		let csvData = await Downloader.download(dataSource.url);
		if (options?.debug)
			console.table(DataLoader.sampleProperties(csvData));
		if (dataSource.csvDataProcessor)
			csvData = CsvDataProcessorLoader.load(dataSource.csvDataProcessor, csvData);
		const data = csvData.map(item => ({
			name: item[dataSource.nameColumn],
			data: Object
				.keys(item)
				.map(k => regexp.exec(k))
				.filter(match => match)
				.map(match => ({
					date: dateFormat.parse(match?.[0] || ''),
					value: parseFloat(item[match?.[0] || 0] || '0')
				}))
		}));

		const rawData: TimeSeries[] = Enumerable
			.from(data)
			.groupBy(x => x.name)
			.select(group => ({
				name: group.key(),
				data: group
					.selectMany(x => x.data)
					.groupBy(x => (+x.date))
					.select(group2 => ({
						date: group2.first().date,
						value: group2.sum(x => x.value)
					}))
					.orderBy(x => x.date)
					.toArray(),
				forceGaps: dataSource.gaps,
				// Milestones should be loaded later
				milestones: null
			}))
			.toArray();

		// Single pre processor
		if (dataSource.preProcessor)
			return await PreProcessorLoader.load(dataSource.preProcessor, rawData);

		// Multiple pre processors
		if (dataSource.preProcessors)
		{
			let tempData = rawData;
			for (const preProcessor of dataSource.preProcessors)
				tempData = await PreProcessorLoader.load(preProcessor, tempData);
			return tempData;
		}

		// No pre processors
		return rawData;
	}

	private static sampleProperties(data: { [key: string]: unknown }[]): unknown[]
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
