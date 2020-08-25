import { Box, PlotSeries, PlotPoint, PlotBand } from '../util/Types';

export default class CanvasPointsGenerator
{
	public static generate(series: PlotSeries[], plotArea: Box): PlotSeries[]
	{
		return series.map(serie => ({
			...serie,
			band: CanvasPointsGenerator.scaleBand(serie.band, plotArea),
			points: CanvasPointsGenerator.scalePoints(serie.points, plotArea)
		}));
	}

	public static scaleValue(value: number, horizontal: boolean, plotArea: Box): number
	{
		const side = horizontal ?
			[plotArea.left, plotArea.right] :
			[plotArea.bottom, plotArea.top];
		const size = Math.abs(side[0] - side[1]);
		const base = side[0];
		const diff = size * value;
		return horizontal ?
			base + diff :
			base - diff;
	}

	private static scalePoints(points: PlotPoint[], plotArea: Box): PlotPoint[]
	{
		return points.map(point => ({
			date: point.date,
			x: CanvasPointsGenerator.scaleValue(point.x, true, plotArea),
			y: CanvasPointsGenerator.scaleValue(point.y, false, plotArea),
			parent: point
		}));
	}

	private static scaleBand(band: PlotBand | null, plotArea: Box): PlotBand | null
	{
		if (!band)
			return null;

		return {
			color: band.color,
			lower: CanvasPointsGenerator.scalePoints(band.lower, plotArea),
			upper: CanvasPointsGenerator.scalePoints(band.upper, plotArea)
		};
	}
}
