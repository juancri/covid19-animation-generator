
import { FrameInfo, AnimationContext, Layer, PlotSeries } from '../../util/Types';

const MARKER_WIDTH = 1;
const MARKER_ALPHA = 0.5;

export default class SeriesMarkersLayer implements Layer
{
	private context: AnimationContext;
	private shouldDraw: boolean;

	public constructor(context: AnimationContext)
	{
		this.context = context;
		this.shouldDraw = context.options.type === 'line' &&
			this.context.options.drawMarkers;
	}

	public async draw (frame: FrameInfo): Promise<void>
	{
		if (!this.shouldDraw)
			return;

		for (const series of frame.series)
			this.drawMarkers(series);
	}

	private drawMarkers (series: PlotSeries)
	{
		const points = series.points;
		const lastPoint = points[points.length - 1];

		// Ignore if it's not visible
		const plotArea = this.context.layout.plotArea;
		if (lastPoint.x < plotArea.left
			|| lastPoint.x > plotArea.right
			|| lastPoint.y < plotArea.top
			|| lastPoint.y > plotArea.bottom)
			return;

		const leftPoint = {
			x: this.context.layout.plotArea.left,
			y: lastPoint.y
		};
		const bottomPoint = {
			x: lastPoint.x,
			y: this.context.layout.plotArea.bottom
		};
		this.context.writer.drawLineAlpha(
			series.color,
			MARKER_WIDTH,
			leftPoint,
			lastPoint,
			MARKER_ALPHA)
		this.context.writer.drawLineAlpha(
			series.color,
			MARKER_WIDTH,
			bottomPoint,
			lastPoint,
			MARKER_ALPHA);
	}
}
