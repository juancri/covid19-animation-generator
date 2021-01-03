import { TimeSeries } from '../../util/Types';

/**
 * Filter specific series by name
 */
export default class FilterPreProcessor
{
	public static async run(series: TimeSeries[], params: unknown): Promise<TimeSeries[]>
	{
		const params2 = params as string[];
		return series.filter(s => params2.includes(s.name));
	}
}
