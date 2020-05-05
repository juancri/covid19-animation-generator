import axios from 'axios';
import * as csv from 'csvtojson';

export default class Downloader
{
	public static async download(url: string)
	{
		const response = await axios({
			url,
			method: 'get',
			responseType: 'stream'
		});
		return await csv().fromStream(response.data);
	}
}
