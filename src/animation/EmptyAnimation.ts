
import { Animation, FrameFilterInfo } from '../util/Types';

export default class EmptyAnimation implements Animation
{
	public countFrames(): number
	{
		return 0;
	}

	public *getFrames(): Generator<FrameFilterInfo>
	{
		// done
	}
}
