import { PlotArea, PlotPoint } from '../util/Types';
import { DateTime } from 'luxon';

const INFINITY = [-Infinity, +Infinity];
const SOME_DATE = DateTime.utc();
const POINT_ZERO = { date: SOME_DATE, x: 0, y: 0 };
const HAS_INFINITY = (point: PlotPoint) =>
	[point.x, point.y].some(c => INFINITY.includes(c));

export default class CanvasPointsGenerator
{
	private area: PlotArea;
	private honrizontalSize: number;
	private verticalSize: number;

	public constructor(plotArea: PlotArea) {
		this.area = plotArea;
		this.honrizontalSize = plotArea.right - plotArea.left;
		this.verticalSize = plotArea.bottom - plotArea.top;
	}

	public generate(point: PlotPoint): PlotPoint {
		const fixedPoint = HAS_INFINITY(point) ?
			POINT_ZERO : point;

		return {
			date: point.date,
			x: this.area.left + this.honrizontalSize * fixedPoint.x,
			y: this.area.bottom - this.verticalSize * fixedPoint.y
		};
	}
}
