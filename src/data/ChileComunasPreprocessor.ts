
import * as Enumerable from 'linq';
import { DateTime } from 'luxon';

const COMUNA_PROPERTY = 'comuna';
const DATE_PROPERTY = 'fecha';
const VALUE_PROPERTY = 'positivos_acumulados';
const DATE_FORMAT = 'L/d/yy';
const COMUNA_COLUMN = 'comuna';

export default class ChileComunasPreprocessor
{
	public static process(input: any[])
	{
		// Convert dates
		for (const x of input)
			x[DATE_PROPERTY] = DateTime.fromFormat(x[DATE_PROPERTY], DATE_FORMAT);

		// Get all comunas and dates
		const comunas = Enumerable
			.from(input)
			.select(x => x[COMUNA_PROPERTY])
			.distinct()
			.toArray();
		const dates = Enumerable
			.from(input)
			.select(x => x.fecha.toSeconds());
		const firstDate = DateTime.fromSeconds(dates.min());
		const lastDate = DateTime.fromSeconds(dates.max());

		return comunas.map(comuna => {
			const o: any = { [COMUNA_COLUMN]: comuna };
			let currentDate = firstDate;
			while (currentDate <= lastDate)
			{
				let val = Enumerable
					.from(input)
					.where(x => x[COMUNA_PROPERTY] === comuna)
					.where(x => +x[DATE_PROPERTY] === +currentDate)
					.select(x => x[VALUE_PROPERTY])
					.firstOrDefault();
				if (val === null)
					val = ChileComunasPreprocessor.infereValue(
						input, comuna, currentDate, firstDate);
				o[currentDate.toFormat(DATE_FORMAT)] = val;
				currentDate = currentDate.plus({ days: 1 });
			}
			return o;
		});
	}

	private static infereValue(input: any[], comuna: string,
		date: DateTime, firstDate: DateTime)
	{
		const previous = Enumerable
			.from(input)
			.where(x => x[COMUNA_PROPERTY] === comuna)
			.where(x => x[DATE_PROPERTY] < date)
			.orderBy(x => +x[DATE_PROPERTY])
			.lastOrDefault({ [DATE_PROPERTY]: firstDate, [VALUE_PROPERTY]: 0 });
		const next = Enumerable
			.from(input)
			.where(x => x.comuna === comuna)
			.where(x => x.fecha > date)
			.orderBy(x => +x.fecha)
			.select(x => x.positivos_acumulados)
			.firstOrDefault(previous);
		if (previous[VALUE_PROPERTY] === next[VALUE_PROPERTY])
			return previous[VALUE_PROPERTY];

		const base = previous[VALUE_PROPERTY];
		const diff = next[VALUE_PROPERTY] - base;
		const ratio = ((+date) - (+previous[DATE_PROPERTY])) / ((+next[DATE_PROPERTY]) - (+previous[DATE_PROPERTY]));
		return base + diff * ratio;
	}
}
