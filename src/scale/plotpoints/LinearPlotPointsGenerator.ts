
import * as Enumerable from 'linq';

import { DataPoint, PlotPoint, TimeGap } from '../../util/Types';
import { DateTime } from 'luxon';

const JAN_1 = DateTime.local().startOf('year');

export default class LinearPlotPointsGenerator
{
	public static generate(points: DataPoint[]): PlotPoint[]
	{
		return points.map(point =>
		{
			const x = point.date.diff(JAN_1).as('days');
			const y = point.value;
			return { x, y, date: point.date };
		});
	}

	public static generateAvg7(points: DataPoint[], gaps: TimeGap[]): PlotPoint[]
	{
		return points
			.map((point, index) => ({ point, index }))
			.filter(item => !gaps.find(g =>
				+item.point.date > +g.from &&
				+item.point.date < +g.to))
			.map(item =>
			{
				const x = item.point.date.diff(JAN_1).as('days');
				const previousIndex = Math.max(
					LinearPlotPointsGenerator.getFirstIndex(points, gaps, item.index),
					item.index - 7);
				const previousPoint = points[previousIndex];
				const diff = item.point.value - previousPoint.value;
				const indexDiff = item.index - previousIndex;
				const y = previousIndex === item.index ?
					+Infinity :
					diff / indexDiff;
				return { x, y, date: item.point.date };
			})
			.filter(p => p.y < +Infinity);
	}

	public static generateAvg7Change(points: DataPoint[], gaps: TimeGap[]): PlotPoint[]
	{
		return points
			.map((point, index) => ({ point, index }))
			.filter(item => !gaps.find(g =>
				+item.point.date > +g.from &&
				+item.point.date < +g.to))
			.map(item =>
			{
				const x = item.point.date.diff(JAN_1).as('days');
				const minIndex = LinearPlotPointsGenerator.getFirstIndex(points, gaps, item.index);
				const desiredIndex = item.index - 6;
				const firstIndex = Math.max(minIndex, desiredIndex);
				const valuesToAvg = points
					.slice(firstIndex, item.index)
					.map(p => p.value);
				const total = valuesToAvg.reduce((a, b) => a + b, 0);
				const y = total / valuesToAvg.length;
				return { x, y, date: item.point.date };
			})
			.filter(p => p.y < +Infinity);
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
