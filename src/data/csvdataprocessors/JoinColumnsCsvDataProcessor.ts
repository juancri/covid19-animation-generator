
type CsvObject = { [key: string]: string | number };

interface JoinColumnsParams
{
	name: string;
	columns: string[];
}

export default class JoinColumnsCsvDataProcessor
{
	public static run(data: unknown[], unknownParams: unknown): unknown[]
	{
		// Check data
		const objects = data as CsvObject[];
		if (!objects.length)
			return data;

		// Check parameters
		const params = unknownParams as JoinColumnsParams;
		if (params.columns.length < 2)
			throw new Error(`You must specify at least 2 columns to join`);
		const keys = Object.keys(objects[0]);
		params.columns.forEach(col =>
		{
			if (!keys.includes(col))
				throw new Error(`Column not found: ${col}`);
		});

		// Perform join
		return objects.map(item => {
			const value = params.columns
				.map(col => item[col])
				.join(' ');
			return { ...item, [params.name]: value };
		});
	}
}
