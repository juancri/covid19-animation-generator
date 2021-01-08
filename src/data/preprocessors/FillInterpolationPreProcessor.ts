
import * as Enumerable from 'linq';
import { DateTime } from 'luxon';
import { DataPoint, TimeSeries } from '../../util/Types';

const DAYS_1 = { days: 1 };
const START_DATE = DateTime.fromISO('2020-01-01', { zone: 'UTC' });

export default class FillInterpolationPreProcessor
{
	public static async run(series: TimeSeries[]): Promise<TimeSeries[]>
	{
		return series.map(s => FillInterpolationPreProcessor.fillSeries(s));
	}

	private static fillSeries(series: TimeSeries): TimeSeries
	{
		if (series.data.length < 2)
			return series;
		const dates = Enumerable
			.from(series.data)
			.select(p => p.date)
			.orderBy(d => +d);
		const firstDate = dates.first();
		const lastDate = dates.last();
		const points = FillInterpolationPreProcessor.getPoints(
			series.data, firstDate, lastDate);
		return { ...series, data: Array.from(points) };
	}

	private static *getPoints(points: DataPoint[], first: DateTime, last: DateTime): Generator<DataPoint>
	{
		let currentIndex = 0;
		for (let currentDate = first; +currentDate <= +last; currentDate = currentDate.plus(DAYS_1))
		{
			const currentPoint = points[currentIndex];

			// Current point matches
			// No need to interpolate
			if (+currentPoint.date === +currentDate)
			{
				yield currentPoint;
				continue;
			}

			const nextPoint = points[currentIndex + 1];

			// Next point matches
			// No need to interpolate
			if (+nextPoint.date === +currentDate) {
				yield nextPoint;
				currentIndex++;
				continue;
			}

			// Middleground
			// Need to interpolate

			// Dates
			const prevDateValue = currentPoint.date.diff(START_DATE).as('days');
			const nextDateValue = nextPoint.date.diff(START_DATE).as('days');
			const currentDateValue = currentDate.diff(START_DATE).as('days');
			const dateDiff = nextDateValue - prevDateValue;
			const ratio = (currentDateValue - prevDateValue) / dateDiff;

			// Value
			const prevValue = currentPoint.value;
			const nextValue = nextPoint.value;
			const valueDiff = nextValue - prevValue;
			const value = prevValue + (ratio * valueDiff);
			yield { date: currentDate, value };
		}
	}
}
