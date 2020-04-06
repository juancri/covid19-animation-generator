import { TimeSeries, SeriesConfiguration, ColorSchema, Layout, FrameInfo, PlotSeries, PlotPoint } from '../util/Types';
import AnimationFrameInfoGenerator from './AnimationFrameInfoGenerator';
import SvgWriter from './SvgWriter';
import DataFrameFilter from './DataFrameFilter';
import Log10PlotPointsGenerator from './Log10PlotPointsGenerator';
import ScaledPointsGenerator from './ScaledPointsGenerator';
import CanvasPointsGenerator from './CanvasPointsGenerator';

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
			this.drawFrame(frameInfo, writer);
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

	private drawFrame(frameInfo: FrameInfo, writer: SvgWriter)
	{
		writer.clean();

		const filteredData = this.filter.apply(frameInfo);
		for (const series of filteredData)
		{
			const points = series.points
				.map(point => this.scaledGenerator.generate(point))
				.map(point => this.canvasGenerator.generate(point));
			this.drawSeriesLines(points, series.color, writer);
			this.drawSeriesCircle(points, series.color, writer);
			this.drawSeriesLabel(points, series.code, writer);
		}

		// Temp
		writer.drawText(
			`Hello world ${frameInfo.date} ${frameInfo.ratio}`,
			this.color.date.font,
			[0, 0]);

		writer.save();
	}

	private drawSeriesLines(points: PlotPoint[], color: string, writer: SvgWriter)
	{
		if (points.length < 2)
			return;

		for (let index = 1; index < points.length - 1; index++)
		{
			const point1 = points[index - 1];
			const point2 = points[index];
			writer.drawLine(
				{ color, ...this.color.lineStroke },
				[point1.x, point1.y], [point2.x, point2.y]);
		}
	}

	private drawSeriesCircle(points: PlotPoint[], color: string, writer: SvgWriter)
	{
		if (!points.length)
			return;

		const point = points[points.length - 1];
		writer.drawCircle(this.layout.circleSize, color, [point.x, point.y]);
	}

	private drawSeriesLabel(points: PlotPoint[], label: string, writer: SvgWriter)
	{
		if (!points.length)
			return;

		const point = points[points.length - 1];
		const x = point.x + this.color.seriesLabel.offset[0];
		const y = point.y + this.color.seriesLabel.offset[1];
		writer.drawText(label, this.color.seriesLabel.font, [x, y]);
	}
}
