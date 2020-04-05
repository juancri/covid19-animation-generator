
// Dependencies
import * as Code from '@hapi/code';
import * as Lab from '@hapi/lab';
import { DateTime } from 'luxon';
import ScaledPointsGenerator from '../drawing/ScaledPointsGenerator';

// Constants
const expect = Code.expect;
const lab = Lab.script();

lab.experiment('ScaledPointsGenerator', () =>
{
	lab.test('scale', async () =>
	{
		const date = DateTime.fromISO('2020-01-01');
		const scale = {
			horizontal: { min: 0, max: 10 },
			vertical: { min: 0, max: 10 }
		};
		const generator = new ScaledPointsGenerator(scale);
		const result = generator.generate({
			date,
			x: 5,
			y: 5
		});
		expect(+result.date).equals(+date);
		expect(result.x).equals(0.5);
		expect(result.y).equals(0.5);
	});
});

// Export
export { lab };
