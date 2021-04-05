
import { TimeSeries } from '../../util/Types';

/**
 * Filter specific series by name
 */
export default class FilterRegexPreProcessor
{
	public static async run(series: TimeSeries[], uParams: unknown): Promise<TimeSeries[]>
	{
		const regex = new RegExp(uParams as string);
		return series.filter(s => regex.test(s.name));
	}
}
