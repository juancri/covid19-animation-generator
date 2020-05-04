import { Scale, PlotSeries } from '../util/Types';

export default class ScaledPointsGenerator {

	public static generate(series: PlotSeries[], scale: Scale)
	{
		const horizontalScale = scale.horizontal.max - scale.horizontal.min;
		const verticalScale = scale.vertical.max - scale.vertical.min;
		return series.map(serie => ({
			code: serie.code,
			color: serie.color,
			points: serie.points.map(point => ({
				date: point.date,
				x: (point.x - scale.horizontal.min) / horizontalScale,
				y: (point.y - scale.vertical.min) / verticalScale
			}))
		}));
	}
}
