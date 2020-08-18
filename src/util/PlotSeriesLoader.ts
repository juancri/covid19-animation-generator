
import * as Enumerable from 'linq';
import { DateTime } from 'luxon';

import { Configuration, Options, PlotSeries, ColorSchema } from './Types';
import DataSourceFilter from './DataSourceFilter';
import DataLoader from '../data/DataLoader';
import PlotPointsGenerator from '../scale/plotpoints/PlotPointsGenerator';
import logger from '../util/Logger';

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

		const series: PlotSeries[] = dataSource.series.map((seriesConf, seriesIndex) =>
		{
			const found = timeSeries.find(s => s.name === seriesConf.name);
			if (!found)
			{
				logger.info('Available series:');
				for (const available of timeSeries)
					logger.info(`  ${available.name}`);
				throw new Error(`Series not found: ${seriesConf.name}`);
			}
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
			const points = PlotPointsGenerator.generate(
				options, found.data, gaps, seriesIndex);
			if (!points.length)
				throw new Error(
					`No points error for series: ${seriesConf.code} ` +
					`(forced code: ${found.forceCode ?? 'none'})`);
			return {
				code: found.forceCode ?? seriesConf.code,
				color: found.forceColor ?? seriesConf.color,
				areaColor: seriesConf.areaColor ?? seriesConf.color,
				icon: seriesConf.icon ?? seriesConf.code,
				points,
				gaps,
				milestones
			};
		});

		// Warnings
		if (series.length === 1 && !options.drawMarkers)
			logger.warn('The datasource contains only 1 series. You should consider using drawMarkers.');
		if (series.length === 1 && options.seriesLineWidth < 5)
			logger.warn('The datasource contains only 1 series. You should consider using a seriesLineWidth >= 5.');

		// Debug
		if (options.debug)
			logger.info(JSON.stringify(series));

		// Done
		return series;
	}
}
