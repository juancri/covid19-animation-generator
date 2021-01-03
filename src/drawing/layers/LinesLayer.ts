
import { FrameInfo, AnimationContext, Layer, Line, Point, Box } from '../../util/Types';
import CanvasPointsGenerator from '../CanvasPointsGenerator';
import LineScaledPointsGenerator from '../LineScaledPointsGenerator';

interface Boundaries {
	min: number;
	max: number;
}

export default class LinesLayer implements Layer
{
	private context: AnimationContext;

	public constructor(context: AnimationContext)
	{
		this.context = context;
	}

	public async draw (frame: FrameInfo): Promise<void>
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
		const layout = this.context.layout;
		const boundaries: Boundaries = {
			min: layout.plotArea.top,
			max: layout.plotArea.bottom
		};
		const box: Box = {
			...layout.plotArea,
			top: canvasValue - layout.lines.horizontalOffset,
			bottom: canvasValue
		};
		const align = layout.lines.horizontalAlign;
		this.drawLabel(canvasValue, label, boundaries, box, null, align);
	}

	private drawLabelVertical(canvasValue: number, label: string)
	{
		const layout = this.context.layout;
		const boundaries: Boundaries = {
			min: layout.plotArea.left,
			max: layout.plotArea.right
		};
		const box: Box = {
			...layout.plotArea,
			left: canvasValue,
			right: canvasValue + layout.lines.verticalOffset
		};
		const align = layout.lines.verticalAlign;
		this.drawLabel(canvasValue, label, boundaries, box, -90, align);
	}

	private drawLabel(canvasValue: number, label: string,
		boundaries: Boundaries, box: Box, angle: number | null, align?: string): void
	{
		const isVisible =
			canvasValue <= boundaries.max &&
			canvasValue >= boundaries.min;
		if (!isVisible)
			return;

		const lineLabel = this.context.color.lines.label;
		const alignValue = (align || 'center') as CanvasTextAlign;
		this.context.writer.drawBoxedText(
			label,
			lineLabel.font,
			lineLabel.color,
			box,
			angle,
			alignValue);
	}
}
