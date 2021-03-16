
import { DurationObject } from 'luxon';
import * as Enumerable from 'linq';

import { DataPoint, TimeSeries } from '../../util/Types';

interface DatePlusParameters
{
	series: string;
	plus: DurationObject;
	limit?: boolean
}

/**
 * Shifts the dates for a specific row
 */
export default class DatePlusPreProcessor
{
	public static async run(series: TimeSeries[], params: unknown): Promise<TimeSeries[]>
	{
		const plusParams = params as DatePlusParameters;
		return series.map(s => DatePlusPreProcessor.shiftSeries(s, plusParams));
	}

	private static shiftSeries(series: TimeSeries, params: DatePlusParameters): TimeSeries
	{
		if (series.name !== params.series)
			return series;

		const limit = params.limit ?
			Enumerable
				.from(series.data)
				.max(p => +p.date) :
			null;
		const data = series.data
			.map(p => DatePlusPreProcessor.shiftPoint(p, params.plus))
			.filter(p => limit === null || +p.date <= limit);

		return {
			...series,
			data
		};
	}

	private static shiftPoint(point: DataPoint, plus: DurationObject): DataPoint
	{
		return {
			...point,
			date: point.date.plus(plus)
		};
	}
}
