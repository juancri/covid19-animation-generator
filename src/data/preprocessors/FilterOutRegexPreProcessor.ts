
import { TimeSeries } from '../../util/Types';

/**
 * Filter out specific series by name
 */
export default class FilterOutRegexPreProcessor
{
	public static async run(series: TimeSeries[], uParams: unknown): Promise<TimeSeries[]>
	{
		const regex = new RegExp(uParams as string);
		return series.filter(s => !regex.test(s.name));
	}
}
