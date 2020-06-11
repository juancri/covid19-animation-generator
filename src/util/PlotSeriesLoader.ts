
import * as Enumerable from 'linq';

import { Configuration, Options, PlotSeries, ColorSchema } from './Types';
import DataSourceFilter from './DataSourceFilter';
import DataLoader from '../data/DataLoader';
import PlotPointsGenerator from '../scale/plotpoints/PlotPointsGenerator';
import { DateTime } from 'luxon';

export default class PlotSeriesLoader
{
	public static async load(
		config: Configuration,
		options: Options,
		colorSchema: ColorSchema): Promise<PlotSeries[]>
	{
		// Load
		const dataSource = config.dataSources[options.source];
		if (!dataSource)
			throw new Error(`Data source not found: ${options.source}`);

		// Load time series
		const timeSeries = await DataLoader.load (dataSource);

		// Set automatic series
		if (!dataSource.series)
		{
			// Provide infinite colors
			const colorsEnum = Enumerable
				.repeat(colorSchema.series.colors)
				.selectMany(colors => Enumerable.from(colors));
			const seriesEnum = Enumerable.from(timeSeries);
			dataSource.series = colorsEnum
				.zip(seriesEnum, (color, serie) => ({
					name: serie.name,
					code: serie.name,
					color
				}))
				.toArray();
		}

		// Filter
		if (options.filter)
			dataSource.series = DataSourceFilter.apply(
				dataSource.series, options.filter);

		const series: PlotSeries[] = dataSource.series.map(seriesConf =>
		{
			const found = timeSeries.find(s => s.name === seriesConf.name);
			if (!found)
				throw new Error(`Series not found: ${seriesConf.name}`);
			const gapsConfig = found.forceGaps ?? seriesConf.gaps;
			const gaps = gapsConfig ?
				gapsConfig.map(gap => ({
					from: DateTime.fromISO(gap.from),
					to: DateTime.fromISO(gap.to)
				})) : [];
			const milestones = seriesConf.milestones ?
				seriesConf.milestones.map(milestone => ({
					date: DateTime.fromISO(milestone.date),
					color: milestone.color
				})) : [];
			return {
				code: found.forceCode ?? seriesConf.code,
				color: found.forceColor ?? seriesConf.color,
				points: PlotPointsGenerator.generate(
					options, found.data, gaps),
				gaps,
				milestones
			};
		});

		// Warnings
		if (series.length === 1 && !options.drawMarkers)
			console.log('The datasource contains only 1 series. You should consider using drawMarkers.');
		if (series.length === 1 && options.seriesLineWidth < 5)
			console.log('The datasource contains only 1 series. You should consider using a seriesLineWidth >= 5.');

		// Done
		return series;
	}
}
