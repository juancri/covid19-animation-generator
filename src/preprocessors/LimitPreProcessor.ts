
import * as Enumerable from 'linq';

import { TimeSeries } from '../util/Types';

export default class LimitPreProcessor
{
	public static run(series: TimeSeries[], params: any)
	{
		return Enumerable
			.from(series)
			.take(params)
			.toArray();
	}
}
