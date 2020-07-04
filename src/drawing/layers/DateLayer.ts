
import { FrameInfo, AnimationContext, Layer } from '../../util/Types';

export default class DateLayer implements Layer
{
	private context: AnimationContext;

	public constructor(context: AnimationContext)
	{
		this.context = context;
	}

	public async draw (frame: FrameInfo)
	{
		this.context.writer.drawText(
			frame.date.toFormat(this.context.options.dateFormat),
			this.context.color.date.font,
			this.context.color.date.color,
			this.context.layout.datePosition);
	}
}
