
import * as Enumerable from 'linq';

import { DataPoint, PlotPoint, TimeGap } from '../../util/Types';

export default class LogPlotPointsGenerator
{
	public static generate(points: DataPoint[], gaps: TimeGap[]): PlotPoint[]
	{
		return points
			.filter(point => !gaps.find(g =>
				+point.date > +g.from &&
				+point.date <= +g.to))
			.map((point, index) =>
			{
				const x = Math.log10(point.value);
				const firstIndex = LogPlotPointsGenerator.getFirstIndex(points, gaps, index);
				const previousIndex = Math.max(firstIndex, index - 7);
				const previousPoint = points[previousIndex];
				const y = firstIndex >= index ?
					+Infinity :
					Math.log10(point.value - previousPoint.value);
				return { x, y, date: point.date };
			})
			.filter(point =>
				point.x > -Infinity &&
				point.y > -Infinity &&
				point.x < Infinity &&
				point.y < Infinity);
	}

	private static getFirstIndex(points: DataPoint[], gaps: TimeGap[],
		index: number): number
	{
		const point = points[index];
		const gap = Enumerable
			.from(gaps)
			.where(g => +g.to < +point.date)
			.orderBy(g => +g.to)
			.lastOrDefault();
		if (!gap)
			return 0;

		return Enumerable
			.from(points)
			.select((p, i) => ({ p, i }))
			.where(x => +x.p.date >= +gap.to)
			.select(x => x.i)
			.first();
	}
}
