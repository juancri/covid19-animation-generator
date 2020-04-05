import { TimeSeries, DataPoint, PlotPoint } from '@/util/Types';

/**
 * Applies formulas and the plot scale to the data series
 */
export default class Log10PlotPointsGenerator
{
	public static generate(points: DataPoint[]): PlotPoint[]
	{
		return points.map((point, index) =>
		{
			const previous = points[Math.max(0, index - 7)];
			const x = Math.log10(point.value);
			const y = Math.log10(point.value - previous.value);
			return { x, y, date: point.date };
		});
	}
}
