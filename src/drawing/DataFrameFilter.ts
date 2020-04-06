import { PlotSeries, FrameInfo } from '../util/Types';

export default class DataFrameFilter
{
	private series: PlotSeries[];

	public constructor(series: PlotSeries[])
	{
		this.series = series;
	}

	public apply(frame: FrameInfo): PlotSeries[]
	{
		return this.series.map(serie => ({
			code: serie.code,
			color: serie.color,
			points: serie.points
				.filter(point => point.date <= frame.date)
				.map((point, index) =>
				{
					if (point.date < frame.date || frame.ratio === 1)
						return point;

					const previous = serie.points[index - 1];
					const diffX = point.x - previous.x;
					const diffY = point.y - previous.y;
					return {
						date: point.date,
						x: previous.x + diffX * frame.ratio,
						y: previous.y + diffY * frame.ratio
					};
				})
		}));
	}
}
