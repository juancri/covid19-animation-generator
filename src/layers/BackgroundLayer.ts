
import { AnimationContext, Box, Layer } from '../util/Types';

export default class BackgroundLayer implements Layer
{
	private context: AnimationContext;
	private canvasBox: Box;

	public constructor(context: AnimationContext)
	{
		this.context = context;
		this.canvasBox = {
			left: 0,
			top: 0,
			right: context.layout.canvasSize[0],
			bottom: context.layout.canvasSize[1]
		};
	}

	public async draw ()
	{
		this.context.writer.clean();
		this.context.writer.drawFilledRectangle(
			this.canvasBox,
			this.context.color.background);
	}
}
