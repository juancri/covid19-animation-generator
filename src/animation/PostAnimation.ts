
import { AnimationContext } from '../util/Types';
import OverlayAnimation from './OverlayAnimation';

export default class PostAnimation extends OverlayAnimation
{
	public constructor(context: AnimationContext)
	{
		if (!context.options.postAnimationDirectory)
			throw new Error('Invalid post animation value');
		super('post', context.lastDate,
			context.options.postAnimationDirectory);
	}
}
