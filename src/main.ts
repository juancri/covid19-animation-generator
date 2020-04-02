
// Dependencies
import * as optimist from 'optimist';
import * as path from 'path';

// Local
import ConfigLoader from './util/ConfigLoader';
import DataLoader from './util/DataLoader';
import ImageGenerator from './util/ImageGenerator';

// Constants
const OUTPUT_PATH = path.join(__dirname, '../output');

// Main
(async () =>
{
	// Read arguments and configuration
	const argv = optimist.argv;
	const config = await ConfigLoader.load ();
	const dataSourceName = argv.source || config.defaultDataSource;
	const colorSchemaName = argv.schema || config.defaultColorSchema;

	// Read data
	const dataSource = config.dataSources[dataSourceName];
	if (!dataSource)
		throw new Error(`Data source not found: ${dataSourceName}`);
	const data = await DataLoader.load (dataSource);

	// Generate
	const colorSchema = config.colorSchemas[colorSchemaName];
	if (!colorSchema)
		throw new Error(`Color schema not found: ${colorSchemaName}`);
	const generator = new ImageGenerator(data, dataSource.series, colorSchema);
	await generator.generateAll(
		OUTPUT_PATH,
		config.days,
		config.framesPerDay,
		config.extraEndFrames);
})();
