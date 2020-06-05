
import * as jsonfile from 'jsonfile';
import * as path from 'path';
import { merge } from 'merge-anything';

import { Configuration } from '../util/Types';

const CONFIG_FILE_PATH = path.join(__dirname, '../../config.json');

export default class ConfigLoader
{
	public static async load(): Promise<Configuration>
	{
		return new Promise ((resolve, error) =>
			jsonfile.readFile (CONFIG_FILE_PATH, (err, data) =>
				err ? error(err) : resolve(data)));
	}

	public static applyOverride(config: Configuration, override: string): Configuration
	{
		const overrideObject = JSON.parse(override);
		return merge(config, overrideObject);
	}
}
