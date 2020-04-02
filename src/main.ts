
// Dependencies
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
	// Read input
	const config = await ConfigLoader.load ();
	const dataSource = config.dataSources[config.defaultDataSource];
	const data = await DataLoader.load (dataSource);

	// Generate
	const colorSchema = config.colorSchemas[config.defaultColorSchema];
	if (!colorSchema)
		throw new Error(`Color schema not found: ${config.defaultColorSchema}`);
	const generator = new ImageGenerator(data, dataSource.series, colorSchema);
	await generator.generateAll(
		OUTPUT_PATH,
		config.days,
		config.framesPerDay,
		config.extraEndFrames);
})();
