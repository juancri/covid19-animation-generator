import { PlotSeries, FrameInfo } from '../util/Types';
import { DateTime } from 'luxon';

export default class TimeAnimation
{
	private series: PlotSeries[];
	private frames: number;
	private days: number;
	private firstDate: DateTime;
	private lastDate: DateTime;

	public constructor(series: PlotSeries[], frames: number, days: number)
	{
		// Save
		this.series = series;
		this.frames = frames;
		this.days = days;

		// Calculate
		this.lastDate = this.getLastDate();
		this.firstDate = this.getFirstDate();
	}

	public *generate(): Generator<FrameInfo>
	{
		yield { date: this.firstDate, ratio: 1 };

		let current = this.firstDate.plus({ days: 1 });
		while (current <= this.lastDate)
		{
			for (let frame = 1; frame <= this.frames; frame++)
				yield { date: current, ratio: frame / this.frames };
			current = current.plus({ days: 1 });
		}
	}

	private getFirstDate()
	{
		const possibleDate = this.series[0].points[0].date;
		if (this.days === 0)
			return possibleDate;

		const requestedDate = this.lastDate.plus({ days: (-1 * this.days) + 1 });
		return DateTime.max(requestedDate, possibleDate);
	}

	private getLastDate()
	{
		const firstPoints = this.series[0].points;
		const lastIndex = firstPoints.length - 1;
		const lastDataPoint = firstPoints[lastIndex];
		return lastDataPoint.date;
	}
}
