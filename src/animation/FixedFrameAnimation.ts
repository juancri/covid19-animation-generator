import { PlotSeries, FrameFilterInfo, Scale } from '../util/Types';
import DynamicScaleGenerator from '../scale/DynamicScaleGenerator';

export default class FixedFrameAnimation
{
	private frames: number;
	private frameFilterInfo: FrameFilterInfo;
	private scale: Scale | null;

	public constructor(series: PlotSeries[], frames: number)
	{
		this.frames = frames;
		const date = this.getLastDate(series);
		this.frameFilterInfo = { date, ratio: 1 };
		this.scale = null;
	}

	public *getFrames(): Generator<FrameFilterInfo>
	{
		for (let current = 1; current <= this.frames; current++)
			yield this.frameFilterInfo;
	}

	public getScale(frameFilterInfo: FrameFilterInfo, filteredSeries: PlotSeries[]) {
		if (this.scale === null)
			this.scale = DynamicScaleGenerator.generate(filteredSeries);
		return this.scale;
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
