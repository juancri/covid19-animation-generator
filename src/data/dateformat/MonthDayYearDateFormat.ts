import { DateTime } from 'luxon';
import { DateFormat } from '../../util/Types';

const DATE_FORMAT = 'L/d/yy';
const DATE_REGEXP = /^\d+\/\d+\/\d+$/;
const OPTS = { zone: 'UTC' };

class MonthDayYearDateFormat implements DateFormat
{
	public getRegularExpression(): RegExp
	{
		return DATE_REGEXP;
	}

	public parse(text: string): DateTime
	{
		return DateTime.fromFormat(text, DATE_FORMAT, OPTS);
	}
}

export default new MonthDayYearDateFormat();
