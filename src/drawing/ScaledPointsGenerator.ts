import { ScaleBoundaries, PlotSeries } from '../util/Types';

export default class ScaledPointsGenerator {

	public static generate(series: PlotSeries[], scale: ScaleBoundaries): PlotSeries[]
	{
		const horizontalScale = scale.horizontal.max - scale.horizontal.min;
		const verticalScale = scale.vertical.max - scale.vertical.min;
		return series.map(serie => ({
			code: serie.code,
			color: serie.color,
			gaps: serie.gaps,
			milestones: serie.milestones,
			points: serie.points.map(point => ({
				date: point.date,
				x: (point.x - scale.horizontal.min) / horizontalScale,
				y: (point.y - scale.vertical.min) / verticalScale,
				parent: point
			}))
		}));
	}
}
