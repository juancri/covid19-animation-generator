import * as Enumerable from 'linq';
import { DataPoint, TimeSeries } from '../util/Types';
import { DateTime } from 'luxon';

const DEFAULT_NAME = 'sum';

export default class SumPreProcessor
{
	public static async run(series: TimeSeries[], params: any): Promise<TimeSeries[]>
	{
		if (series.length < 2)
			return series;
		const dates = Enumerable
			.from(series)
			.selectMany(serie => serie.data)
			.where(point => !!point)
			.select(point => point.date.toSeconds())
			.distinct()
			.select(secs => DateTime.fromSeconds(secs))
			.toArray();
		const sumSeries: TimeSeries = {
			name: params?.name || DEFAULT_NAME,
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
