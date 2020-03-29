
// Dependencies
import * as csv from 'csvtojson';
import * as Enumerable from 'linq';
import { DateTime } from 'luxon';

// Local
import { CountryData } from './Types';

// Constants
const COUNTRY_NAME_COLUMN = 'Country/Region';
const DATE_REGEXP = /^\d+\/\d+\/\d+$/;

export default class DataLoader
{
	public static async load(filePath: string): Promise<CountryData[]>
	{
		const csvData = await csv().fromFile(filePath);
		const data = csvData.map(item => ({
			country: item[COUNTRY_NAME_COLUMN],
			data: Object
				.keys(item)
				.map(k => DATE_REGEXP.exec(k))
				.filter(match => match)
				.map(match => ({
					date: DateTime.fromString(match![0], 'L/d/yy'),
					cases: parseInt(item[match![0]], 0)
				}))
		}));

		return Enumerable
			.from(data)
			.groupBy(x => x.country)
			.select(group => ({
				country: group.key(),
				data: group
					.selectMany(x => x.data)
					.groupBy(x => (+x.date))
					.select(group2 => ({
						date: group2.first().date,
						cases: group2.sum(x => x.cases)
					}))
					.orderBy(x => x.date)
					.toArray()

			}))
			.toArray();
	}
}
