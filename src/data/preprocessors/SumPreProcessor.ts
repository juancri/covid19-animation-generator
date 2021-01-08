import * as Enumerable from 'linq';
import { DataPoint, TimeSeries } from '../../util/Types';
import { DateTime } from 'luxon';

const DEFAULT_NAME = 'sum';

interface SumParams {
	name: string | null;
}

/**
 * Adds a new series at the end with the sum of all points for the same date.
 * An optional sum series name can be provided. The default series name is sum.
 */
export default class SumPreProcessor
{
	public static async run(series: TimeSeries[], params: unknown): Promise<TimeSeries[]>
	{
		const subParams = params as SumParams;
		if (series.length < 1)
			return series;
		const dates = Enumerable
			.from(series)
			.selectMany(serie => serie.data)
			.where(point => !!point)
			.select(point => point.date)
			.distinct(date => +date)
			.toArray();
		const sumSeries: TimeSeries = {
			name: subParams?.name ?? DEFAULT_NAME,
			data: dates
				.map(date => SumPreProcessor.getDataPoint(series, date))
		};
		return [...series, sumSeries];
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
