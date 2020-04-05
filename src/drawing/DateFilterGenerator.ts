import { DataPoint } from '../util/Types';

export default class DateFilterGenerator
{
	private days: number;

	public constructor(days: number)
	{
		this.days = days;
	}

	public generate(points: DataPoint[]): DataPoint[]
	{
		if (!points.length)
			return points;

		const lastDate = points[points.length - 1].date;
		const firstDate = this.days === 0 ?
			points[0].date :
			lastDate.plus({ days: (this.days * -1) + 1 });
		return points.filter(point =>
			point.date >= firstDate &&
			point.date <= lastDate);
	}
}
