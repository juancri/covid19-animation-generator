
export default class Divide
{
	public static run(operands: number[]): number
	{
		if (operands.length !== 2)
			throw new Error(`Expected 2 operands, found ${operands.length}`);
		const o1 = operands[0];
		const o2 = operands[1];
		return o1 / o2;
	}
}
