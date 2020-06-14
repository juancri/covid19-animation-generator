import { Options, Line } from './Types';

export default class LinesLoader
{
	public static load(options: Options)
	{
		return {
			horizontal: LinesLoader.loadOption(options.horizontalLines),
			vertical: LinesLoader.loadOption(options.verticalLines),
		};
	}

	public static loadOption(op: string | null): Line[]
	{
		if (!op)
			return [];
		return op
			.split(',')
			.map(l =>
			{
				const [value, label] = l.split(':');
				return {
					value: parseFloat(value),
					label
				};
			});
	}
}
