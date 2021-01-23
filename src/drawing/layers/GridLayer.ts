
import { FrameInfo, AnimationContext, Layer, Point } from '../../util/Types';

export default class GridLayer implements Layer
{
	private context: AnimationContext;

	public constructor(context: AnimationContext)
	{
		this.context = context;
	}

	public async draw (frame: FrameInfo): Promise<void>
	{
		// Scale labels
		this.drawScaleLabels(frame, true);
		this.drawScaleLabels(frame, false);
	}

	private drawScaleLabels(frame: FrameInfo, horizontal: boolean)
	{
		const labels = this.context.scaleLabelProvider.getScaleLabels(frame, horizontal);
		const area = this.context.layout.plotArea;
		const areaWidth = horizontal ?
			area.right - area.left :
			area.bottom - area.top;
		const scale = horizontal ?
			frame.scaleBoundaries.horizontal :
			frame.scaleBoundaries.vertical;
		const start = horizontal ? area.left : area.bottom;
		const reverse = !horizontal;
		const areaSegment = areaWidth / (scale.max - scale.min);
		for (const label of labels)
		{
			const offset = areaSegment * (label.position - scale.min);
			const pos = reverse ?
				start - offset :
				start + offset;

				// Grid
			const gridFrom: Point = {
				x: horizontal ? pos : area.left,
				y: horizontal ? area.bottom : pos
			};
			const gridTo: Point = {
				x: horizontal ? pos : area.right,
				y: horizontal ? area.top : pos
			};

			this.context.writer.drawLine(
				this.context.color.grid.color,
				this.context.color.grid.lineWidth,
				gridFrom,
				gridTo);
		}
	}
}
