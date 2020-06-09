
import { Animation, FrameFilterInfo } from '../util/Types';

export default class EmptyAnimation implements Animation
{
	public getName(): string
	{
		return 'Empty';
	}

	public countFrames(): number
	{
		return 0;
	}

	public *getFrames(): Generator<FrameFilterInfo>
	{
		// done
	}
}
