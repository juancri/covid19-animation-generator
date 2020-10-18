import { TimeSeries } from '../../util/Types';

/**
 * Modifies each series in order to get the daily difference from absolute values.
 * Examples for series point values (input -> output)
 * [10, 12, 17] -> [10, 2, 5]
 * [20, 25, 26] -> [20, 5, 1]
 */
export default class DailyChangePreProcessor
{
	public static async run(series: TimeSeries[]): Promise<TimeSeries[]>
	{
		series.forEach(serie =>
		{
			const points = serie.data;
			if (points.length < 2)
				return;

			for (let i = points.length - 1; i >= 1; i--)
			{
				const current = points[i];
				const previous = points[i - 1];
				current.value = current.value - previous.value;
			}
		});
		return series;
	}
}
