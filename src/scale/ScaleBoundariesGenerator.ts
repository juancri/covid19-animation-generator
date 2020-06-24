
import * as Enumerable from 'linq';
import { ScaleBoundaries, PlotSeries, AnimationContext, } from '../util/Types';

const STACKED_AREA = 'stacked-area';

export default class ScaleBoundariesGenerator
{
	public static generate(context: AnimationContext, series: PlotSeries[]): ScaleBoundaries {
		const horizontalMargin = context.options.horizontalMargin;
		const verticalMargin = context.options.verticalMargin;
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
		const allDates = allPoints
			.select(p => p.date)
			.distinct(date => +date);
		const verticalByDate = allDates
			.select(date => allPoints.where(p => +p.date === +date).sum(p => p.y));
		const verticalLimit = context.options.type === STACKED_AREA ?
			verticalByDate.max() :
			vertical.max();
		const verticalMax = Math.max(verticalLimit, 1);
		return {
			horizontal: {
				min: context.options.horizontalMin ?? (horizontalMin - horizontalMargin),
				max: context.options.horizontalMax ?? (horizontalMax + horizontalMargin)
			},
			vertical: {
				min: context.options.verticalMin ?? (verticalMin - verticalMargin),
				max: context.options.verticalMax ?? (verticalMax + verticalMargin)
			}
		};
	}
}
