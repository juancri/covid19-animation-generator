import { FrameInfo, AnimationContext, Layer } from '../util/Types';

export default class SeriesLabelsLayer implements Layer
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
			// Draw only if there's any line
			if (!series.points.length)
				continue;

			// Draw only if the point is visible
			const lastPoint = series.points[series.points.length - 1];
			if (lastPoint.x < this.context.layout.plotArea.left ||
				lastPoint.x > this.context.layout.plotArea.right ||
				lastPoint.y < this.context.layout.plotArea.top ||
				lastPoint.y > this.context.layout.plotArea.bottom)
				continue;

			const x = lastPoint.x + this.context.color.series.offset.x;
			const y = lastPoint.y + this.context.color.series.offset.y;
			this.context.writer.drawText(
				series.code,
				this.context.color.series.font,
				this.context.color.series.color,
				{ x, y },
				this.context.layout.seriesLabelsArea);
		}
	}
}
