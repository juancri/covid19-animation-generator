
import { FrameInfo, AnimationContext, Layer } from '../util/Types';

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
			if (series.points.length < 2)
				return;

			this.context.writer.drawPolyline(
				series.color,
				this.context.options.seriesLineWidth,
				series.points,
				this.context.layout.plotArea);

			const lastPoint = series.points[series.points.length - 1];
			this.context.writer.drawCircle(
				this.context.layout.circleSize,
				series.color,
				lastPoint,
				this.context.layout.plotArea);
		}
	}
}
