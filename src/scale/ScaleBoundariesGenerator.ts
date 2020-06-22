
import * as Enumerable from 'linq';
import { ScaleBoundaries, PlotSeries, AnimationContext, PlotPoint } from '../util/Types';

const MARGIN = 0.2;
const STACKED_AREA = 'stacked-area';

export default class ScaleBoundariesGenerator
{
	public static generate(context: AnimationContext, series: PlotSeries[]): ScaleBoundaries {
		const isDouble = !context.options.singleDynamicScale;
		const allPoints = Enumerable.from(Enumerable
			.from(series)
			.select(serie => serie.points)
			.where(points => points && points.length > 0)
			.selectMany(points => points)
			.toArray());
		const bothAxis = allPoints.selectMany(p => [p.x, p.y]);
		const horizontal = isDouble ? bothAxis : allPoints.select(p => p.x);
		const vertical = isDouble ? bothAxis : allPoints.select(p => p.y);

		const horizontalMin = Math.max(horizontal.min(), 1);
		const horizontalMax = Math.max(horizontal.max(), 1);
		const verticalMin = Math.max(vertical.min(), 1);
		const verticalLimit = context.options.type === STACKED_AREA ?
			vertical.sum() :
			vertical.max();
		const verticalMax = Math.max(verticalLimit, 1);
		return {
			horizontal: {
				min: context.options.horizontalMin ?? (horizontalMin - MARGIN),
				max: context.options.horizontalMax ?? (horizontalMax + MARGIN)
			},
			vertical: {
				min: context.options.verticalMin ?? (verticalMin - MARGIN),
				max: context.options.verticalMax ?? (verticalMax + MARGIN)
			}
		};
	}
}
