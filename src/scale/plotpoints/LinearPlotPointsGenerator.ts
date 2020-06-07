import { DataPoint, PlotPoint } from '../../util/Types';
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

	public static generateAvg7(points: DataPoint[]): PlotPoint[]
	{
		return points.map((point, index) =>
		{
			const x = point.date.diff(JAN_1).as('days');
			const previousIndex = Math.max(0, index - 7);
			const previousPoint = points[previousIndex];
			const previousDiff = Math.max(1, index - previousIndex);
			const y = (point.value - previousPoint.value) / previousDiff;
			return { x, y, date: point.date };
		});
	}
}
