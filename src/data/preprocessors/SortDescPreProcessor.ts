
import * as Enumerable from 'linq';

import { TimeSeries } from '../../util/Types';

export default class SortDescPreProcessor
{
	public static async run(series: TimeSeries[], params: any): Promise<TimeSeries[]>
	{
		return Enumerable
			.from(series)
			.orderByDescending(serie => SortDescPreProcessor.selectIndex(
				serie, params && params.lastWeek))
			.toArray();
	}

	private static selectIndex(serie: TimeSeries, lastWeek: boolean)
	{
		if (!lastWeek)
			return serie.data[serie.data.length - 1].value;

		const points = serie.data;
		const lastIndex = points.length - 1;
		const previousIndex = Math.max(0, lastIndex - 7);
		const lastPoint = points[lastIndex];
		const previousPoint = points[previousIndex];
		return lastPoint.value - previousPoint.value;
	}
}
