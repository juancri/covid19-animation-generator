import { Scale, PlotPoint } from '../util/Types';

export default class ScaledPointsGenerator {

	private horizontalScale: number;
	private verticalScale: number;
	private scale: Scale;

	public constructor(scale: Scale)
	{
		this.scale = scale;
		this.horizontalScale = scale.horizontal.max - scale.horizontal.min;
		this.verticalScale = scale.vertical.max - scale.vertical.min;
	}

	public generate(point: PlotPoint): PlotPoint
	{
		return {
			date: point.date,
			x: (point.x - this.scale.horizontal.min) / this.horizontalScale,
			y: (point.y - this.scale.vertical.min) / this.verticalScale
		};
	}
}
