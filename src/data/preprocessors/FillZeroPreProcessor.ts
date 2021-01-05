
import * as Enumerable from 'linq';
import { DateTime } from 'luxon';
import { DataPoint, TimeSeries } from '../../util/Types';

const DAYS_1 = { days: 1 };

export default class FillZeroPreProcessor
{
	public static async run(series: TimeSeries[]): Promise<TimeSeries[]>
	{
		return series.map(s => FillZeroPreProcessor.fillZeroSeries(s));
	}

	private static fillZeroSeries(series: TimeSeries): TimeSeries
	{
		if (series.data.length < 2)
			return series;
		const dates = Enumerable
			.from(series.data)
			.select(p => p.date);
		const firstDate = dates
			.orderBy(d => +d)
			.first();
		const lastDate = dates
			.orderByDescending(d => +d)
			.first();
		const points = Array.from(FillZeroPreProcessor.getPoints(series.data, firstDate, lastDate));
		return { ...series, data: points };
	}

	private static *getPoints(points: DataPoint[], first: DateTime, last: DateTime): Generator<DataPoint>
	{
		for (let current = first; +current <= +last; current = current.plus(DAYS_1))
		{
			const found = points.find(p => +p.date === +current);
			yield found || { date: current, value: 0 };
		}
	}
}
