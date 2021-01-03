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
		const renameParams = params as RenameParameters;
		series.forEach(s => {
			if (renameParams.from === s.name)
				s.name = renameParams.to;
		});
		return series;
	}
}
