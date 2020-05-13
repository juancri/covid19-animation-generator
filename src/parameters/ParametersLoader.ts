
import * as minimist from 'minimist';

const PARAMETERS = {
	help: 'This help message',
	source: 'Sets the data source',
	schema: 'Sets the color schema',
	days: 'Number of days for which the animation will be generated. Use 0 to plot all days.',
	frames: 'Number of frames per day',
	extraFrames: 'Number of extra frames for the last image',
	horizontalAxisLabel: 'Horizontal axis label',
	verticalAxisLabel: 'Vertical axis label',
	filter: 'Filter series by code (multiple codes separated by comma)',
	zoomEasing: 'Easing function for the zoom effect',
	timebarEasing: 'Easing function for the timebar',
	title: 'Sets the image title for the cover image',
	dateFormat: 'Sets the date format',
	drawMarkers: 'Draw series markers over the scale',
	skipZoom: 'Skips the zoom animation',
	hideWatermark: 'Hides the watermark'
};

export default class ParametersLoader
{
	public static help()
	{
		const argv = minimist(process.argv.slice(2));
		if (!argv.help)
			return false;

		console.log('Optional parameters:');
		for (const name of Object.keys(PARAMETERS))
			// @ts-ignore
			console.log(`  --${name}: ${PARAMETERS[name]}`);

		return true;
	}

	public static load(defaultValues: any)
	{
		return minimist(process.argv.slice(2), { default: defaultValues });
	}
}
