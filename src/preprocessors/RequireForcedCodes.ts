import { TimeSeries } from '../util/Types';


export default class RequireForcedCodes
{
	public static run(series: TimeSeries[]): TimeSeries[]
	{
		for (const serie of series)
			if (!serie.forceCode)
				throw new Error(`Series should have a code: ${serie.name}`);
		return series;
	}
}
