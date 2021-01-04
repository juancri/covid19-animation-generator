
import * as Enumerable from 'linq';
import { DataPoint, TimeSeries } from '../../util/Types';

export default class Avg7PreProcessor
{
	public static async run(series: TimeSeries[]): Promise<TimeSeries[]>
	{
		return series.map(serie => Avg7PreProcessor.getSeries(serie));
	}

	private static getSeries(series: TimeSeries): TimeSeries
	{
		return { ...series, data: Avg7PreProcessor.getPoints(series.data) };
	}

	private static getPoints(points: DataPoint[]): DataPoint[]
	{
		return points.map((point, index) =>
			Avg7PreProcessor.getPoint(points, point, index));
	}

	private static getPoint(points: DataPoint[], point: DataPoint, index: number): DataPoint
	{
		const firstIndex = Math.max(0, index - 6);
		const lastIndex = index;
		const range = points.slice(firstIndex, lastIndex + 1);
		const average = Enumerable
			.from(range)
			.select(p => p.value)
			.average();
		return { ...point, value: average };
	}
}
