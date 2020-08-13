
import * as Enumerable from 'linq';

import { TimeSeries } from '../../util/Types';

export default class LimitPreProcessor
{
	public static async run(series: TimeSeries[], params: any): Promise<TimeSeries[]>
	{
		return Enumerable
			.from(series)
			.take(params)
			.toArray();
	}
}
