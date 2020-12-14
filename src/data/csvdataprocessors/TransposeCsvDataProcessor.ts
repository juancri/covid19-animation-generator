
export default class TransposeCsvDataProcessor
{
	public static run(data: unknown[]): unknown[]
	{
		if (!data.length)
			return data;
		const firstRow = data[0];
		if (typeof firstRow !== 'object')
			throw new Error(`First row should be an object but it is a ${typeof firstRow}`);
		if (!firstRow)
			throw new Error('First row should not be null');
		const keys = Object.keys(firstRow);
		const mainKey = keys[0];
		const seriesNames = keys.filter(k => k !== mainKey);
		return seriesNames.map(seriesName => {
			const o = { [mainKey]: seriesName };
			for (const row of data)
			{
				const columnName: string = (row as { [key: string]: unknown })[mainKey] as string;
				o[columnName] = (row as { [key: string]: unknown })[seriesName] as string;
			}
			return o;
		});
	}
}
