import { ScaleBoundaries, PlotSeries } from '../util/Types';

export default class ScaledPointsGenerator {

	public static generate(series: PlotSeries[], scale: ScaleBoundaries): PlotSeries[]
	{

		return series.map(serie => ({
			code: serie.code,
			color: serie.color,
			gaps: serie.gaps,
			milestones: serie.milestones,
			points: serie.points.map(point => ({
				date: point.date,
				x: ScaledPointsGenerator.scaleValue(point.x, true, scale),
				y: ScaledPointsGenerator.scaleValue(point.y, false, scale),
				parent: point
			}))
		}));
	}

	public static scaleValue(value: number, horizontal: boolean, scale: ScaleBoundaries): number
	{
		const side = horizontal ? scale.horizontal : scale.vertical;
		const size = side.max - side.min;
		return (value - side.min) / size;
	}
}
