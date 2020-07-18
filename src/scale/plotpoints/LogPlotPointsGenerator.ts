
import * as Enumerable from 'linq';

import { DataPoint, PlotPoint, TimeGap } from '../../util/Types';

export default class LogPlotPointsGenerator
{
	public static generate(points: DataPoint[], gaps: TimeGap[]): PlotPoint[]
	{
		return points
			.map((point, index) => ({ point, index }))
			.filter(item => !gaps.find(g =>
				+item.point.date > +g.from &&
				+item.point.date < +g.to))
			.map(item =>
			{
				const x = Math.log10(item.point.value);
				const firstIndex = LogPlotPointsGenerator.getFirstIndex(
					points, gaps, item.index);
				const previousIndex = Math.max(firstIndex, item.index - 7);
				const previousPoint = points[previousIndex];
				const diff = item.point.value - previousPoint.value;
				const indexDiff = item.index - previousIndex;
				const correctedDiff = diff / indexDiff * 7;
				const y = firstIndex > item.index ?
					+Infinity :
					Math.log10(correctedDiff);
				return { x, y, date: item.point.date };
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
			.where(g => +g.to <= +point.date)
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
