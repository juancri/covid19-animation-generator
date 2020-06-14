
import { AnimationContext, Layer } from '../util/Types';
import AnimationGenerator from '../animation/AnimationGenerator';
import BackgroundLayer from '../layers/BackgroundLayer';
import DateLayer from '../layers/DateLayer';
import ScaleLayer from '../layers/ScaleLayer';
import SeriesLinesLayer from '../layers/SeriesLinesLayer';
import SeriesMarkersLayer from '../layers/SeriesMarkersLayer';
import TimeBarLayer from '../layers/TimeBarLayer';
import SeriesLabelsLayer from '../layers/SeriesLabelsLayer';
import PrePostAnimationLayer from '../layers/PrePostAnimationLayer';
import LinesLayer from '../layers/LinesLayer';

export default class ImageGenerator
{
	public static async generate(context: AnimationContext)
	{
		const frameInfoGenerator = new AnimationGenerator(context);
		const layers: Layer[] = [
			// Background
			new BackgroundLayer(context),

			// Series
			new SeriesLinesLayer(context),
			new SeriesLabelsLayer(context),

			// Lines
			new LinesLayer(context),

			// Scale and makers
			new ScaleLayer(context),
			new SeriesMarkersLayer(context),

			// Extra
			new DateLayer(context),
			new PrePostAnimationLayer(context),
			new TimeBarLayer(context)
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
