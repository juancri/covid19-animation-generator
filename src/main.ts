
// Local
import ImageGenerator from './drawing/ImageGenerator';
import ParameterLoader from './parameters/ParametersLoader';
import AnimationContextCreator from './util/AnimationContextCreator';

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
		console.log(e);
		process.exit(1);
	}
})();
