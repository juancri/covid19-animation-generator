import { TimeSeries } from "@/util/Types";
import { DateTime } from "luxon";

const DATE_OPTIONS = { zone: 'utc' };

export default class RemoveDatePreProcessor
{
	public static async run(series: TimeSeries[], params: unknown): Promise<TimeSeries[]>
	{
		const date = DateTime.fromISO(params as string, DATE_OPTIONS);
		return series.map(s => RemoveDatePreProcessor.removeFromSeries(s, date));
	}

	private static removeFromSeries(series: TimeSeries, date: DateTime): TimeSeries
	{
		const data = series.data.filter(p => +p.date !== +date);
		return {
			...series,
			data
		};
	}
}
