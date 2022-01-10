
import * as Enumerable from 'linq';

export default class Add
{
	public static run(operands: number[]): number
	{
		if (operands.length === 0)
			throw new Error(`Expected operands, found 0`);
		return Enumerable
			.from(operands)
			.sum();
	}
}
