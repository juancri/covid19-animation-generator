
import * as Enumerable from 'linq';

import { Scale } from '../util/Types';
import DataFrameFilter from './DataFrameFilter';

export default class ScaleGenerator
{
	private filter: DataFrameFilter;
	private scale: Scale;

	public constructor (filter: DataFrameFilter)
	{
		this.filter = filter;
		this.scale = {
			horizontal: { min: 1, max: 6 },
			vertical: { min: 1, max: 6 },
		};
	}

	public getScale() {
		return this.scale;
	}

	public apply()
	{
		const lastPoints = Enumerable.from(
			Enumerable
				.from(this.filter.getFiltered())
				.select(series => series.points[series.points.length - 1])
				.toArray());
		this.scale = {
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
