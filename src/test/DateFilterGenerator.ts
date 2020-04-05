// Dependencies
import * as Code from '@hapi/code';
import * as Lab from '@hapi/lab';
import { DataPoint } from '../util/Types';
import { DateTime } from 'luxon';
import DateFilterGenerator from '../drawing/DateFilterGenerator';

// Constants
const expect = Code.expect;
const lab = Lab.script ();

lab.experiment('DateFilterGenerator', () =>
{
	lab.test('all days', async () =>
	{
		const points = [
			{ date: DateTime.fromISO('2020-01-01'), value: 10 },
			{ date: DateTime.fromISO('2020-01-02'), value: 20 },
			{ date: DateTime.fromISO('2020-01-03'), value: 30 }
		];
		const generator = new DateFilterGenerator(0);
		const result = generator.generate(points);
		expect(result).equals(points);
	});

	lab.test('empty array', async () =>
	{
		const points: DataPoint[] = [];
		const generator = new DateFilterGenerator(0);
		const result = generator.generate(points);
		expect(result.length).equals(0);
	});

	lab.test('filter out', async () =>
	{
		const points = [
			{ date: DateTime.fromISO('2020-01-01'), value: 10 },
			{ date: DateTime.fromISO('2020-01-02'), value: 20 },
			{ date: DateTime.fromISO('2020-01-03'), value: 30 }
		];
		const generator = new DateFilterGenerator(1);
		const result = generator.generate(points);
		expect(result.length).equals(1);
		expect(result[0]).equals(points[2]);
	});

	lab.test('filter out 2', async () =>
	{
		const points = [
			{ date: DateTime.fromISO('2020-01-01'), value: 10 },
			{ date: DateTime.fromISO('2020-01-02'), value: 20 },
			{ date: DateTime.fromISO('2020-01-03'), value: 30 }
		];
		const generator = new DateFilterGenerator(2);
		const result = generator.generate(points);
		expect(result.length).equals(2);
		expect(result[0]).equals(points[1]);
		expect(result[1]).equals(points[2]);
	});
});

// Export
export { lab };
