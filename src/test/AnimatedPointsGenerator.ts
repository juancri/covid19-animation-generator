// Dependencies
import * as Code from '@hapi/code';
import * as Lab from '@hapi/lab';
import { DateTime } from 'luxon';
import AnimatedPointsGenerator from '../drawing/AnimatedPointsGenerator';

// Constants
const expect = Code.expect;
const lab = Lab.script ();

lab.test('empty array', async () =>
{
	const generator = new AnimatedPointsGenerator(10);
	const result = Array.from(generator.generate([]));
	expect(result.length).equals(0);
});

lab.test('one item', async () =>
{
	const date = DateTime.fromISO('2020-01-01');
	const generator = new AnimatedPointsGenerator(2);
	const result = Array.from(generator.generate([
		{ date, x: 10, y: 100 }
	]));
	expect(result.length, 'length').equals(3);
	expect(+result[0].date, 'first date').equals(+date);
	expect(result[0].x, 'first x').equals(0);
	expect(result[0].y, 'first y').equals(0);
	expect(+result[1].date, 'second date').equals(+date);
	expect(result[1].x, 'second x').equals(5);
	expect(result[1].y, 'second y').equals(50);
	expect(+result[2].date, 'third date').equals(+date);
	expect(result[2].x, 'third x').equals(10);
	expect(result[2].y, 'third y').equals(100);
});

lab.test('two items', async () =>
{
	const date = DateTime.fromISO('2020-01-01');
	const date2 = date.plus ({ days: 1 });
	const generator = new AnimatedPointsGenerator(2);
	const result = Array.from(generator.generate([
		{ date, x: 10, y: 100 },
		{ date: date2, x: 20, y: 200 }
	]));
	expect(result.length, 'length').equals(5);
	expect(+result[0].date, 'first date').equals(+date);
	expect(result[0].x, 'first x').equals(0);
	expect(result[0].y, 'first y').equals(0);
	expect(+result[1].date, 'second date').equals(+date);
	expect(result[1].x, 'second x').equals(5);
	expect(result[1].y, 'second y').equals(50);
	expect(+result[2].date, 'third date').equals(+date);
	expect(result[2].x, 'third x').equals(10);
	expect(result[2].y, 'third y').equals(100);
	expect(+result[3].date, '4th date').equals(+date2);
	expect(result[3].x, '4th x').equals(15);
	expect(result[3].y, '4th y').equals(150);
	expect(+result[4].date, '4th date').equals(+date2);
	expect(result[4].x, '5th x').equals(20);
	expect(result[4].y, '5th y').equals(200);
});

lab.test('one frame', async () =>
{
	const date = DateTime.fromISO('2020-01-01');
	const date2 = date.plus ({ days: 1 });
	const generator = new AnimatedPointsGenerator(1);
	const result = Array.from(generator.generate([
		{ date, x: 10, y: 100 },
		{ date: date2, x: 20, y: 200 }
	]));
	expect(result.length, 'length').equals(3);
	expect(+result[0].date, 'first date').equals(+date);
	expect(result[0].x, 'first x').equals(0);
	expect(result[0].y, 'first y').equals(0);
	expect(+result[1].date, 'second date').equals(+date);
	expect(result[1].x, 'second x').equals(10);
	expect(result[1].y, 'second y').equals(100);
	expect(+result[2].date, 'third date').equals(+date2);
	expect(result[2].x, 'third x').equals(20);
	expect(result[2].y, 'third y').equals(200);
});

// Export
export { lab };
