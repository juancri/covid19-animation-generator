
import * as Enumerable from 'linq';

import { TimeSeries } from '../../util/Types';

export default class RateJoiner
{
	public static join (series1: TimeSeries[], series2: TimeSeries[]): TimeSeries[]
	{
		return Enumerable
			.from(series1)
			.select(serie1 => ({
				serie1,
				serie2: series2.find(serie2 => serie2.name === serie1.name)
			}))
			.where(tuple => !!tuple.serie2)
			.select(tuple => ({
				name: tuple.serie1.name,
				data: Enumerable
					.from(tuple.serie1.data)
					.select(dataPoint => ({
						point1: dataPoint,
						point2: tuple.serie2?.data.find(
							dataPoint2 => +dataPoint2.date === +dataPoint.date)
					}))
					.where(dataTuple => !!dataTuple.point2)
					.select(dataTuple => ({
						date: dataTuple.point1.date,
						value: dataTuple.point1.value / (dataTuple.point2?.value || 1) * 100
					}))
					.toArray()
			}))
			.toArray();
	}
}
