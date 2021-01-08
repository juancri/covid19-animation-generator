
import * as Enumerable from 'linq';

import { DataPoint, PlotPoint, TimeGap } from '../../util/Types';
import { DateTime } from 'luxon';
import { Exception } from 'handlebars';

const START_DATE = DateTime.fromISO('2020-01-01', { zone: 'UTC' });

export default class LinearPlotPointsGenerator
{
	public static generate(points: DataPoint[]): PlotPoint[]
	{
		return points.map(point =>
		{
			const x = point.date.diff(START_DATE).as('days');
			const y = point.value;
			return { x, y, date: point.date };
		});
	}

	public static generateCenter(points: DataPoint[], gaps: TimeGap[], seriesIndex: number): PlotPoint[]
	{
		const factor = seriesIndex === 0 ? 1 : -1;
		return points.map(point =>
		{
			const x = point.date.diff(START_DATE).as('days');
			const y = point.value * factor;
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
				const x = item.point.date.diff(START_DATE).as('days');
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
				+item.point.date <= +g.to))
			.map(item =>
			{
				const x = item.point.date.diff(START_DATE).as('days');
				const minIndex = LinearPlotPointsGenerator.getFirstIndex(points, gaps, item.index, false);
				const desiredIndex = item.index - 6;
				const firstIndex = Math.max(minIndex, desiredIndex);
				const valuesToAvg = points
					.slice(firstIndex, item.index)
					.map(p => p.value);
				const total = valuesToAvg.reduce((a, b) => a + b, 0);
				const y = firstIndex === item.index ?
					item.point.value :
					total / valuesToAvg.length;
				return { x, y, date: item.point.date };
			})
			.filter(p => p.y < +Infinity);
	}

	public static generateAvg7ChangeCenter(points: DataPoint[], gaps: TimeGap[], seriesIndex: number): PlotPoint[]
	{
		if (seriesIndex > 1)
			throw new Exception('Expected only two series for this scale');

		const isFirstSeries = seriesIndex === 0;
		const factor = isFirstSeries ? 1 : -1;

		return points
			.map((point, index) => ({ point, index }))
			.filter(item => !gaps.find(g =>
				+item.point.date > +g.from &&
				+item.point.date <= +g.to))
			.map(item =>
			{
				const x = item.point.date.diff(START_DATE).as('days');
				const minIndex = LinearPlotPointsGenerator.getFirstIndex(points, gaps, item.index, false);
				const desiredIndex = item.index - 6;
				const firstIndex = Math.max(minIndex, desiredIndex);
				const valuesToAvg = points
					.slice(firstIndex, item.index)
					.map(p => p.value);
				const total = valuesToAvg.reduce((a, b) => a + b, 0);
				const rawY = firstIndex === item.index ?
					item.point.value :
					total / valuesToAvg.length;
				const parent = { x, y: rawY, date: item.point.date };
				const y = rawY * factor;
				return { ...parent, parent, y };
			})
			.filter(p => p.y < +Infinity);
	}

	private static getFirstIndex(points: DataPoint[], gaps: TimeGap[],
		index: number, includeLast = true): number
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
			.where(x => (includeLast && +x.p.date >= +gap.to)
				|| (!includeLast && +x.p.date > +gap.to))
			.select(x => x.i)
			.first();
	}
}
