import { TimeSeries } from "@/util/Types";
import { DateTime } from "luxon";

const DATE_OPTIONS = { zone: 'utc' };

interface RemoveValueOptions
{
	series: string;
	date: string;
}

export default class RemoveValuePreProcessor
{
	public static async run(series: TimeSeries[], params: unknown): Promise<TimeSeries[]>
	{
		const options = params as RemoveValueOptions;
		const date = DateTime.fromISO(options.date, DATE_OPTIONS);
		return series.map(s => RemoveValuePreProcessor.removeFromSeries(s, options.series, date));
	}

	private static removeFromSeries(series: TimeSeries, seriesName: string, date: DateTime): TimeSeries
	{
		if (series.name !== seriesName)
			return series;
		const data = series.data.filter(p => +p.date !== +date);
		return {
			...series,
			data
		};
	}
}
