
import { Animation, PlotSeries, FrameFilterInfo, AnimationContext } from '../util/Types';

export default class FixedFrameAnimation implements Animation
{
	private frames: number;
	private frameFilterInfo: FrameFilterInfo;

	public constructor(context: AnimationContext)
	{
		this.frames = context.options.extraFrames;
		const date = this.getLastDate(context.series);
		this.frameFilterInfo = { date, ratio: 1 };
	}
	public countFrames(): number
	{
		return this.frames;
	}

	public *getFrames(): Generator<FrameFilterInfo>
	{
		for (let current = 1; current <= this.frames; current++)
			yield this.frameFilterInfo;
	}


	// Private methods

	private getLastDate(series: PlotSeries[])
	{
		const firstPoints = series[0].points;
		const lastIndex = firstPoints.length - 1;
		const lastDataPoint = firstPoints[lastIndex];
		return lastDataPoint.date;
	}
}
