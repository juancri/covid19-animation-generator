import { FrameInfo, PlotSeries } from '../util/Types';
import { DateTime } from 'luxon';

export default class FixedFrameAnimation
{
	private series: PlotSeries[];
	private frames: number;
	private date: DateTime;

	public constructor(series: PlotSeries[], frames: number)
	{
		// Save
		this.series = series;
		this.frames = frames;

		// Calculate
		this.date = this.getLastDate();
	}

	public *generate(): Generator<FrameInfo>
	{
		for (let current = 1; current <= this.frames; current++)
			yield { date: this.date, ratio: 1 };
	}


	// Private methods

	private getLastDate()
	{
		const firstPoints = this.series[0].points;
		const lastIndex = firstPoints.length - 1;
		const lastDataPoint = firstPoints[lastIndex];
		return lastDataPoint.date;
	}
}
