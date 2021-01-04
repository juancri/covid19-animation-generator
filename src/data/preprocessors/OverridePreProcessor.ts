
import { DateTime } from 'luxon';
import { TimeSeries } from '../../util/Types';

interface OverrideParameters
{
	series: string;
	date: string;
	value: number;
}

export default class OVerridePreProcessor
{
	public static async run(series: TimeSeries[], params: unknown): Promise<TimeSeries[]>
	{
		const overrideParams = params as OverrideParameters;
		const serie = series.find(s => s.name === overrideParams.series);
		if (!serie)
			throw new Error(`Series not found: ${overrideParams.series}`);
		const date = DateTime.fromISO(overrideParams.date);
		const point = serie.data.find(p => +p.date === +date);
		if (point)
			point.value = overrideParams.value;
		else
			serie.data.push({
				date: date,
				value: overrideParams.value
			});

		return series;
	}
}
