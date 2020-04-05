
// Dependencies
import * as Code from '@hapi/code';
import * as Lab from '@hapi/lab';
import { DateTime } from 'luxon';
import CanvasPointsGenerator from '../drawing/CanvasPointsGenerator';

// Constants
const expect = Code.expect;
const lab = Lab.script();

lab.test('scale middle', async () =>
{
	const date = DateTime.fromISO('2020-01-01');
	const area = {
		top: 100,
		bottom: 200,
		left: 300,
		right: 400
	};
	const generator = new CanvasPointsGenerator(area);
	const result = generator.generate({
		date,
		x: 0.5,
		y: 0.5
	});
	expect(+result.date).equals(+date);
	expect(result.x).equals(350);
	expect(result.y).equals(150);
});

lab.test('scale bottom', async () =>
{
	const date = DateTime.fromISO('2020-01-01');
	const area = {
		top: 100,
		bottom: 200,
		left: 300,
		right: 400
	};
	const generator = new CanvasPointsGenerator(area);
	const result = generator.generate({
		date,
		x: 0.5,
		y: 0
	});
	expect(+result.date).equals(+date);
	expect(result.x).equals(350);
	expect(result.y).equals(200);
});

lab.test('scale right', async () =>
{
	const date = DateTime.fromISO('2020-01-01');
	const area = {
		top: 100,
		bottom: 200,
		left: 300,
		right: 400
	};
	const generator = new CanvasPointsGenerator(area);
	const result = generator.generate({
		date,
		x: 1,
		y: 0.5
	});
	expect(+result.date).equals(+date);
	expect(result.x).equals(400);
	expect(result.y).equals(150);
});

// Export
export { lab };
