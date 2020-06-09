import { TimeSeries, SeriesGapConfiguration } from '../util/Types';

interface ForceGapsParams
{
	name: string;
	gaps: SeriesGapConfiguration[];
}

export default class ForceGapsPreProcessor
{
	public static async run(series: TimeSeries[], params: ForceGapsParams): Promise<TimeSeries[]>
	{
		const found = series.find(serie => serie.name === params.name);
		if (found)
			found.forceGaps = params.gaps;
		else
			console.log(`Series not found: ${params.name}`);

		return series;
	}
}
