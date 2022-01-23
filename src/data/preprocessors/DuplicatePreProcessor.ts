
// Dependencies
import { DataPoint, TimeSeries } from '../../util/Types';

interface DuplicateParams
{
	from: string;
	to: string;
}

/**
 * Duplicates a series
 */
export default class DuplicatePreProcessor
{
	public static async run(series: TimeSeries[], params: unknown): Promise<TimeSeries[]>
	{
		const duplicateParams = params as DuplicateParams;
		const found = series.find(s => s.name == duplicateParams.from);
		if (!found)
			throw new Error(`Series not found to duplicate: ${duplicateParams.from}`);
		const newSeries: TimeSeries = DuplicatePreProcessor.duplicateTimeSeries(
			found,
			duplicateParams.to);
		return [...series, newSeries];
	}

	private static duplicateTimeSeries(series: TimeSeries, name: string): TimeSeries
	{
		return {
			...series,
			data: DuplicatePreProcessor.duplicateDataPoints(series.data),
			name: name
		};
	}

	private static duplicateDataPoints(points: DataPoint[]): DataPoint[]
	{
		return points.map(p => DuplicatePreProcessor.duplicateDataPoint(p));
	}

	private static duplicateDataPoint(point: DataPoint): DataPoint
	{
		return {
			...point,
			band: point.band ? { ...point.band } : undefined
		};
	}
}
