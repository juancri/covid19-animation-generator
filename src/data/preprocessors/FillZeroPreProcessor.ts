
import * as Enumerable from 'linq';
import { DateTime } from 'luxon';
import { DataPoint, TimeSeries } from '../../util/Types';

interface FillZeroParameters
{
	from?: string;
	to?: string;
}

const DAYS_1 = { days: 1 };

export default class FillZeroPreProcessor
{
	public static async run(series: TimeSeries[], unknownParams: unknown): Promise<TimeSeries[]>
	{
		const params = unknownParams as FillZeroParameters;
		return series.map(s => FillZeroPreProcessor.fillZeroSeries(s, params));
	}

	private static fillZeroSeries(series: TimeSeries, params: FillZeroParameters): TimeSeries
	{
		if (series.data.length < 2)
			return series;
		const dates = Enumerable
			.from(series.data)
			.select(p => p.date);
		const firstDate = FillZeroPreProcessor.getDate(
			dates.orderBy(d => +d),
			params?.from);
		const lastDate = FillZeroPreProcessor.getDate(
			dates.orderByDescending(d => +d),
			params?.to);
		const points = Array.from(FillZeroPreProcessor.getPoints(series.data, firstDate, lastDate));
		return { ...series, data: points };
	}

	private static getDate(dates: Enumerable.IEnumerable<DateTime>, dateValue: string | undefined): DateTime
	{
		if (dateValue)
			return DateTime.fromISO(dateValue);
		return dates.first();
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
