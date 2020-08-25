
import { ScaleBoundaries, PlotSeries, PlotPoint, PlotBand } from '../util/Types';

interface ScaleSize { horizontal: number; vertical: number };

export default class LineScaledPointsGenerator {

	public static generate(series: PlotSeries[], scale: ScaleBoundaries): PlotSeries[]
	{
		const size: ScaleSize = {
			horizontal: scale.horizontal.max - scale.horizontal.min,
			vertical: scale.vertical.max - scale.vertical.min
		};
		return series.map(serie => ({
			...serie,
			band: LineScaledPointsGenerator.scaleBand(serie.band, scale, size),
			points: LineScaledPointsGenerator.scalePoints(serie.points, scale, size)
		}));
	}

	public static scaleValue(value: number, horizontal: boolean, scale: ScaleBoundaries): number
	{
		const side = horizontal ? scale.horizontal : scale.vertical;
		const size = side.max - side.min;
		return (value - side.min) / size;
	}

	private static scalePoints(points: PlotPoint[], scale: ScaleBoundaries, size: ScaleSize)
	{
		return points.map(point => ({
			date: point.date,
			x: (point.x - scale.horizontal.min) / size.horizontal,
			y: (point.y - scale.vertical.min) / size.vertical,
			parent: point
		}));
	}

	private static scaleBand(band: PlotBand | null, scale: ScaleBoundaries, size: ScaleSize): PlotBand | null
	{
		if (!band)
			return null;

		return {
			color: band.color,
			lower: LineScaledPointsGenerator.scalePoints(band.lower, scale, size),
			upper: LineScaledPointsGenerator.scalePoints(band.upper, scale, size)
		};
	}
}
