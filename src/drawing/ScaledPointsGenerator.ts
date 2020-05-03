import { Scale, PlotPoint } from '../util/Types';
import ScaleGenerator from './ScaleGenerator';

export default class ScaledPointsGenerator {

	private scaleGenerator: ScaleGenerator;
	private scale: Scale;
	private horizontalScale: number;
	private verticalScale: number;

	public constructor(scaleGenerator: ScaleGenerator)
	{
		this.scaleGenerator = scaleGenerator;
		this.scale = this.scaleGenerator.getScale();
		this.horizontalScale = this.scale.horizontal.max - this.scale.horizontal.min;
		this.verticalScale = this.scale.vertical.max - this.scale.vertical.min;
	}

	public apply() {
		this.scale = this.scaleGenerator.getScale();
		this.horizontalScale = this.scale.horizontal.max - this.scale.horizontal.min;
		this.verticalScale = this.scale.vertical.max - this.scale.vertical.min;
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
