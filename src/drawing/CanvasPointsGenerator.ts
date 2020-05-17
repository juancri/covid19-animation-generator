import { Box, PlotSeries } from '../util/Types';

export default class CanvasPointsGenerator
{
	public static generate(series: PlotSeries[], plotArea: Box)
	{
		const honrizontalSize = plotArea.right - plotArea.left;
		const verticalSize = plotArea.bottom - plotArea.top;
		return series.map(serie => ({
			code: serie.code,
			color: serie.color,
			points: serie.points.map(point => ({
				date: point.date,
				x: plotArea.left + honrizontalSize * point.x,
				y: plotArea.bottom - verticalSize * point.y,
				parent: point
			}))
		}));
	}
}
