import { FrameInfo, AnimationContext } from '../util/Types';
import ScaleLabelGenerator from '../util/ScaleLabelGenerator';
import Layer from './Layer';

const LINE_WIDTH = 2;

export default class ScaleLayer implements Layer
{
	private context: AnimationContext;

	public constructor(context: AnimationContext)
	{
		this.context = context;
	}

	public async draw (frame: FrameInfo)
	{
		// Lines
		const area = this.context.layout.plotArea;
		const points = [
			{ x: area.left, y: area.top },
			{ x: area.left, y: area.bottom },
			{ x: area.right, y: area.bottom }
		];
		this.context.writer.drawPolyline(
			this.context.color.scale.color,
			LINE_WIDTH,
			points);

		// Scale labels
		this.drawScaleLabels(frame, true);
		this.drawScaleLabels(frame, false);

		// Axis Label X
		const boxX = {
			left: area.left,
			right: area.right,
			top: area.bottom,
			bottom: area.bottom + this.context.color.axis.offset
		};
		this.context.writer.drawBoxedText(
			this.context.options.horizontalAxisLabel,
			this.context.color.axis.font,
			this.context.color.axis.color,
			boxX);

		// Axis Label Y
		const boxY = {
			left: area.left - this.context.color.axis.offset,
			right: area.left,
			top: area.top,
			bottom: area.bottom
		};
		this.context.writer.drawBoxedText(
			this.context.options.verticalAxisLabel,
			this.context.color.axis.font,
			this.context.color.axis.color,
			boxY, -90);
	}

	private drawScaleLabels(frame: FrameInfo, horizontal: boolean)
	{
		const area = this.context.layout.plotArea;
		const areaWidth = horizontal ?
			area.right - area.left :
			area.bottom - area.top;
		const scale = horizontal ?
			frame.scale.horizontal :
			frame.scale.vertical;
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
				4,
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
