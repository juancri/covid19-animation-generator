

import { DataPoint, TimeSeries } from '../../util/Types';

export default class MultiplyByPreProcessor
{
	public static async run(series: TimeSeries[], uParams: unknown): Promise<TimeSeries[]>
	{
		const by = uParams as number;
		return series.map(s => MultiplyByPreProcessor.multiplySeries(s, by));
	}

	private static multiplySeries(series: TimeSeries, by: number): TimeSeries
	{
		return {
			...series,
			data: series.data.map(p => MultiplyByPreProcessor.multiplyPoint(p, by))
		};
	}

	private static multiplyPoint(point: DataPoint, by: number): DataPoint
	{
		return {
			...point,
			value: point.value * by
		};
	}
}
