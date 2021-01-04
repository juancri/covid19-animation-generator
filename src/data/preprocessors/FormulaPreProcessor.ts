import { TimeSeries } from '../../util/Types';
import Substract from './operations/Substract';

type operator = (operands: number[]) => number;

interface FormulaParameters
{
	operation: string;
	operands: string[];
	name: string
}

const OPERATORS: { [key: string]: operator } = {
	substract: Substract.run
};

/**
 * Filter out specific series by name
 */
export default class FormulaPreProcessor
{
	public static async run(series: TimeSeries[], params: unknown): Promise<TimeSeries[]>
	{
		const formulaParams = params as FormulaParameters;
		const operatorRunner = OPERATORS[formulaParams.operation];
		if (!operatorRunner)
			throw new Error(`Operation not found: ${formulaParams.operation}`);
		const operandSeries = formulaParams.operands.map(o =>
		{
			const found = series.find(s => s.name === o);
			if (!found)
				throw new Error(`Operand not found: ${o}`);
			return found;
		});
		const dates = operandSeries[0].data.map(p => p.date);
		const data = dates.map(date => {
			const operands = operandSeries.map(s =>
			{
				const foundPoint = s.data.find(p => +p.date === +date);
				return foundPoint?.value || 0;
			});
			const value = operatorRunner(operands);
			return { date, value };
		});
		const newSeries: TimeSeries = {
			name: formulaParams.name,
			data
		};

		return [...series, newSeries];
	}
}
