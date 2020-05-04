
// Dependencies
import axios from 'axios';
import * as csv from 'csvtojson';
import * as Enumerable from 'linq';
import { DateTime } from 'luxon';

// Local
import { DataSource, TimeSeries } from '../util/Types';
import ChileComunasPreprocessor from './ChileComunasPreprocessor';

// Constants
const DATE_REGEXP = /^\d+\/\d+\/\d+$/;
const PRE_PROCESSORS: { [key: string]: (input: any[]) => any[] } = {
	'chile-comunas': ChileComunasPreprocessor.process
};

export default class DataLoader
{
	public static async load(dataSource: DataSource): Promise<TimeSeries[]>
	{
		const response = await axios({
			method: 'get',
			url: dataSource.url,
			responseType: 'stream'
		});
		let csvData = await csv().fromStream(response.data);
		if (dataSource.preProcessor)
		{
			const preProcessor = PRE_PROCESSORS[dataSource.preProcessor];
			if (!preProcessor)
				throw new Error(`Pre-processor not found: ${dataSource.preProcessor}`);
			csvData = preProcessor(csvData);
		}
		const data = csvData.map(item => ({
			name: item[dataSource.nameColumn],
			data: Object
				.keys(item)
				.map(k => DATE_REGEXP.exec(k))
				.filter(match => match)
				.map(match => ({
					date: DateTime.fromString(match![0], 'L/d/yy'),
					value: parseInt(item[match![0]], 0)
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
						value: group2.sum(x => x.value)
					}))
					.orderBy(x => x.date)
					.toArray()

			}))
			.toArray();
	}
}
