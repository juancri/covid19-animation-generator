import { TimeSeries } from '../util/Types';

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
