
import { AnimationContext, Layer } from '../util/Types';
import AnimationGenerator from '../animation/AnimationGenerator';
import BackgroundLayer from './layers/BackgroundLayer';
import DateLayer from './layers/DateLayer';
import DebugLayer from './layers/DebugLayer';
import ScaleLayer from './layers/ScaleLayer';
import SeriesPlotLayer from './layers/SeriesPlotLayer';
import TimeBarLayer from './layers/TimeBarLayer';
import SeriesLabelsLayer from './layers/SeriesLabelsLayer';
import PrePostAnimationLayer from './layers/PrePostAnimationLayer';
import LinesLayer from './layers/LinesLayer';
import BandLayer from './layers/BandLayer';

export default class ImageGenerator
{
	public static async generate(context: AnimationContext)
	{
		const frameInfoGenerator = new AnimationGenerator(context);
		const layers: Layer[] = [
			// Background
			new BackgroundLayer(context),

			// Band
			new BandLayer(context),

			// Series
			new SeriesPlotLayer(context),
			new SeriesLabelsLayer(context),

			// Lines
			new LinesLayer(context),

			// Scale
			new ScaleLayer(context),

			// Extra
			new DateLayer(context),
			new PrePostAnimationLayer(context),
			new TimeBarLayer(context),
			new DebugLayer(context)
		];

		for (const frame of frameInfoGenerator.generate())
		{
			context.writer.clean();
			for (const layer of layers)
				await layer.draw(frame);

			await context.writer.save(frame.name || null);
		}
	}
}
