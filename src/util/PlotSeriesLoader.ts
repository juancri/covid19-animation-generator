
import * as Enumerable from 'linq';

import { Configuration, Options, PlotSeries, ColorSchema } from './Types';
import DataSourceFilter from './DataSourceFilter';
import DataLoader from '../data/DataLoader';
import Log10PlotPointsGenerator from '../drawing/Log10PlotPointsGenerator';

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
			dataSource.series = Enumerable
				.from(colorSchema.series.colors)
				.zip(Enumerable.from(timeSeries), (color, serie) => ({
					name: serie.name,
					code: serie.name,
					color
				}))
				.toArray();

		// Filter
		if (options.filter)
			dataSource.series = DataSourceFilter.apply(
				dataSource.series, options.filter);

		const series: PlotSeries[] = dataSource.series.map(seriesConf =>
		{
			const found = timeSeries.find(s => s.name === seriesConf.name);
			if (!found)
				throw new Error(`Series not found: ${seriesConf.name}`);
			return {
				code: found.forceCode ?? seriesConf.code,
				color: found.forceColor ?? seriesConf.color,
				points: Log10PlotPointsGenerator.generate(found.data)
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
