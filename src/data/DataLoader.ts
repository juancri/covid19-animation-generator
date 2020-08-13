
// Dependencies
import * as Enumerable from 'linq';

// Local
import { DataSource, TimeSeries, DateFormat } from '../util/Types';
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

export default class DataLoader
{
	public static async load(
		dataSource: DataSource,
		inputDateFormatName?: string): Promise<TimeSeries[]>
	{
		const dateFormat = inputDateFormatName ?
			INPUT_DATE_FORMATS[inputDateFormatName] :
			DEFAULT_DATE_FORMAT;
		if (!dateFormat)
			throw new Error(`Date format not found: ${inputDateFormatName}`);
		const regexp = dateFormat.getRegularExpression();
		let csvData = await Downloader.download(dataSource.url);
		if (dataSource.csvDataProcessor)
			csvData = CsvDataProcessorLoader.load(dataSource.csvDataProcessor, csvData);
		const data = csvData.map(item => ({
			name: item[dataSource.nameColumn],
			data: Object
				.keys(item)
				.map(k => regexp.exec(k))
				.filter(match => match)
				.map(match => ({
					date: dateFormat.parse(match![0]),
					value: parseInt(item[match![0]], 0)
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
}
