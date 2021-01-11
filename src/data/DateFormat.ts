
import { DateTime } from 'luxon';

const OPTS = { zone: 'UTC' };

export default class DateFormat
{
	private format: string;

	constructor(format: string)
	{
		this.format = format;
	}

	public parse(text: string): DateTime | null
	{
		const result =  DateTime.fromFormat(text, this.format, OPTS);
		return result.isValid ? result : null;
	}
}
