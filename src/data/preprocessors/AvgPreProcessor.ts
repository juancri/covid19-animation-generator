
import * as Enumerable from 'linq';
import { DataPoint, TimeSeries } from '../../util/Types';

export default class AvgPreProcessor
{
	public static async run(series: TimeSeries[], unknownParams: unknown): Promise<TimeSeries[]>
	{
		const length = unknownParams as number;
		return series.map(s => AvgPreProcessor.getSeries(s, length));
	}

	private static getSeries(series: TimeSeries, length: number): TimeSeries
	{
		return {
			...series,
			data: AvgPreProcessor.getPoints(series.data, length)
		};
	}

	private static getPoints(points: DataPoint[], length: number): DataPoint[]
	{
		return points.map((point, index) =>
			AvgPreProcessor.getPoint(points, length, point, index));
	}

	private static getPoint(points: DataPoint[], length: number, point: DataPoint, index: number): DataPoint
	{
		const firstIndex = Math.max(0, index - (length - 1));
		const lastIndex = index;
		const range = points.slice(firstIndex, lastIndex + 1);
		const average = Enumerable
			.from(range)
			.select(p => p.value)
			.average();
		return { ...point, value: average };
	}
}
