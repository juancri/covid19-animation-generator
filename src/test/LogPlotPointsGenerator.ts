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
		const result = LogScaleProvider.generate(source);
		expect(result.length).equals(0);
	});

	lab.test('two items', async () =>
	{
		const source: DataPoint[] = [
			{ date: DateTime.fromISO('2020-01-01'), value: 10 },
			{ date: DateTime.fromISO('2020-01-02'), value: 100 }
		];
		const result = LogScaleProvider.generate(source);
		expect(result.length).equals(1);
		expect(result[0].x).equals(Math.log10(100));
		expect(result[0].y).equals(Math.log10(100 - 10));
	});

	lab.test('eight items', async () =>
	{
		const source: DataPoint[] = [
			{ date: DateTime.fromISO('2020-01-01'), value: 1 },
			{ date: DateTime.fromISO('2020-01-02'), value: 2 },
			{ date: DateTime.fromISO('2020-01-03'), value: 3 },
			{ date: DateTime.fromISO('2020-01-04'), value: 4 },
			{ date: DateTime.fromISO('2020-01-05'), value: 5 },
			{ date: DateTime.fromISO('2020-01-06'), value: 6 },
			{ date: DateTime.fromISO('2020-01-07'), value: 7 },
			{ date: DateTime.fromISO('2020-01-08'), value: 8 }
		];
		const result = LogScaleProvider.generate(source);
		expect(result.length).equals(7);
		expect(result[6].y).equals(Math.log10(8 - 1));
	});

	lab.test('ten items', async () =>
	{
		const source: DataPoint[] = [
			{ date: DateTime.fromISO('2020-01-01'), value: 1 },
			{ date: DateTime.fromISO('2020-01-02'), value: 2 },
			{ date: DateTime.fromISO('2020-01-03'), value: 3 },
			{ date: DateTime.fromISO('2020-01-04'), value: 4 },
			{ date: DateTime.fromISO('2020-01-05'), value: 5 },
			{ date: DateTime.fromISO('2020-01-06'), value: 6 },
			{ date: DateTime.fromISO('2020-01-07'), value: 7 },
			{ date: DateTime.fromISO('2020-01-08'), value: 10 },
			{ date: DateTime.fromISO('2020-01-09'), value: 20 },
			{ date: DateTime.fromISO('2020-01-10'), value: 30 }
		];
		const result = LogScaleProvider.generate(source);
		expect(result.length).equals(9);
		expect(result[6].y).equals(Math.log10(10 - 1));
		expect(result[7].y).equals(Math.log10(20 - 2));
		expect(result[8].y).equals(Math.log10(30 - 3));
	});
});

// Export
export { lab };
