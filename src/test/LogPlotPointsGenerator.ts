// Dependencies
import * as Code from '@hapi/code';
import * as Lab from '@hapi/lab';
import LogScaleProvider from '../scale/plotpoints/LogPlotPointsGenerator';
import { DataPoint } from '../util/Types';
import { DateTime } from 'luxon';

// Constants
const expect = Code.expect;
const lab = Lab.script ();

lab.experiment('LogPlotPointsGenerator', () =>
{
	lab.test('empty array', async () =>
	{
		const source: DataPoint[] = [];
		const result = LogScaleProvider.generate(source, []);
		expect(result.length).equals(0);
	});

	lab.test('eight items', async () =>
	{
		const opts = { zone: 'UTC' };
		const source: DataPoint[] = [
			{ date: DateTime.fromISO('2020-01-01', opts), value: 1 },
			{ date: DateTime.fromISO('2020-01-02', opts), value: 2 },
			{ date: DateTime.fromISO('2020-01-03', opts), value: 3 },
			{ date: DateTime.fromISO('2020-01-04', opts), value: 4 },
			{ date: DateTime.fromISO('2020-01-05', opts), value: 5 },
			{ date: DateTime.fromISO('2020-01-06', opts), value: 6 },
			{ date: DateTime.fromISO('2020-01-07', opts), value: 7 },
			{ date: DateTime.fromISO('2020-01-08', opts), value: 8 }
		];
		const result = LogScaleProvider.generate(source, []);
		expect(result.length).equals(7);
		expect(result[6].y).equals(Math.log10(8 - 1));
	});

	lab.test('ten items', async () =>
	{
		const opts = { zone: 'UTC' };
		const source: DataPoint[] = [
			{ date: DateTime.fromISO('2020-01-01', opts), value: 1 },
			{ date: DateTime.fromISO('2020-01-02', opts), value: 2 },
			{ date: DateTime.fromISO('2020-01-03', opts), value: 3 },
			{ date: DateTime.fromISO('2020-01-04', opts), value: 4 },
			{ date: DateTime.fromISO('2020-01-05', opts), value: 5 },
			{ date: DateTime.fromISO('2020-01-06', opts), value: 6 },
			{ date: DateTime.fromISO('2020-01-07', opts), value: 7 },
			{ date: DateTime.fromISO('2020-01-08', opts), value: 10 },
			{ date: DateTime.fromISO('2020-01-09', opts), value: 20 },
			{ date: DateTime.fromISO('2020-01-10', opts), value: 30 }
		];
		const result = LogScaleProvider.generate(source, []);
		expect(result.length).equals(9);
		expect(result[6].y).equals(Math.log10(10 - 1));
		expect(result[7].y).equals(Math.log10(20 - 2));
		expect(result[8].y).equals(Math.log10(30 - 3));
	});
});

// Export
export { lab };
