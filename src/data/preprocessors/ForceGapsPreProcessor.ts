import { TimeSeries, GapConfiguration } from '../../util/Types';
import logger from '../../util/Logger';

interface ForceGapsParams
{
	name: string;
	gaps: GapConfiguration[];
}

/**
 * Finds a series by the name and applies the forced gaps.
 * If no series is found, a warning is logged.
 */
export default class ForceGapsPreProcessor
{
	public static async run(series: TimeSeries[], params: unknown): Promise<TimeSeries[]>
	{
		const params2 = params as ForceGapsParams;
		const found = series.find(serie => serie.name === params2.name);
		if (found)
			found.forceGaps = params2.gaps;
		else
			logger.warn(`Series not found: ${params2.name}`);

		return series;
	}
}
