
import * as Enumerable from 'linq';
import { Scale, PlotSeries } from '../util/Types';

const MARGIN = 0.2;

export default class DynamicScaleGenerator
{
	private horizontalMin: number | null;
	private horizontalMax: number | null;
	private verticalMin: number | null;
	private verticalMax: number | null;

	public constructor(
		horizontalMin: number | null, horizontalMax: number | null,
		verticalMin: number | null, verticalMax: number | null)
	{
		this.horizontalMin = horizontalMin;
		this.horizontalMax = horizontalMax;
		this.verticalMin = verticalMin;
		this.verticalMax = verticalMax;
	}

	public generate(series: PlotSeries[]): Scale {
		const lastPoints = Enumerable.from(
			Enumerable
				.from(series)
				.select(serie => serie.points)
				.where(points => points && points.length > 0)
				.select(points => points[points.length - 1])
				.selectMany(point => [point.x, point.y])
				.where(x => !!x)
				.toArray());

		const min = Math.max(lastPoints.min(), 1);
		const max = Math.max(lastPoints.max(), 1);
		return {
			horizontal: {
				min: this.horizontalMin || (min - MARGIN),
				max: this.horizontalMax || (max + MARGIN)
			},
			vertical: {
				min: this.verticalMin || (min - MARGIN),
				max: this.verticalMax || (max + MARGIN)
			}
		};
	}
}
