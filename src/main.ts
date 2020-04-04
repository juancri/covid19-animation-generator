
// Dependencies
import * as path from 'path';

// Local
import ConfigLoader from './util/ConfigLoader';
import DataLoader from './util/DataLoader';
import ImageGenerator from './util/ImageGenerator';
import ParameterLoader from './util/ParametersLoader';

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
	const data = await DataLoader.load (dataSource);

	// Generate
	const colorSchema = config.colorSchemas[options.schema];
	if (!colorSchema)
		throw new Error(`Color schema not found: ${options.schema}`);
	const layout = config.layouts[options.layout];
	if (!layout)
		throw new Error(`Layout not found: ${options.layout}`);
	const generator = new ImageGenerator(
		data,
		dataSource.series,
		options.schema,
		colorSchema,
		options.layout,
		layout);
	await generator.generateAll(
		OUTPUT_PATH,
		options.days,
		options.frames,
		options.extraFrames);
})();
