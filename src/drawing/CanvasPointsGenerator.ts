import { PlotArea, PlotPoint } from '../util/Types';
import { DateTime } from 'luxon';

const SOME_DATE = DateTime.utc();
const POINT_ZERO = { date: SOME_DATE, x: 0, y: 0 };

export default class CanvasPointsGenerator
{
	private area: PlotArea;
	private honrizontalSize: number;
	private verticalSize: number;

	public constructor(plotArea: PlotArea)
	{
		this.area = plotArea;
		this.honrizontalSize = plotArea.right - plotArea.left;
		this.verticalSize = plotArea.bottom - plotArea.top;
	}

	public generate(point: PlotPoint): PlotPoint
	{
		return {
			date: point.date,
			x: this.area.left + this.honrizontalSize * point.x,
			y: this.area.bottom - this.verticalSize * point.y
		};
	}
}
