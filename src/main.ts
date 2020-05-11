
// Dependencies
import * as path from 'path';

// Local
import ConfigLoader from './configuration/ConfigLoader';
import DataLoader from './data/DataLoader';
import ImageGenerator from './drawing/ImageGenerator';
import ParameterLoader from './parameters/ParametersLoader';
import DataSourceFilter from './util/DataSourceFilter';
import EasingLoader from './util/EasingLoader';

// Constants
const LAYOUT_NAME = 'square';
const OUTPUT_PATH = path.join(__dirname, '../output');

// Main
const main = async () =>
{
	// Help
	if (ParameterLoader.help())
		return;

	// Read arguments and configuration
	const config = await ConfigLoader.load ();
	const options = ParameterLoader.load(config.defaults);

	// Read data
	let dataSource = config.dataSources[options.source];
	if (!dataSource)
		throw new Error(`Data source not found: ${options.source}`);
	if (options.filter)
		dataSource = DataSourceFilter.apply(dataSource, options.filter);
	const timeSeries = await DataLoader.load (dataSource);

	// Generate
	const colorSchema = config.colorSchemas[options.schema];
	if (!colorSchema)
		throw new Error(`Color schema not found: ${options.schema}`);
	const layout = config.layouts[LAYOUT_NAME];
	if (!layout)
		throw new Error(`Layout not found: ${LAYOUT_NAME}`);
	const generator = new ImageGenerator(
		timeSeries,
		dataSource.series,
		colorSchema,
		layout,
		options.horizontalAxisLabel,
		options.verticalAxisLabel,
		EasingLoader.load(options.zoomEasing),
		EasingLoader.load(options.timebarEasing));
	await generator.generate(
		OUTPUT_PATH,
		options.frames,
		options.extraFrames,
		options.days);
};

(async () =>
{
	try {
		await main();
	}
	catch (e)
	{
		console.log(e);
		process.exit(1);
	}
})();
