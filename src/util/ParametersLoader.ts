
import * as optimist from 'optimist';

const PARAMETERS = {
	help: 'This help message',
	source: 'Sets the data source',
	schema: 'Sets the graph schema',
	days: 'Number of days for which the animation will be generated',
	frames: 'Number of frames per day',
	extraFrames: 'Number of extra frames for the last image'
};
const argv = optimist.argv;

export default class ParametersLoader
{
	public static help()
	{
		if (!argv.help)
			return false;

		console.log('Optional parameters:');
		for (const name of Object.keys(PARAMETERS))
			// @ts-ignore
			console.log(`  --${name}: ${PARAMETERS[name]}`);

		return true;
	}

	public static load(defaults: any)
	{
		const options: any = {};
		for (const name of Object.keys(PARAMETERS))
			options[name] = argv[name] || defaults[name];
		return options;
	}
}
