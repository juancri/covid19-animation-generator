
import * as Enumerable from 'linq';

import { TimeSeries } from '../../util/Types';
import Multiply from './operations/Multiply';
import Subtract from './operations/Subtract';

type operator = (operands: number[]) => number;

interface FormulaParameters
{
	operation: string;
	operands: (string | number)[];
	name: string
}

const OPERATORS: { [key: string]: operator } = {
	multiply: Multiply.run,
	subtract: Subtract.run
};

/**
 * Filter out specific series by name
 */
export default class FormulaPreProcessor
{
	public static async run(series: TimeSeries[], uParams: unknown): Promise<TimeSeries[]>
	{
		// Get parameters
		const params = uParams as FormulaParameters;

		// Get runner
		const operatorRunner = OPERATORS[params.operation];
		if (!operatorRunner)
			throw new Error(`Operation not found: ${params.operation}`);

		// Get operands
		const operandSeries = params.operands.map(o =>
		{
			if (typeof o === 'number')
				return o as number;
			const found = series.find(s => s.name === o);
			if (!found)
				throw new Error(`Operand not found: ${o}`);
			return found;
		});
		const dates = FormulaPreProcessor.getDates(series, operandSeries);
		const data = dates.map(date => {
			const operands = operandSeries.map(s =>
			{
				if (typeof s === 'number')
					return s;
				const foundPoint = s.data.find(p => +p.date === +date);
				return foundPoint?.value || 0;
			});
			const value = operatorRunner(operands);
			return { date, value };
		});
		const newSeries: TimeSeries = {
			name: params.name,
			data
		};

		return [...series, newSeries];
	}

	private static getDates(allSeries: TimeSeries[], operandSeries: (number | TimeSeries)[])
	{
		const filteredSeries = operandSeries
			.filter(o => typeof o !== 'number') as TimeSeries[];
		const series = filteredSeries.length > 0 ?
			filteredSeries :
			allSeries;
		return Enumerable
			.from(series)
			.selectMany(s => s.data)
			.select(p => p.date)
			.distinct(date => +date)
			.orderBy(date => +date)
			.toArray();
	}
}
