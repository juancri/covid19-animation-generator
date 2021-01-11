
import { Animation, FrameFilterInfo, AnimationContext } from '../util/Types';

export default class SampleFrameAnimation implements Animation
{
	private frameFilterInfo: FrameFilterInfo;

	public constructor(context: AnimationContext)
	{
		const date = context.lastDate;
		this.frameFilterInfo = { date, dateRatio: 1 };
	}

	public getName(): string
	{
		return `Debug Frame Animation`;
	}

	public countFrames(): number
	{
		return 1;
	}

	public *getFrames(): Generator<FrameFilterInfo>
	{
		yield this.frameFilterInfo;
	}
}
