
import { Animation, FrameFilterInfo, AnimationContext } from '../util/Types';

export default class FixedFrameAnimation implements Animation
{
	private frames: number;
	private frameFilterInfo: FrameFilterInfo;

	public constructor(context: AnimationContext)
	{
		this.frames = context.options.extraFrames;
		const date = context.lastDate;
		this.frameFilterInfo = { date, dateRatio: 1 };
	}

	public getName(): string
	{
		return `Fixed Frame Animation (${this.frames})`;
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
}
