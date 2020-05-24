
import { Animation, PlotSeries, FrameFilterInfo, AnimationContext } from '../util/Types';

const NAME = 'cover';

export default class CoverFrameAnimation implements Animation
{
	private frameFilterInfo: FrameFilterInfo;

	public constructor(context: AnimationContext)
	{
		const date = this.getLastDate(context.series);
		this.frameFilterInfo = {
			date,
			ratio: 1,
			drawCover: true,
			name: NAME
		};
	}

	public countFrames(): number
	{
		return 1;
	}

	public *getFrames(): Generator<FrameFilterInfo>
	{
		yield this.frameFilterInfo;
	}

	private getLastDate(series: PlotSeries[])
	{
		const firstPoints = series[0].points;
		const lastIndex = firstPoints.length - 1;
		const lastDataPoint = firstPoints[lastIndex];
		return lastDataPoint.date;
	}
}
