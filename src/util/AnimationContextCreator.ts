// Dependencies
import * as path from 'path';

// Local
import ConfigLoader from '../configuration/ConfigLoader';
import ParametersLoader from '../parameters/ParametersLoader';
import CanvasWriter from '../drawing/CanvasWriter';
import { AnimationContext } from './Types';
import ColorSchemaLoader from './ColorSchemaLoader';
import LayoutLoader from './LayoutLoader';
import PlotSeriesLoader from './PlotSeriesLoader';

// Constants
const OUTPUT_PATH = path.join(__dirname, '../output');

export default class AnimationContextCreator
{
	public static async create(): Promise<AnimationContext>
	{
		const config = await ConfigLoader.load ();
		const options = ParametersLoader.load(config.defaults);
		const layout = LayoutLoader.load(config);
		const writer = new CanvasWriter(layout, OUTPUT_PATH);

		return {
			config,
			options,
			layout,
			writer,
			series: await PlotSeriesLoader.load(config, options),
			color: ColorSchemaLoader.load(config, options),
		};
	}
}
