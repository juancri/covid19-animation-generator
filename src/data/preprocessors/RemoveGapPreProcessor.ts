
import * as Enumerable from 'linq';

import Gaps from '../../util/Gaps';
import { DataPoint, GapConfiguration, TimeGap, TimeSeries } from '../../util/Types';

export default class RemoveGapPreProcessor
{
	public static async run(series: TimeSeries[], params: unknown): Promise<TimeSeries[]>
	{
		const gapConfig = params as GapConfiguration;
		const gap = Gaps.parseGap(gapConfig);
		return series.map(s => RemoveGapPreProcessor.removeGapSeries(s, gap));
	}

	private static removeGapSeries(series: TimeSeries, gap: TimeGap): TimeSeries
	{
		return {
			...series,
			data: RemoveGapPreProcessor.filterPoints(series.data, gap)
		};
	}

	private static filterPoints(points: DataPoint[], gap: TimeGap): DataPoint[]
	{
		return Enumerable
			.from(points)
			.where(p =>
				+p.date < +gap.from ||
				+p.date > +gap.to)
			.toArray();
	}
}
