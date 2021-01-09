
import * as Enumerable from 'linq';
import { ScaleBoundaries, PlotSeries, PlotPoint } from '../util/Types';

export default class StackedAreaScaledPointsGenerator {

	public static generate(series: PlotSeries[], scale: ScaleBoundaries): PlotSeries[]
	{
		const horizontalSize = scale.horizontal.max - scale.horizontal.min;
		return series.map((serie, serieIndex) => ({
			...serie,
			points: serie.points.map(point => ({
				date: point.date,
				x: (point.x - scale.horizontal.min) / horizontalSize,
				y: StackedAreaScaledPointsGenerator.getStackedValue(series, scale, point, serieIndex),
				parent: point
			}))
		}));
	}

	private static getStackedValue(series: PlotSeries[], scale: ScaleBoundaries,
		point: PlotPoint, serieIndex: number)
	{
		const verticalSize = scale.vertical.max - scale.vertical.min;
		const sum = Enumerable
			.from(series)
			.skip(serieIndex)
			.select(serie => serie.points)
			.select(points => points.find(p => +p.date === +point.date))
			.select(p => p?.y ?? 0)
			.sum();
		return (sum - scale.vertical.min) / verticalSize;
	}
}
