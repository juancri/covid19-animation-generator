import { TimeSeries, SeriesGapConfiguration } from '../../util/Types';
import logger from '../../util/Logger';

interface ForceGapsParams
{
	name: string;
	gaps: SeriesGapConfiguration[];
}

/**
 * Finds a series by the name and applies the forced gaps.
 * If no series is found, a warning is logged.
 */
export default class ForceGapsPreProcessor
{
	public static async run(series: TimeSeries[], params: ForceGapsParams): Promise<TimeSeries[]>
	{
		const found = series.find(serie => serie.name === params.name);
		if (found)
			found.forceGaps = params.gaps;
		else
			logger.warn(`Series not found: ${params.name}`);

		return series;
	}
}
