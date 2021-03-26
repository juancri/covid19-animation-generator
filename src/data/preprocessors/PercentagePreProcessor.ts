
import * as Enumerable from 'linq';
import { DataPoint, TimeSeries } from '../../util/Types';

const ZERO_ENUMERABLE = Enumerable.from([0]);

export default class PercentagePreProcessor
{
	public static async run(series: TimeSeries[]): Promise<TimeSeries[]>
	{
		return series.map(s => PercentagePreProcessor.convertSeries(series, s));
	}

	private static convertSeries(allSeries: TimeSeries[], series: TimeSeries): TimeSeries
	{
		return {
			...series,
			data: series.data.map(p => PercentagePreProcessor.convertPoint(
				allSeries, p))
		};
	}

	private static convertPoint(allSeries: TimeSeries[], point: DataPoint): DataPoint
	{
		const total = Enumerable
			.from(allSeries)
			.selectMany(s => s.data.filter(p => +p.date === +point.date))
			.select(p => p.value)
			.concat(ZERO_ENUMERABLE)
			.sum();
		const value = (point.value / total) * 100;

		return {
			...point,
			value: value
		};
	}
}
