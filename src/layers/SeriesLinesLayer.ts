import { FrameInfo, AnimationContext } from '../util/Types';
import Layer from './Layer';

export default class SeriesLinesLayer implements Layer
{
	private context: AnimationContext;

	public constructor(context: AnimationContext)
	{
		this.context = context;
	}

	public async draw (frame: FrameInfo)
	{
		for (const series of frame.series)
		{
			// Implement
			if (series.points.length < 2)
				return;

			this.context.writer.drawPolyline(
				series.color,
				this.context.options.seriesLineWidth,
				series.points,
				this.context.layout.plotArea);
		}
	}
}
