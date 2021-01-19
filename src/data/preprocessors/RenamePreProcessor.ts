import { TimeSeries } from '../../util/Types';

interface RenameParameters
{
	from: string;
	to: string;
}

export default class RenamePreProcessor
{
	public static async run(series: TimeSeries[], params: unknown): Promise<TimeSeries[]>
	{
		const renameParams = RenamePreProcessor.getParams(params);
		series.forEach(s => {
			const found = renameParams.find(x => x.from === s.name);
			if (found)
				s.name = found.to;
		});
		return series;
	}

	private static getParams(unknownParams: unknown): RenameParameters[]
	{
		const params = unknownParams as RenameParameters | RenameParameters[];
		return Array.isArray(params) ?
			params :
			[params];
	}
}
