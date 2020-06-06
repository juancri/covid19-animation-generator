
import { AnimationContext } from '../util/Types';
import OverlayAnimation from './OverlayAnimation';

export default class PostAnimation extends OverlayAnimation
{
	public constructor(context: AnimationContext)
	{
		super('post', context.lastDate,
			context.options.postAnimationDirectory);
	}
}
