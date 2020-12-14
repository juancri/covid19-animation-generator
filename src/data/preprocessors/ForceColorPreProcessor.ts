import { TimeSeries } from '../../util/Types';
import logger from '../../util/Logger';

interface ForceColorParams
{
	name: string;
	color: string;
}

/**
 * Finds a series by the name and applies the forced color.
 * If no series is found, a warning is logged.
 */
export default class ForceColorPreProcessor
{
	public static async run(series: TimeSeries[], params: unknown): Promise<TimeSeries[]>
	{
		const params2 = params as ForceColorParams;
		const found = series.find(serie => serie.name === params2.name);
		if (found)
			found.forceColor = params2.color;
		else
			logger.warn(`Series not found: ${params2.name}`);

		return series;
	}
}
