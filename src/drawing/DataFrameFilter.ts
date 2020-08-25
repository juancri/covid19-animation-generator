import { PlotSeries, FrameFilterInfo } from '../util/Types';

export default class DataFrameFilter
{
	public static generate(series: PlotSeries[], frame: FrameFilterInfo): PlotSeries[]
	{
		return series.map(serie => ({
			...serie,
			points: serie.points
				.filter(point => point.date <= frame.date)
				.map((point, index) =>
				{
					if (index === 0
						|| point.date < frame.date
						|| frame.dateRatio === 1)
						return point;

					const previous = serie.points[index - 1];
					const diffX = point.x - previous.x;
					const diffY = point.y - previous.y;
					return {
						date: point.date,
						x: previous.x + diffX * frame.dateRatio,
						y: previous.y + diffY * frame.dateRatio,
						parent: point
					};
				})
		}));
	}
}
