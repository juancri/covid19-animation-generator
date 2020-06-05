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
}
