import logger from '../../util/Logger';

export default class TransposeCsvDataProcessor
{
	public static run(data: any[]): any[]
	{
		if (!data.length)
			return data;
		const firstRow = data[0];
		const keys = Object.keys(firstRow);
		const mainKey = keys[0];
		const seriesNames = keys.filter(k => k !== mainKey);
		return seriesNames.map(seriesName => {
			const o: any = { [mainKey]: seriesName };
			for (const row of data)
			{
				const columnName = row[mainKey];
				o[columnName] = row[seriesName];
			}
			return o;
		});
	}
}
