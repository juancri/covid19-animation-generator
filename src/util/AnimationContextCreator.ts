
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

// Constants
const OUTPUT_PATH = path.join(__dirname, '../../output');

export default class AnimationContextCreator
{
	public static async create(): Promise<AnimationContext>
	{
		let config = await ConfigLoader.load ();
		const options = ParametersLoader.load(config.defaults);
		if (options.configOverride)
			config = ConfigLoader.applyOverride(config, options.configOverride);
		const color = ColorSchemaLoader.load(config, options);
		const layout = LayoutLoader.load(config);
		const writer = new CanvasWriter(layout, OUTPUT_PATH);
		const series = await PlotSeriesLoader.load(config, options, color);
		const scaleLabelProvider = ScaleLabelProviderLoader.load(options);
		const lastDate = this.getLastDate(series);
		const firstDate = this.getFirstDate(series, options, lastDate);

		return {
			config, options, layout,
			writer, series, color,
			scaleLabelProvider,
			firstDate, lastDate
		};
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
		const firstPoints = series[0].points;
		const lastIndex = firstPoints.length - 1;
		const lastDataPoint = firstPoints[lastIndex];
		return lastDataPoint.date;
	}
}
