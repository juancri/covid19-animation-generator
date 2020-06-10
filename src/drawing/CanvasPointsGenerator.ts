import { Box, PlotSeries } from '../util/Types';

export default class CanvasPointsGenerator
{
	public static generate(series: PlotSeries[], plotArea: Box): PlotSeries[]
	{
		return series.map(serie => ({
			...serie,
			points: serie.points.map(point => ({
				date: point.date,
				x: CanvasPointsGenerator.scaleValue(point.x, true, plotArea),
				y: CanvasPointsGenerator.scaleValue(point.y, false, plotArea),
				parent: point
			}))
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
}
