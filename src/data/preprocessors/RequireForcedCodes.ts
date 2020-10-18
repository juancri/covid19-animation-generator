import { TimeSeries } from '../../util/Types';

/**
 * Checks that all series have forced codes.
 * It fails if any of the series does not have a forced code.
 */
export default class RequireForcedCodes
{
	public static async run(series: TimeSeries[]): Promise<TimeSeries[]>
	{
		for (const serie of series)
			if (!serie.forceCode)
				throw new Error(`Series should have a code: ${serie.name}`);
		return series;
	}
}
