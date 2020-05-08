
import * as path from 'path';
import { DateTime } from 'luxon';

import { TimeSeries, SeriesConfiguration, ColorSchema, Layout, FrameInfo, PlotSeries } from '../util/Types';
import AnimationPipeline from '../animation/AnimationPipeline';
import CanvasWriter from './CanvasWriter';
import Log10PlotPointsGenerator from './Log10PlotPointsGenerator';
import ScaleLabelGenerator from '../util/ScaleLabelGenerator';

const ICON_PATH = path.join(__dirname, '../../assets/insta40.png');
const X_LABEL = 'total confirmed cases (log)';
const Y_LABEL = 'new confirmed cases (log, last week)';
const WATERMARK_LABEL = '@covid19statsvideos';

export default class ImageGenerator
{
	// Fields

	private color: ColorSchema;
	private layout: Layout;
	private series: PlotSeries[];


	// Constructor

	public constructor (series: TimeSeries[], configuration: SeriesConfiguration[],
		color: ColorSchema, layout: Layout)
	{
		this.color = color;
		this.layout = layout;
		this.series = this.createPlotSeries(series, configuration);
	}


	// Public methods

	public async generate(outputDirectory: string,
		frames: number, extraFrames: number, days: number)
	{
		// Setup bounderies
		const writer = new CanvasWriter(
			outputDirectory, this.layout.canvasSize,
			this.color.background);
		const frameInfoGenerator = new AnimationPipeline(
			this.series, this.layout.plotArea,
			frames, extraFrames, days);

		for (const frameInfo of frameInfoGenerator.generate())
			await this.drawFrame(frameInfo, writer);
	}


	// Private methods

	private createPlotSeries(series: TimeSeries[], configuration: SeriesConfiguration[]): PlotSeries[]
	{
		return configuration.map(seriesConf =>
		{
			const found = series.find(s => s.name === seriesConf.name);
			if (!found)
				throw new Error(`Time series not found: ${seriesConf.name}`);
			return {
				code: seriesConf.code,
				color: seriesConf.color,
				points: Log10PlotPointsGenerator.generate(found.data)
			};
		});
	}

	private async drawFrame(frame: FrameInfo, writer: CanvasWriter)
	{
		writer.clean();
		for (const series of frame.series)
		{
			// Draw series
			this.drawSeriesLines(series, writer);
			this.drawSeriesCircle(series, writer);
			this.drawSeriesLabel(series, writer);

			// Draw other items
			this.drawScale(writer, frame);
			this.drawDate(writer, frame.date);
			await this.drawWatermark(writer);
		}

		await writer.save();
	}

	private drawSeriesLines(series: PlotSeries, writer: CanvasWriter)
	{
		if (series.points.length < 2)
			return;

		writer.drawPolyline(series.color, 3, series.points, this.layout.plotArea);
	}

	private drawSeriesCircle(series: PlotSeries, writer: CanvasWriter)
	{
		if (!series.points.length)
			return;

		const point = series.points[series.points.length - 1];
		writer.drawCircle(this.layout.circleSize, series.color, point, this.layout.plotArea);
	}

	private drawSeriesLabel(series: PlotSeries, writer: CanvasWriter)
	{
		if (!series.points.length)
			return;

		const point = series.points[series.points.length - 1];
		const x = point.x + this.color.series.offset.x;
		const y = point.y + this.color.series.offset.y;
		writer.drawText(
			series.code, this.color.series.font, this.color.series.color,
			{ x, y }, this.layout.plotArea);
	}

	private drawScale(writer: CanvasWriter, frame: FrameInfo)
	{
		// Lines
		const area = this.layout.plotArea;
		const points = [
			{ x: area.left, y: area.top },
			{ x: area.left, y: area.bottom },
			{ x: area.right, y: area.bottom }
		];
		writer.drawPolyline(this.color.scale.color, 2, points);

		// Scale labels
		this.drawScaleLabels(writer, frame, true);
		this.drawScaleLabels(writer, frame, false);

		// Axis Label X
		const boxX = {
			left: area.left,
			right: area.right,
			top: area.bottom,
			bottom: area.bottom + this.color.axis.offset
		};
		writer.drawBoxedText(X_LABEL, this.color.axis.font, this.color.axis.color, boxX);

		// Axis Label Y
		const boxY = {
			left: area.left - this.color.axis.offset,
			right: area.left,
			top: area.top,
			bottom: area.bottom
		};
		writer.drawBoxedText(Y_LABEL, this.color.axis.font, this.color.axis.color, boxY, -90);
	}

	private drawScaleLabels(writer: CanvasWriter, frame: FrameInfo, horizontal: boolean)
	{
		const area = this.layout.plotArea;
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
				left: horizontal ? pos - 50 : area.left - this.color.scale.offset,
				right: horizontal ? pos + 50 : area.left,
				top: horizontal ? area.bottom : pos - 50,
				bottom: horizontal ? area.bottom + this.color.scale.offset : pos + 50
			};

			writer.drawCircle(
				4,
				this.color.scale.color,
				{
					x: horizontal ? pos : area.left,
					y: horizontal ? area.bottom : pos
				});
			writer.drawBoxedText(
				labelText,
				this.color.scale.font,
				this.color.scale.color,
				box,
				rotate);
		}
	}

	private drawDate(writer: CanvasWriter, date: DateTime)
	{
		writer.drawText(
			date.toISODate(),
			this.color.date.font,
			this.color.date.color,
			this.layout.datePosition);
	}

	private async drawWatermark(writer: CanvasWriter)
	{
		writer.drawFilledRectangle(
			this.layout.watermark.area,
			this.color.watermark.background);
		await writer.drawImage(
			ICON_PATH,
			this.layout.watermark.iconPosition);
		writer.drawText(
			WATERMARK_LABEL,
			this.color.watermark.font,
			this.color.watermark.color,
			this.layout.watermark.textPosition);
	}
}
