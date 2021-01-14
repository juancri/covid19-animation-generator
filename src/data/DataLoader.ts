
// Dependencies
import * as Enumerable from 'linq';
import { DateTime } from 'luxon';

// Local
import { DataSource, TimeSeries, Options } from '../util/Types';
import Downloader from '../util/Downloader';
import PreProcessorLoader from './preprocessors/PreProcessorLoader';
import CsvDataProcessorLoader from './csvdataprocessors/CsvDataProcessorLoader';
import DateFormat from './DateFormat';
import CsvDebug from '../util/CsvDebug';

const DATE_FORMATS: { [key: string]: string } =
{
	ISO: 'yyyy-MM-dd',
	MonthDayYear: 'MM/dd/yyyy',
};
const DEFAULT_DATE_FORMAT = DATE_FORMATS.MonthDayYear;

export default class DataLoader
{
	public static async load(dataSource: DataSource, options?: Options): Promise<TimeSeries[]>
	{
		const dateFormat = DataLoader.getDateFormat(dataSource.inputDateFormat);
		let csvData = await Downloader.download(dataSource.url);
		if (options?.debug)
			CsvDebug.print("Original CSV", csvData);
		if (dataSource.csvDataProcessor)
		{
			csvData = CsvDataProcessorLoader.load(dataSource.csvDataProcessor, csvData);
			if (options?.debug)
				CsvDebug.print("Processed CSV", csvData);
		}
		const data = csvData.map(item => ({
			name: item[dataSource.nameColumn],
			data: Object
				.keys(item)
				.map(k => ({
					key: k,
					date: dateFormat.parse(k)
				}))
				.filter(x => x.date)
				.map(x => ({
					date: x.date as DateTime,
					value: parseFloat(item[x.key] || '0')
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
		const debug = options?.debug || false;
		if (dataSource.preProcessor)
			return await PreProcessorLoader.load(dataSource.preProcessor, rawData, debug);

		// Multiple pre processors
		if (dataSource.preProcessors)
		{
			let tempData = rawData;
			for (const preProcessor of dataSource.preProcessors)
				tempData = await PreProcessorLoader.load(preProcessor, tempData, debug);
			return tempData;
		}

		// No pre processors
		return rawData;
	}

	private static getDateFormat(format?: string): DateFormat
	{
		if (!format)
			return new DateFormat(DEFAULT_DATE_FORMAT);
		const found = DATE_FORMATS[format];
		if (found)
			return new DateFormat(found);
		return new DateFormat(format);
	}
}
