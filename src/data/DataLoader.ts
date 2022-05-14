
// Dependencies
import * as Enumerable from 'linq';
import { DateTime } from 'luxon';

// Local
import { DataSource, TimeSeries, Options, PreProcessorConfig, DateParser } from '../util/Types';
import Downloader from '../util/Downloader';
import PreProcessorLoader from './preprocessors/PreProcessorLoader';
import CsvDataProcessorLoader from './csvdataprocessors/CsvDataProcessorLoader';
import DateFormatParser from './dateparsers/DateFormatParser';
import CsvDebug from '../util/CsvDebug';
import EpidemiologicalWeekParser from './dateparsers/EpidemiologicalWeekParser';

const MONTH_DAY_YEAR_DATE_FORMAT_PARSER = new DateFormatParser('M/d/yy');
const ISO_DATE_FORMAT_PARSER = new DateFormatParser('yyyy-MM-dd');
const DEFAULT_DATE_PARSER = MONTH_DAY_YEAR_DATE_FORMAT_PARSER;
const DATE_FORMATS: { [key: string]: DateParser } =
{
	ISO: ISO_DATE_FORMAT_PARSER,
	MonthDayYear: MONTH_DAY_YEAR_DATE_FORMAT_PARSER,
	EpidemiologicalWeek: new EpidemiologicalWeekParser(),
};


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

		const extra = JSON.stringify(dataSource);
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
						value: group2.sum(x => x.value),
						extra: extra
					}))
					.orderBy(x => x.date)
					.toArray(),
				forceGaps: dataSource.gaps
			}))
			.toArray();

		// Call all pre processors
		const preProcessors = this.loadPreProcessors(dataSource, options);
		const debug = options?.debug || false;
		let tempData = rawData;
		for (const preProcessor of preProcessors)
			tempData = await PreProcessorLoader.load(preProcessor, tempData, debug);

		// Done
		return tempData;
	}

	private static* loadPreProcessors(dataSource: DataSource, options: Options | undefined): Generator<string | PreProcessorConfig>
	{
		// Single pre-processor
		if (dataSource.preProcessor)
			yield dataSource.preProcessor;

		// Multiple pre-processors
		if (dataSource.preProcessors)
			for (const preProcessor of dataSource.preProcessors)
				yield preProcessor;

		// Extra pre-processors
		if (options && options.extraPreProcessors)
		{
			const extraPreProcessors = options.extraPreProcessors.split(';');
			for (const extraPreProcessor of extraPreProcessors)
				yield this.loadExtraPreProcessor(extraPreProcessor);
		}
	}

	private static loadExtraPreProcessor(extra: string): string | PreProcessorConfig
	{
		try
		{
			if (!extra.includes(':'))
				return extra;

			const index = extra.indexOf(':');
			const name = extra.substring(0, index);
			const config = extra.substring(index + 1);
			const preProcessor: PreProcessorConfig = {
				name,
				parameters: JSON.parse(config)
			};

			return preProcessor;
		}
		catch (e)
		{
			throw new Error(`Error loading extra pre-processor: ${extra}: ${e}`);
		}
	}

	private static getDateFormat(format?: string): DateParser
	{
		if (!format)
			return DEFAULT_DATE_PARSER;
		return DATE_FORMATS[format] ??
			new DateFormatParser(format);
	}
}
