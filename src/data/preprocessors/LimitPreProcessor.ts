
import * as Enumerable from 'linq';

import { TimeSeries } from '../../util/Types';

/**
 * Limit the quantity of series to the provided parameter
 */
export default class LimitPreProcessor
{
	public static async run(series: TimeSeries[], params: number): Promise<TimeSeries[]>
	{
		return Enumerable
			.from(series)
			.take(params)
			.toArray();
	}
}
