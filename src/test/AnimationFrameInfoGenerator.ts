// Dependencies
import * as Code from '@hapi/code';
import * as Lab from '@hapi/lab';
import { DateTime } from 'luxon';
import AnimationFrameInfoGenerator from '../drawing/AnimationFrameInfoGenerator';

// Constants
const expect = Code.expect;
const lab = Lab.script ();

const plotSeries1 = [{
	code: 'test',
	color: 'white',
	points: [
		{ date: DateTime.fromISO('2020-01-01'), x: 10, y: 100 }
	]
}];
const plotSeries2 = [{
	code: 'test',
	color: 'white',
	points: [
		{ date: DateTime.fromISO('2020-01-01'), x: 10, y: 100 },
		{ date: DateTime.fromISO('2020-01-02'), x: 20, y: 200 }
	]
}];

lab.experiment('AnimationFrameInfoGenerator', () =>
{
	lab.test('single day with 0 limit', async () =>
	{
		const generator = new AnimationFrameInfoGenerator(plotSeries1, 10, 5, 0);
		const result = Array.from(generator.generate());
		expect(result.length).equals(6);
	});

	lab.test('single day with 1 limit', async () =>
	{
		const generator = new AnimationFrameInfoGenerator(plotSeries1, 10, 5, 1);
		const result = Array.from(generator.generate());
		expect(result.length).equals(6);
	});

	lab.test('single day with 5 limit', async () =>
	{
		const generator = new AnimationFrameInfoGenerator(plotSeries1, 10, 5, 5);
		const result = Array.from(generator.generate());
		expect(result.length).equals(6);
	});

	lab.test('two days with 0 limit', async () =>
	{
		const generator = new AnimationFrameInfoGenerator(plotSeries2, 10, 5, 5);
		const result = Array.from(generator.generate());
		expect(result.length).equals(16);
	});

	lab.test('two days with 1 limit', async () =>
	{
		const generator = new AnimationFrameInfoGenerator(plotSeries2, 10, 5, 1);
		const result = Array.from(generator.generate());
		expect(result.length).equals(6);
	});

	lab.test('two days with 2 limit', async () =>
	{
		const generator = new AnimationFrameInfoGenerator(plotSeries2, 10, 5, 2);
		const result = Array.from(generator.generate());
		expect(result.length).equals(16);
	});

	lab.test('two days with 5 limit', async () =>
	{
		const generator = new AnimationFrameInfoGenerator(plotSeries2, 10, 5, 5);
		const result = Array.from(generator.generate());
		expect(result.length).equals(16);
	});
});

// Export
export { lab };
