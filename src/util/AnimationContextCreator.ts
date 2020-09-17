
// Dependencies
import * as path from 'path';
import * as Enumerable from 'linq';

// Local
import ConfigLoader from '../configuration/ConfigLoader';
import ParametersLoader from '../parameters/ParametersLoader';
import CanvasWriter from '../drawing/CanvasWriter';
import { AnimationContext, PlotSeries, Options } from './Types';
import ColorSchemaLoader from './ColorSchemaLoader';
import LayoutLoader from './LayoutLoader';
import PlotSeriesLoader from './PlotSeriesLoader';
import ScaleLabelProviderLoader from '../scale/labels/ScaleLabelProviderLoader';
import { DateTime } from 'luxon';
import LinesLoader from './LinesLoader';
import { Exception } from 'handlebars';

export default class AnimationContextCreator
{
	public static async create(): Promise<AnimationContext>
	{
		let config = await ConfigLoader.load ();
		const options = ParametersLoader.load(config.defaults);
		if (options.configOverride)
			config = ConfigLoader.applyOverride(config, options.configOverride);
		const color = ColorSchemaLoader.load(config, options);
		const layout = LayoutLoader.load(config, options);
		const outputPath = this.createOutputPath(options);
		const writer = new CanvasWriter(layout, outputPath);
		const series = await PlotSeriesLoader.load(config, options, color);
		const lines = LinesLoader.load(options);
		const scaleLabelProvider = ScaleLabelProviderLoader.load(options);
		const lastDate = this.getLastDate(series);
		const firstDate = this.getFirstDate(series, options, lastDate);

		return {
			config, options, layout,
			writer, series, color,
			scaleLabelProvider,
			firstDate, lastDate,
			lines
		};
	}

	private static createOutputPath(options: Options): string
	{
		const outputOption = options.outputDirectory;
		const isAbsolute = outputOption.startsWith('/');
		return isAbsolute ?
			outputOption :
			path.join(__dirname, '../..', outputOption);
	}

	private static getFirstDate(series: PlotSeries[],
		options: Options, lastDate: DateTime)
	{
		const possibleDate = Enumerable
			.from(series)
			.select(serie => serie.points)
			.where(points => !!points && !!points.length)
			.select(points => points[0])
			.select(point => point.date)
			.orderBy(date => +date)
			.firstOrDefault();
		if (options.days === 0)
			return possibleDate;

		const requestedDate = lastDate.plus({
			days: (-1 * options.days) + 1
		});
		return DateTime.max(requestedDate, possibleDate);
	}

	private static getLastDate(series: PlotSeries[])
	{
		const firstSeries = series[0];
		const firstSeriesPoints = firstSeries.points;
		if (!firstSeriesPoints.length)
			throw new Exception(`No points for this series: ${firstSeries.code}`);
		const lastIndex = firstSeriesPoints.length - 1;
		const lastDataPoint = firstSeriesPoints[lastIndex];
		return lastDataPoint.date;
	}
}
