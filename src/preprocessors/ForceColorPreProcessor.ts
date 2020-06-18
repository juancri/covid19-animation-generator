import { TimeSeries } from '../util/Types';
import logger from '../util/Logger';

interface ForceColorParams
{
	name: string;
	color: string;
}

export default class ForceColorPreProcessor
{
	public static async run(series: TimeSeries[], params: ForceColorParams): Promise<TimeSeries[]>
	{
		const found = series.find(serie => serie.name === params.name);
		if (found)
			found.forceColor = params.color;
		else
			logger.warn(`Series not found: ${params.name}`);

		return series;
	}
}
