import * as Enumerable from 'linq';
import { DateTime } from 'luxon';

import { DataPoint, TimeSeries } from '../../util/Types';
import logger from '../../util/Logger';

const DEFAULT_NAME = 'sum';

interface SumParams {
	name: string | null;
	filter?: string[],
	filterRegex?: string
}

/**
 * Adds a new series at the end with the sum of all points for the same date.
 * An optional sum series name can be provided. The default series name is sum.
 */
export default class SumPreProcessor
{
	public static async run(series: TimeSeries[], params: unknown, debug: boolean): Promise<TimeSeries[]>
	{
		const sumParams = params as SumParams | null;
		if (series.length < 1)
			return series;
		const dates = Enumerable
			.from(series)
			.selectMany(serie => serie.data)
			.where(point => !!point)
			.select(point => point.date)
			.distinct(date => +date)
			.toArray();
		const filteredSeries = SumPreProcessor.getFiltered(series, sumParams, debug);
		const sumSeries: TimeSeries = {
			name: sumParams?.name ?? DEFAULT_NAME,
			data: dates
				.map(date => SumPreProcessor.getDataPoint(filteredSeries, date))
		};
		return [...series, sumSeries];
	}

	private static getFiltered(series: TimeSeries[], params: SumParams | null, debug: boolean): TimeSeries[]
	{
		if (params && params.filter)
		{
			if (debug)
				logger.info(`Using filter: ${params.filter}`);
			const found = series.filter(s => params.filter?.includes(s.name));
			if (debug)
				logger.info(`Found ${found.length} matches`);
			return found;
		}

		if (params && params.filterRegex)
		{
			if (debug)
				logger.info(`Using regex filter: ${params.filterRegex}`);
			const regex = new RegExp(params.filterRegex);
			const found = series.filter(s => regex.test(s.name));
			if (debug)
				logger.info(`Found ${found.length} matches`);
			return found;
		}

		if (debug)
			logger.debug('No filter');
		return series;
	}

	private static getDataPoint(series: TimeSeries[], date: DateTime): DataPoint
	{
		const value = Enumerable
			.from(series)
			.select(serie => serie.data.find(d => +d.date === +date))
			.select(point => point?.value || 0)
			.sum();
		return { date, value };
	}
}
