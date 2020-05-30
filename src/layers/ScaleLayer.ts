
import { FrameInfo, AnimationContext, Layer, Box, Point } from '../util/Types';
import ScaleLabelGenerator from '../util/ScaleLabelGenerator';

const LINE_WIDTH = 2;
const CIRCLE_WIDTH = 4;

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

	public async draw (frame: FrameInfo)
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
			this.boxY, -90);
	}

	private drawScaleLabels(frame: FrameInfo, horizontal: boolean)
	{
		const area = this.context.layout.plotArea;
		const areaWidth = horizontal ?
			area.right - area.left :
			area.bottom - area.top;
		const scale = horizontal ?
			frame.scaleBoundaries.horizontal :
			frame.scaleBoundaries.vertical;
		const start = horizontal ? area.left : area.bottom;
		const reverse = !horizontal;
		const rotate = horizontal ? 0 : -90;
		const areaSegment = areaWidth / (scale.max - scale.min);
		const min = Math.ceil(scale.min);
		for (let labelValue = min; labelValue <= scale.max; labelValue++)
		{
			const labelText = ScaleLabelGenerator.generate(Math.pow(10, labelValue));
			const offset = areaSegment * (labelValue - scale.min);
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

			this.context.writer.drawCircle(
				CIRCLE_WIDTH,
				this.context.color.scale.color,
				{
					x: horizontal ? pos : area.left,
					y: horizontal ? area.bottom : pos
				});
			this.context.writer.drawBoxedText(
				labelText,
				this.context.color.scale.font,
				this.context.color.scale.color,
				box,
				rotate);
		}
	}
}
