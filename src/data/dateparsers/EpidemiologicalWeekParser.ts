
import { DateParser } from '@/util/Types';
import { DateTime } from 'luxon';

const OPTS = { zone: 'UTC' };
const BASE_DATE = DateTime.fromISO('2021-01-01', OPTS);

export default class EpidemiologicalWeekParser implements DateParser
{
	public parse(text: string): DateTime | null
	{
		const week = parseInt(text);
		return BASE_DATE.plus({ weeks: week - 1 });
	}
}
