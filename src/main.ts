
// Local
import ImageGenerator from './drawing/ImageGenerator';
import ParameterLoader from './parameters/ParametersLoader';
import AnimationContextCreator from './util/AnimationContextCreator';
import logger from './util/Logger';

// Main
const main = async () =>
{
	// Help
	if (ParameterLoader.help())
		return;

	// Create context
	const context = await AnimationContextCreator.create();

	// Generate
	await ImageGenerator.generate(context);
};

(async () =>
{
	try {
		await main();
	}
	catch (e)
	{
		try
		{
			logger.error(e);
		}
		catch (e2)
		{
			console.log(e);
			console.log(e2);
		}

		process.exit(1);
	}
})();
