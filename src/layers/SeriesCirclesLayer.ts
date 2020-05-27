
import { FrameInfo, AnimationContext, Layer } from '../util/Types';

export default class SeriesCirclesLayer implements Layer
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
			if (series.points.length < 2)
				continue;

			const point = series.points[series.points.length - 1];
			this.context.writer.drawCircle(
				this.context.layout.circleSize,
				series.color,
				point,
				this.context.layout.plotArea);
		}
	}
}
