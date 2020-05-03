import { DateTime } from 'luxon';

import { TimeSeries, SeriesConfiguration, ColorSchema, Layout, FrameInfo, PlotSeries, PlotPoint } from '../util/Types';
import AnimationFrameInfoGenerator from './AnimationFrameInfoGenerator';
import CanvasWriter from './CanvasWriter';
import DataFrameFilter from './DataFrameFilter';
import Log10PlotPointsGenerator from './Log10PlotPointsGenerator';
import ScaledPointsGenerator from './ScaledPointsGenerator';
import CanvasPointsGenerator from './CanvasPointsGenerator';
import ScaleLabelGenerator from '../util/ScaleLabelGenerator';
import ScaleGenerator from './ScaleGenerator';

const X_LABEL = 'total confirmed cases (log)';
const Y_LABEL = 'new confirmed cases (log, last week)';

export default class ImageGenerator
{
	// Fields

	private canvasGenerator: CanvasPointsGenerator;
	private color: ColorSchema;
	private filter: DataFrameFilter;
	private layout: Layout;
	private scaleGenerator: ScaleGenerator;
	private scaledPointsGenerator: ScaledPointsGenerator;
	private series: PlotSeries[];


	// Constructor

	public constructor (series: TimeSeries[], configuration: SeriesConfiguration[],
		color: ColorSchema, layout: Layout)
	{
		this.color = color;
		this.layout = layout;
		this.series = this.createPlotSeries(series, configuration);
		this.filter = new DataFrameFilter(this.series);
		this.scaleGenerator = new ScaleGenerator(this.filter);
		this.scaledPointsGenerator = new ScaledPointsGenerator(this.scaleGenerator);
		this.canvasGenerator = new CanvasPointsGenerator(layout.plotArea);
	}


	// Public methods

	public async generate(outputDirectory: string,
		frames: number, extraFrames: number, days: number)
	{
		// Setup bounderies
		const writer = new CanvasWriter(outputDirectory, this.layout.canvasSize, this.color.background);
		const frameInfoGenerator = new AnimationFrameInfoGenerator(this.series, frames, extraFrames, days);

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

	private async drawFrame(frameInfo: FrameInfo, writer: CanvasWriter)
	{
		writer.clean();
		this.filter.apply(frameInfo);
		this.scaleGenerator.apply();
		this.scaledPointsGenerator.apply();
		for (const series of this.filter.getFiltered())
		{
			// Draw series
			const points = series.points
				.map(point => this.scaledPointsGenerator.generate(point))
				.map(point => this.canvasGenerator.generate(point));
			this.drawSeriesLines(points, series.color, writer);
			this.drawSeriesCircle(points, series.color, writer);
			this.drawSeriesLabel(points, series.code, writer);

			// Draw other items
			this.drawScale(writer);
			this.drawDate(writer, frameInfo.date);
		}

		await writer.save();
	}

	private drawSeriesLines(points: PlotPoint[], color: string, writer: CanvasWriter)
	{
		if (points.length < 2)
			return;

		writer.drawPolyline(color, 3, points, this.layout.plotArea);
	}

	private drawSeriesCircle(points: PlotPoint[], color: string, writer: CanvasWriter)
	{
		if (!points.length)
			return;

		const point = points[points.length - 1];
		writer.drawCircle(this.layout.circleSize, color, point, this.layout.plotArea);
	}

	private drawSeriesLabel(points: PlotPoint[], label: string, writer: CanvasWriter)
	{
		if (!points.length)
			return;

		const point = points[points.length - 1];
		const x = point.x + this.color.series.offset.x;
		const y = point.y + this.color.series.offset.y;
		writer.drawText(
			label, this.color.series.font, this.color.series.color,
			{ x, y }, this.layout.plotArea);
	}

	private drawScale(writer: CanvasWriter)
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
		this.drawScaleLabels(writer, true);
		this.drawScaleLabels(writer, false);

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

	private drawScaleLabels(writer: CanvasWriter, horizontal: boolean)
	{
		const area = this.layout.plotArea;
		const areaWidth = horizontal ?
			area.right - area.left :
			area.bottom - area.top;
		const scale = horizontal ?
			this.scaleGenerator.getScale().horizontal :
			this.scaleGenerator.getScale().vertical;
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
}
