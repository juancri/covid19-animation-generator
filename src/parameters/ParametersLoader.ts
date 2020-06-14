
import * as minimist from 'minimist';
import { Options } from '../util/Types';

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
	hideWatermark: 'Hides the watermark',
	seriesLineWidth: 'Series line width',
	horizontalMin: 'Horizontal scale minimum',
	horizontalMax: 'Horizontal scale maximum',
	verticalMin: 'Vertical scale minimum',
	verticalMax: 'Vertical scale maximum',
	scale: 'Scale',
	scaleDateFormat: 'Date format for the scale labels (applies only for linear scale)',
	scaleNumberFormat: 'Number format for the scale labels (applies only for linear scale)',
	horizontalJump: 'Distance between scale labels (horizontal axis)',
	verticalJump: 'Distance between scale labels (vertical axis)',
	singleDynamicScale: 'Use single axis to calculate the dynamic scale',
	horizontalLines: 'Horizontal lines with format numericvalue:label (multiple lines separated by comma)',
	verticalLines: 'Vertical lines with format numericvalue:label (multiple lines separated by comma)',
	configOverride: 'JSON to override specific configuration file sections'
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

	public static load(defaultValues: Options): Options
	{
		// @ts-ignore
		return minimist(process.argv.slice(2), { default: defaultValues });
	}
}
