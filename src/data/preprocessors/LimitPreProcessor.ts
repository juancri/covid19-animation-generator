
import * as Enumerable from 'linq';

import { TimeSeries } from '../../util/Types';
import SumPreProcessor from './SumPreProcessor';

interface LimitParams
{
	count: number;
	others?: string;
}

/**
 * Limit the quantity of series
 */
export default class LimitPreProcessor
{
	public static async run(series: TimeSeries[], uParams: unknown): Promise<TimeSeries[]>
	{
		const params = uParams as LimitParams;
		if (!params.others)
		{
			return Enumerable
				.from(series)
				.take(params.count)
				.toArray();
		}

		const otherNames = Enumerable
			.from(series)
			.skip(params.count)
			.select(s => s.name)
			.toArray();
		const sumParams = {
			name: params.others,
			filter: otherNames,
			remove: true
		};

		return SumPreProcessor.run(series, sumParams, false);
	}
}
