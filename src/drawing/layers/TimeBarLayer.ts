import { FrameInfo, AnimationContext, EasingFunction, Layer } from '../../util/Types';
import EasingLoader from '../../util/EasingLoader';

export default class TimeBarLayer implements Layer
{
	private context: AnimationContext;
	private easing: EasingFunction;

	public constructor(context: AnimationContext)
	{
		this.context = context;
		this.easing = EasingLoader.load(context.options.timebarEasing);
	}

	public async draw (frame: FrameInfo): Promise<void>
	{
		// Does not apply for cover
		if (frame.stage === 'cover')
			return;

		// Background
		const timebar = this.context.layout.timebar;
		this.context.writer.drawFilledRectangle(
			timebar,
			this.context.color.timebar.background);

		// Foreground
		const fullWidth = timebar.right - timebar.left;
		const ratio = this.easing(frame.currentFrame / frame.totalFrames);
		const barWidth = fullWidth * ratio;
		const barRight = timebar.left + barWidth;
		this.context.writer.drawFilledRectangle(
			{ ...timebar, right: barRight },
			this.context.color.timebar.foreground);
	}
}
