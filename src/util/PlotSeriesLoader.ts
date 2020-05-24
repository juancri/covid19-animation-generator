import { Configuration, Options, PlotSeries } from './Types';
import DataSourceFilter from './DataSourceFilter';
import DataLoader from '../data/DataLoader';
import Log10PlotPointsGenerator from '../drawing/Log10PlotPointsGenerator';

export default class PlotSeriesLoader
{
	public static async load(config: Configuration, options: Options): Promise<PlotSeries[]>
	{
		// Load
		let dataSource = config.dataSources[options.source];
		if (!dataSource)
			throw new Error(`Data source not found: ${options.source}`);
		if (options.filter)
			dataSource = DataSourceFilter.apply(dataSource, options.filter);

		// Warnings
		if (dataSource.series.length === 1 && !options.drawMarkers)
			console.log('The datasource contains only 1 series. You should consider using drawMarkers.');
		if (dataSource.series.length === 1 && options.seriesLineWidth < 5)
			console.log('The datasource contains only 1 series. You should consider using a seriesLineWidth >= 5.');

		// Done
		const timeSeries = await DataLoader.load (dataSource);
		const series: PlotSeries[] = dataSource.series.map(seriesConf =>
		{
			const found = timeSeries.find(s => s.name === seriesConf.name);
			if (!found)
				throw new Error(`Series not found: ${seriesConf.name}`);
			return {
				code: seriesConf.code,
				color: seriesConf.color,
				points: Log10PlotPointsGenerator.generate(found.data)
			};
		});

		return series;
	}
}
