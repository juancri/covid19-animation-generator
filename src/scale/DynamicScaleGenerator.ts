
import * as Enumerable from 'linq';
import { Scale, PlotSeries } from '../util/Types';

export default class DynamicScaleGenerator
{
	public static generate(series: PlotSeries[]): Scale {
		const lastPoints = Enumerable.from(
			Enumerable
				.from(series)
				.select(serie => serie.points[serie.points.length - 1])
				.toArray());
		return {
			horizontal: {
				min: lastPoints.min(p => p.x) - 0.5,
				max: lastPoints.max(p => p.x) + 0.5
			},
			vertical: {
				min: lastPoints.min(p => p.y) - 0.5,
				max: lastPoints.max(p => p.y) + 0.5
			}
		};
	}
}
