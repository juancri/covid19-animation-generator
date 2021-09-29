import { AnimationContext, FrameInfo, LabelArea, PlotSeries, Point } from "@/util/Types";

export default class LabelsDrawerHelper
{
	public static getPoint(
		context: AnimationContext,
		frame: FrameInfo,
		labelArea: LabelArea,
		seriesIndex: number,
		customOrderSeries?: PlotSeries[]): Point
	{
		// Helper variables
		const allSeries = customOrderSeries ?? frame.series;
		const currentSeries = allSeries[seriesIndex];
		if (!currentSeries)
			throw new Error(`Series not found. Index: ${seriesIndex} Total: ${allSeries.length}`);

		// Get x
		const lastPoint = currentSeries.points[currentSeries.points.length - 1];
		const x = lastPoint.x + labelArea.offset.x;

		// Move up
		const lastIndex = context.series.length - 1;
		const previousY = seriesIndex === lastIndex ?
			0 :
			LabelsDrawerHelper.getPoint(context, frame, labelArea, seriesIndex + 1, allSeries).y;
		const minY = seriesIndex === lastIndex ?
			context.layout.plotArea.bottom - labelArea.minYOffset :
			previousY - labelArea.minYDistance;
		const y1 = Math.min(
			minY,
			lastPoint.y + labelArea.offset.y);

		// Move down
		const topOffset = context.layout.plotArea.top - labelArea.maxYOffset;
		const maxY = topOffset + seriesIndex * labelArea.minYDistance;
		const y2 = Math.max(maxY, y1);

		// Done
		const y = y2;
		return { x, y };
	}
}
