
import { DataSource, SeriesConfiguration } from './Types';

export default class DataSourceFilter
{
	public static apply(source: DataSource, filter: string): DataSource
	{
		if (!source.series)
			throw new Error('Series not found');

		return {
			...source,
			series: Array.from(DataSourceFilter.filter(source.series, filter))
		};
	}

	private static *filter(series: SeriesConfiguration[], filter: string): Generator<SeriesConfiguration>
	{
		const accepted = filter.split(',');
		for (const code of accepted)
		{
			const found = series.find(serie => serie.code === code);
			if (!found)
				throw new Error(`Series not found: ${code}`);
			yield found;
		}
	}
}

