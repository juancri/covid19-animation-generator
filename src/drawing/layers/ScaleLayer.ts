
import { FrameInfo, AnimationContext, Layer, Box, Point, Rotation } from '../../util/Types';

const LINE_WIDTH = 2;
const CIRCLE_WIDTH = 4;
const VERTICAL_ROTATION: Rotation =
{
	angle: -90,
	point:
	{
		horizontal: 'center',
		vertical: 'center'
	}
};

export default class ScaleLayer implements Layer
{
	private context: AnimationContext;
	private area: Box;
	private points: Point[];
	private boxX: Box;
	private boxY: Box;

	public constructor(context: AnimationContext)
	{
		this.context = context;
		this.area = this.context.layout.plotArea;
		this.points = [
			{ x: this.area.left, y: this.area.top },
			{ x: this.area.left, y: this.area.bottom },
			{ x: this.area.right, y: this.area.bottom }
		];
		this.boxX = {
			left: this.area.left,
			right: this.area.right,
			top: this.area.bottom,
			bottom: this.area.bottom + this.context.color.axis.offset
		};
		this.boxY = {
			left: this.area.left - this.context.color.axis.offset,
			right: this.area.left,
			top: this.area.top,
			bottom: this.area.bottom
		};
	}

	public async draw (frame: FrameInfo): Promise<void>
	{
		// Lines
		this.context.writer.drawPolyline(
			this.context.color.scale.color,
			LINE_WIDTH,
			this.points);

		// Scale labels
		this.drawScaleLabels(frame, true);
		this.drawScaleLabels(frame, false);

		// Axis Label X
		this.context.writer.drawBoxedText(
			this.context.options.horizontalAxisLabel,
			this.context.color.axis.font,
			this.context.color.axis.color,
			this.boxX);

		// Axis Label Y
		this.context.writer.drawBoxedText(
			this.context.options.verticalAxisLabel,
			this.context.color.axis.font,
			this.context.color.axis.color,
			this.boxY, VERTICAL_ROTATION);
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
		const rotation = horizontal ? null : VERTICAL_ROTATION;
		const areaSegment = areaWidth / (scale.max - scale.min);
		for (const label of labels)
		{
			const offset = areaSegment * (label.position - scale.min);
			const pos = reverse ?
				start - offset :
				start + offset;
			const box = {
				left: horizontal ?
					pos - 50 :
					area.left - this.context.color.scale.offset,
				right: horizontal ?
					pos + 50 :
					area.left,
				top: horizontal ?
					area.bottom :
					pos - 50,
				bottom: horizontal ?
					area.bottom + this.context.color.scale.offset :
					pos + 50
			};

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

			// Point
			this.context.writer.drawCircle(
				CIRCLE_WIDTH,
				this.context.color.scale.color,
				{
					x: horizontal ? pos : area.left,
					y: horizontal ? area.bottom : pos
				});

			// Text
			this.context.writer.drawBoxedText(
				label.text,
				this.context.color.scale.font,
				this.context.color.scale.color,
				box,
				rotation);
		}
	}
}
