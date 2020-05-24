import { FrameInfo, AnimationContext } from '../util/Types';
import Layer from './Layer';

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
			if (!series.points.length)
				return;

			const point = series.points[series.points.length - 1];

			// Draw only if the point is visible
			if (point.x < this.context.layout.plotArea.left ||
				point.x > this.context.layout.plotArea.right ||
				point.y < this.context.layout.plotArea.top ||
				point.y > this.context.layout.plotArea.bottom)
				continue;

			const x = point.x + this.context.color.series.offset.x;
			const y = point.y + this.context.color.series.offset.y;
			this.context.writer.drawText(
				series.code,
				this.context.color.series.font,
				this.context.color.series.color,
				{ x, y },
				this.context.layout.seriesLabelsArea);
		}
	}
}
