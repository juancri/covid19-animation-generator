import { TimeSeries, SeriesConfiguration, ColorSchema, Layout, FrameInfo, PlotSeries, PlotPoint } from '../util/Types';
import AnimationFrameInfoGenerator from './AnimationFrameInfoGenerator';
import SvgWriter from './CanvasWriter';
import DataFrameFilter from './DataFrameFilter';
import Log10PlotPointsGenerator from './Log10PlotPointsGenerator';
import ScaledPointsGenerator from './ScaledPointsGenerator';
import CanvasPointsGenerator from './CanvasPointsGenerator';
import { DateTime } from 'luxon';

const X_LABEL = 'total confirmed cases (log)';
const Y_LABEL = 'new confirmed cases (log, last week)';

export default class ImageGenerator
{
	// Fields

	private canvasGenerator: CanvasPointsGenerator;
	private color: ColorSchema;
	private filter: DataFrameFilter;
	private layout: Layout;
	private scaledGenerator: ScaledPointsGenerator;
	private series: PlotSeries[];


	// Constructor

	public constructor (series: TimeSeries[], configuration: SeriesConfiguration[],
		color: ColorSchema, layout: Layout)
	{
		this.color = color;
		this.layout = layout;
		this.series = this.createPlotSeries(series, configuration);
		this.filter = new DataFrameFilter(this.series);
		this.scaledGenerator = new ScaledPointsGenerator({
			horizontal: { min: 1, max: 6 }, // log10
			vertical: { min: 1, max: 6 } // log10
		});
		this.canvasGenerator = new CanvasPointsGenerator(layout.plotArea);
	}


	// Public methods

	public async generate(outputDirectory: string,
		frames: number, extraFrames: number, days: number)
	{
		// Setup bounderies
		const writer = new SvgWriter(outputDirectory, this.layout.canvasSize, this.color.background);
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

	private async drawFrame(frameInfo: FrameInfo, writer: SvgWriter)
	{
		writer.clean();

		const group = writer.createGroup();
		const filteredData = this.filter.apply(frameInfo);
		for (const series of filteredData)
		{
			// Draw series
			const points = series.points
				.map(point => this.scaledGenerator.generate(point))
				.map(point => this.canvasGenerator.generate(point));
			this.drawSeriesLines(points, series.color, writer, group);
			this.drawSeriesCircle(points, series.color, writer, group);
			this.drawSeriesLabel(points, series.code, writer, group);
			writer.applyMask(group, this.layout.plotArea);

			// Draw other items
			this.drawScale(writer);
			this.drawDate(writer, frameInfo.date);
			this.drawSignature(writer);
		}

		await writer.save();
	}

	private drawSeriesLines(points: PlotPoint[], color: string, writer: SvgWriter, group: any)
	{
		if (points.length < 2)
			return;

		// TODO: const stroke = { color, ...this.color.lineStroke };
		writer.drawPolyline(color, 1, points);
	}

	private drawSeriesCircle(points: PlotPoint[], color: string, writer: SvgWriter, group: any)
	{
		if (!points.length)
			return;

		const point = points[points.length - 1];
		writer.drawCircle(this.layout.circleSize, color,
			[point.x, point.y], group);
	}

	private drawSeriesLabel(points: PlotPoint[], label: string, writer: SvgWriter, group: any)
	{
		if (!points.length)
			return;

		const point = points[points.length - 1];
		const x = point.x + this.color.seriesLabel.offset.x;
		const y = point.y + this.color.seriesLabel.offset.y;
		writer.drawText(label, this.color.seriesLabel.font,
			[x, y], group);
	}

	private drawScale(writer: SvgWriter)
	{
		// Lines
		const area = this.layout.plotArea;
		const points = [
			{ x: area.left, y: area.top },
			{ x: area.left, y: area.bottom },
			{ x: area.right, y: area.bottom }
		];
		writer.drawPolyline(this.color.scale.color, 1, points);

		// Label X
		const areaWidth = area.right - area.left;
		console.log('drawBoxedText', [area.left, area.bottom, areaWidth, 30], 30, X_LABEL);
		writer.drawBoxedText([area.left, area.bottom, areaWidth, 30], 30, X_LABEL);

		// Label Y
		const middleAreaY = (area.top + area.bottom) / 2;
		writer.drawBoxedText([0, middleAreaY - 30, areaWidth, 30], 30, Y_LABEL, -90);
	}

	private drawDate(writer: SvgWriter, date: DateTime)
	{
		writer.drawText(
			date.toISODate(),
			this.color.date.font,
			this.layout.datePosition);
	}

	private drawSignature(writer: SvgWriter)
	{
		// writer.drawText(
		// 	SIGNATURE,
		// 	this.layout.signature.font,
		// 	this.layout.signature.position);
	}
}
