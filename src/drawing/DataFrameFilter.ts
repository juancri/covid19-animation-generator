import { PlotSeries, FrameInfo } from '../util/Types';

export default class DataFrameFilter
{
	private series: PlotSeries[];
	private filtered: PlotSeries[];

	public constructor(series: PlotSeries[])
	{
		this.series = series;
		this.filtered = [];
	}

	public getFiltered()
	{
		return this.filtered;
	}

	public apply(frame: FrameInfo)
	{
		this.filtered = this.series.map(serie => ({
			code: serie.code,
			color: serie.color,
			points: serie.points
				.filter(point => point.date <= frame.date)
				.map((point, index) =>
				{
					if (index === 0 || point.date < frame.date || frame.ratio === 1)
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
