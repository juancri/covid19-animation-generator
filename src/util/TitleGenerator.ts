import Handlebars from 'handlebars';
import { DataSource } from './Types';
import { DateTime } from 'luxon';

export default class TitleGenerator
{
	public static generate(dataSource: DataSource, source: string): string
	{
		const template = Handlebars.compile(source);
		const data = {
			title: dataSource.title,
			date: DateTime.local().toFormat('dd/LL/yyyy')
		};
		return template(data);
	}
}
