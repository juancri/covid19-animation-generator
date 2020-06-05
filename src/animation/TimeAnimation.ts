
import * as Enumerable from 'linq';
import { DateTime } from 'luxon';

import { Animation, PlotSeries, FrameFilterInfo, AnimationContext } from '../util/Types';
import ScaleBoundariesGenerator from '../scale/ScaleBoundariesGenerator';

export default class TimeAnimation implements Animation
{
	private context: AnimationContext;
	private firstDate: DateTime;
	private lastDate: DateTime;

	public constructor(context: AnimationContext)
	{
		this.context = context;
		this.lastDate = this.getLastDate();
		this.firstDate = this.getFirstDate();
	}

	public countFrames(): number
	{
		const maxDiff = Math.floor(this.lastDate.diff(this.firstDate).as('days'));
		const realDays = this.context.options.days === 0 ?
			maxDiff :
			Math.min(maxDiff, this.context.options.days - 1);

		return 1 + this.context.options.frames * realDays;
	}

	public *getFrames(): Generator<FrameFilterInfo>
	{
		// First day with ratio 1
		yield { date: this.firstDate, ratio: 1 };

		// Rest of the days
		let current = this.firstDate.plus({ days: 1 });
		while (current <= this.lastDate)
		{
			for (let frame = 1; frame <= this.context.options.frames; frame++)
				yield { date: current, ratio: frame / this.context.options.frames };
			current = current.plus({ days: 1 });
		}
	}

	public getScaleBoundaries(filteredSeries: PlotSeries[],
		frameFilterInfo: FrameFilterInfo,
		frameIndex: number,
		stepFrameIndex: number) {
		return ScaleBoundariesGenerator.generate(this.context, filteredSeries);
	}

	private getFirstDate()
	{
		const possibleDate = Enumerable
			.from(this.context.series)
			.select(serie => serie.points)
			.where(points => !!points && !!points.length)
			.select(points => points[0])
			.select(point => point.date)
			.orderBy(date => +date)
			.firstOrDefault();
		if (this.context.options.days === 0)
			return possibleDate;

		const requestedDate = this.lastDate.plus({
			days: (-1 * this.context.options.days) + 1
		});
		return DateTime.max(requestedDate, possibleDate);
	}

	private getLastDate()
	{
		const firstPoints = this.context.series[0].points;
		const lastIndex = firstPoints.length - 1;
		const lastDataPoint = firstPoints[lastIndex];
		return lastDataPoint.date;
	}
}
