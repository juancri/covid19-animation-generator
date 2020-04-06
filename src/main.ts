
// Dependencies
import * as path from 'path';

// Local
import ConfigLoader from './configuration/ConfigLoader';
import DataLoader from './data/DataLoader';
import ImageGenerator from './drawing/ImageGenerator';
import ParameterLoader from './parameters/ParametersLoader';

// Constants
const OUTPUT_PATH = path.join(__dirname, '../output');

// Main
(async () =>
{
	// Help
	if (ParameterLoader.help())
		return;

	// Read arguments and configuration
	const config = await ConfigLoader.load ();
	const options = ParameterLoader.load(config.defaults);

	// Read data
	const dataSource = config.dataSources[options.source];
	if (!dataSource)
		throw new Error(`Data source not found: ${options.source}`);
	const timeSeries = await DataLoader.load (dataSource);

	// Generate
	const colorSchema = config.colorSchemas[options.schema];
	if (!colorSchema)
		throw new Error(`Color schema not found: ${options.schema}`);
	const layout = config.layouts[options.layout];
	if (!layout)
		throw new Error(`Layout not found: ${options.layout}`);
	const generator = new ImageGenerator(
		timeSeries,
		dataSource.series,
		colorSchema,
		layout);
	await generator.generate(
		OUTPUT_PATH,
		options.frames,
		options.extraFrames,
		options.days);
})();
