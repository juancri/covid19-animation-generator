
// Dependencies
import * as Code from '@hapi/code';
import * as Lab from '@hapi/lab';
import { DateTime } from 'luxon';
import ScaledPointsGenerator from '../drawing/ScaledPointsGenerator';
import ScaleGenerator from '../drawing/ScaleGenerator';
import DataFrameFilter from '../drawing/DataFrameFilter';

// Constants
const expect = Code.expect;
const lab = Lab.script();

lab.experiment('ScaledPointsGenerator', () =>
{
	lab.test('scale', async () =>
	{
		const date = DateTime.fromISO('2020-01-01');
		const filter = new DataFrameFilter([{
			code: 'CL',
			color: 'white',
			points: [
				{
					date: DateTime.fromISO('2020-01-01'),
					x: 1,
					y: 1
				},
				{
					date: DateTime.fromISO('2020-01-02'),
					x: 10,
					y: 10
				}
			]
		}]);
		const scaleGenerator = new ScaleGenerator(filter);
		const generator = new ScaledPointsGenerator(scaleGenerator);
		const result = generator.generate({
			date,
			x: 5,
			y: 5
		});
		expect(+result.date).equals(+date);
		expect(result.x).equals(0.8);
		expect(result.y).equals(0.8);
	});
});

// Export
export { lab };
