
import { ScaleBoundaries, PlotSeries } from '../util/Types';

export default class LineScaledPointsGenerator {

	public static generate(series: PlotSeries[], scale: ScaleBoundaries): PlotSeries[]
	{
		const horizontalSize = scale.horizontal.max - scale.horizontal.min;
		const verticalSize = scale.vertical.max - scale.vertical.min;
		return series.map(serie => ({
			...serie,
			points: serie.points.map(point => ({
				date: point.date,
				x: (point.x - scale.horizontal.min) / horizontalSize,
				y: (point.y - scale.vertical.min) / verticalSize,
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
