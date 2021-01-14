import * as Enumerable from 'linq';
import { DataPoint, TimeSeries } from '../../util/Types';
import { DateTime } from 'luxon';

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
	public static async run(series: TimeSeries[], params: unknown): Promise<TimeSeries[]>
	{
		const sumParams = params as SumParams;
		if (series.length < 1)
			return series;
		const dates = Enumerable
			.from(series)
			.selectMany(serie => serie.data)
			.where(point => !!point)
			.select(point => point.date)
			.distinct(date => +date)
			.toArray();
		const filteredSeries = SumPreProcessor.getFiltered(series, sumParams);
		const sumSeries: TimeSeries = {
			name: sumParams?.name ?? DEFAULT_NAME,
			data: dates
				.map(date => SumPreProcessor.getDataPoint(filteredSeries, date))
		};
		return [...series, sumSeries];
	}

	private static getFiltered(series: TimeSeries[], params: SumParams): TimeSeries[]
	{
		if (params.filter)
			return series.filter(s => params.filter?.includes(s.name));

		if (params.filterRegex)
		{
			const regex = new RegExp(params.filterRegex);
			return series.filter(s => regex.test(s.name));
		}

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
