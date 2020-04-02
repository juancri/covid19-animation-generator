
// Dependencies
import axios from 'axios';
import * as csv from 'csvtojson';
import * as Enumerable from 'linq';
import { DateTime } from 'luxon';

// Local
import { DataSource, SeriesData } from './Types';

// Constants
const DATE_REGEXP = /^\d+\/\d+\/\d+$/;

export default class DataLoader
{
	public static async load(dataSource: DataSource): Promise<SeriesData[]>
	{
		const response = await axios({
			method: 'get',
			url: dataSource.url,
			responseType: 'stream'
		});
		const csvData = await csv().fromStream(response.data);
		const data = csvData.map(item => ({
			name: item[dataSource.nameColumn],
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
			.groupBy(x => x.name)
			.select(group => ({
				name: group.key(),
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
