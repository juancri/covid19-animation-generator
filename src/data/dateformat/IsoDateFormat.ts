import { DateTime } from 'luxon';
import { DateFormat } from '../../util/Types';

const DATE_FORMAT = 'yyyy-MM-dd';
const DATE_REGEXP = /^\d+\-\d+\-\d+$/;

class IsoDateFormat implements DateFormat
{
	public getRegularExpression(): RegExp
	{
		return DATE_REGEXP;
	}

	public parse(text: string): DateTime
	{
		return DateTime.fromString(text, DATE_FORMAT);
	}
}

export default new IsoDateFormat();
