
import { Animation, FrameFilterInfo, AnimationContext } from '../util/Types';

const NAME = 'cover';

export default class CoverFrameAnimation implements Animation
{
	private frameFilterInfo: FrameFilterInfo;

	public constructor(context: AnimationContext)
	{
		this.frameFilterInfo = {
			date: context.lastDate,
			dateRatio: 1,
			stage: 'cover',
			name: NAME,
			labelPositionRatio: context.options.showRank ? 1 : 0
		};
	}

	public getName(): string
	{
		return 'Cover Frame Animation';
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
