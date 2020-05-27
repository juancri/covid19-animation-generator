import { FrameInfo, AnimationContext, Layer } from '../util/Types';

const MARKER_LENGTH = 12;
const MARKER_WIDTH = 5;

export default class SeriesMarkersLayer implements Layer
{
	private context: AnimationContext;

	public constructor(context: AnimationContext)
	{
		this.context = context;
	}

	public async draw (frame: FrameInfo)
	{
		if (!this.context.options.drawMarkers)
			return;

		for (const series of frame.series)
		{
			if (series.points.length < 2)
				continue;

			const lastPoint = series.points[series.points.length - 1];
			const leftPoint = {
				x: this.context.layout.plotArea.left,
				y: lastPoint.y
			};
			const bottomPoint = {
				x: lastPoint.x,
				y: this.context.layout.plotArea.bottom
			};
			this.context.writer.drawLine(
				series.color,
				MARKER_WIDTH,
				{ x: leftPoint.x - MARKER_LENGTH, y: leftPoint.y },
				{ x: leftPoint.x + MARKER_LENGTH, y: leftPoint.y });
			this.context.writer.drawLine(
				series.color,
				MARKER_WIDTH,
				{ x: bottomPoint.x, y: bottomPoint.y - MARKER_LENGTH },
				{ x: bottomPoint.x, y: bottomPoint.y + MARKER_LENGTH });
		}
	}
}
