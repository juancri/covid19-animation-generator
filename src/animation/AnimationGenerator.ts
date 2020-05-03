import { FrameInfo, PlotSeries, Animation } from '../util/Types';
import TimeAnimation from './TimeAnimation';
import FixedFrameAnimation from './FixexFrameAnimation';

export default class AnimationGenerator
{
	private animations: Animation[];

	public constructor(series: PlotSeries[], frames: number,
		extraFrames: number, days: number)
	{
		this.animations = [
			new TimeAnimation(series, frames, days),
			new FixedFrameAnimation(series, extraFrames)
		];
	}

	public *generate(): Generator<FrameInfo>
	{
		for (const animation of this.animations)
			for (const frame of animation.generate())
				yield frame;
	}
}
