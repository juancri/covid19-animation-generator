
import { SeriesConfiguration } from './Types';

export default class DataSourceFilter
{
	public static apply(series: SeriesConfiguration[], filter: string): SeriesConfiguration[]
	{
		return Array.from(DataSourceFilter.filter(series, filter));
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

