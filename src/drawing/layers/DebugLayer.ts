
import { FrameInfo, AnimationContext, Layer } from '../../util/Types';

export default class DebugLayer implements Layer
{
	private context: AnimationContext;

	public constructor(context: AnimationContext)
	{
		this.context = context;
	}

	public async draw (frame: FrameInfo)
	{
		if (!this.context.options.debug)
			return;

		this.context.writer.drawText(
			`Frame: ${frame.currentFrame} / ${frame.totalFrames}\n` +
			`Animation: ${frame.animationName}\n` +
			`Stage: ${frame.stage}`,
			this.context.color.debug.font,
			this.context.color.debug.color,
			this.context.layout.debugPosition);
	}
}
