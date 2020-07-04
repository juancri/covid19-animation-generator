
import { FrameInfo, AnimationContext, Layer, Line, Point } from '../../util/Types';
import CanvasPointsGenerator from '../CanvasPointsGenerator';
import LineScaledPointsGenerator from '../LineScaledPointsGenerator';

export default class LinesLayer implements Layer
{
	private context: AnimationContext;

	public constructor(context: AnimationContext)
	{
		this.context = context;
	}

	public async draw (frame: FrameInfo)
	{
		this.drawLines(this.context.lines.horizontal, true, frame);
		this.drawLines(this.context.lines.vertical, false, frame);
	}

	private drawLines(lines: Line[], horizontal: boolean, frame: FrameInfo)
	{
		const isValueHorizontal = !horizontal;
		for (const line of lines)
		{
			const scaledValue = LineScaledPointsGenerator.scaleValue(
				line.value, isValueHorizontal, frame.scaleBoundaries);
			const canvasValue = CanvasPointsGenerator.scaleValue(
				scaledValue, isValueHorizontal, this.context.layout.plotArea);
			this.drawLine(canvasValue, horizontal);
			if (horizontal)
				this.drawLabelHorizontal(canvasValue, line.label);
			else
				this.drawLabelVertical(canvasValue, line.label);
		}
	}

	private drawLine(canvasValue: number, horizontal: boolean)
	{
		// If the line is horizontal, the value is vertical
		// If the line is vertical, the value is horizontal
		const from: Point = horizontal ?
			{ x: this.context.layout.plotArea.left, y: canvasValue } :
			{ x: canvasValue, y: this.context.layout.plotArea.top };
		const to: Point = horizontal ?
			{ x: this.context.layout.plotArea.right, y: canvasValue } :
			{ x: canvasValue, y: this.context.layout.plotArea.bottom };

		this.context.writer.drawLine(
			this.context.color.lines.color,
			this.context.layout.lines.width,
			from,
			to,
			this.context.layout.plotArea);
	}

	private drawLabelHorizontal(canvasValue: number, label: string)
	{
		const box = {
			left: this.context.layout.plotArea.left,
			right: this.context.layout.plotArea.right,
			top: canvasValue + this.context.layout.lines.horizontalOffset,
			bottom: canvasValue
		};

		this.context.writer.drawBoxedText(
			label,
			this.context.color.lines.label.font,
			this.context.color.lines.label.color,
			box);
	}

	private drawLabelVertical(canvasValue: number, label: string)
	{
		// // Axis Label X
		// this.boxX = {
		// 	left: this.area.left,
		// 	right: this.area.right,
		// 	top: this.area.bottom,
		// 	bottom: this.area.bottom + this.context.color.axis.offset
		// };
		// this.boxY = {
		// 	left: this.area.left - this.context.color.axis.offset,
		// 	right: this.area.left,
		// 	top: this.area.top,
		// 	bottom: this.area.bottom
		// };
		// this.context.writer.drawBoxedText(
		// 	this.context.options.horizontalAxisLabel,
		// 	this.context.color.axis.font,
		// 	this.context.color.axis.color,
		// 	this.boxX);

		const box = {
			left: canvasValue,
			right: canvasValue + this.context.layout.lines.verticalOffset,
			top: this.context.layout.plotArea.top,
			bottom: this.context.layout.plotArea.bottom
		};

		this.context.writer.drawBoxedText(
			label,
			this.context.color.lines.label.font,
			this.context.color.lines.label.color,
			box,
			-90);
	}
}
