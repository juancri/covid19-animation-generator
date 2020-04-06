// Dependencies
import * as Code from '@hapi/code';
import * as Lab from '@hapi/lab';
import { DateTime } from 'luxon';
import DataFrameFilter from '../drawing/DataFrameFilter';

// Constants
const expect = Code.expect;
const lab = Lab.script ();

const plotSeries = [{
	code: 'test',
	color: 'white',
	points: [
		{ date: DateTime.fromISO('2020-01-01'), x: 10, y: 100 },
		{ date: DateTime.fromISO('2020-01-02'), x: 20, y: 200 },
		{ date: DateTime.fromISO('2020-01-03'), x: 30, y: 300 }
	]
}];
const frame1 = {
	date: DateTime.fromISO('2020-01-01'),
	ratio: 1
};
const frame2 = {
	date: DateTime.fromISO('2020-01-02'),
	ratio: 1
};
const frame2withRatio = {
	date: DateTime.fromISO('2020-01-02'),
	ratio: 0.5
};
const frame3 = {
	date: DateTime.fromISO('2020-01-03'),
	ratio: 1
};

lab.experiment('DateFilterGenerator', () =>
{
	lab.test('all days', async () =>
	{
		const generator = new DataFrameFilter(plotSeries);
		const result = generator.apply(frame3);
		expect(result).equals(plotSeries);
	});

	lab.test('empty array', async () =>
	{
		const generator = new DataFrameFilter([]);
		const result = generator.apply(frame3);
		expect(result.length).equals(0);
	});

	lab.test('filter out', async () =>
	{
		const generator = new DataFrameFilter(plotSeries);
		const result = generator.apply(frame2);
		expect(result.length).equals(1);
		expect(result[0].points.length).equals(2);
		expect(result[0].points[0]).equals(plotSeries[0].points[0]);
		expect(result[0].points[1]).equals(plotSeries[0].points[1]);
	});

	lab.test('filter out with ratio', async () =>
	{
		const generator = new DataFrameFilter(plotSeries);
		const result = generator.apply(frame2withRatio);
		expect(result.length).equals(1);
		expect(result[0].points.length).equals(2);
		expect(result[0].points[0]).equals(plotSeries[0].points[0]);
		expect(result[0].points[1].date).equals(plotSeries[0].points[1].date);
		expect(result[0].points[1].x).equals(15);
		expect(result[0].points[1].y).equals(150);
	});

	lab.test('filter out 2', async () =>
	{
		const generator = new DataFrameFilter(plotSeries);
		const result = generator.apply(frame1);
		expect(result.length).equals(1);
		expect(result[0].points.length).equals(1);
		expect(result[0].points[0]).equals(plotSeries[0].points[0]);
	});
});

// Export
export { lab };
