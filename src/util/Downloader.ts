import axios from 'axios';
import * as csv from 'csvtojson';
import { Converter } from 'csvtojson/v2/Converter';

export default class Downloader
{
	public static async download(url: string): Promise<Converter>
	{
		const response = await axios({
			url,
			method: 'get',
			responseType: 'stream'
		});
		return await csv().fromStream(response.data);
	}
}
