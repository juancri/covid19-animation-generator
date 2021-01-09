
import formatNumber from 'format-number';
import * as Enumerable from 'linq';

import { AnimationContext, FrameInfo, PlotSeries, PlotPoint, Point, Box } from '../../../util/Types';
import CanvasPointsGenerator from '../../CanvasPointsGenerator';
import LineScaledPointsGenerator from '../../LineScaledPointsGenerator';

const FORMATTERS: { [key: string]: (n: number) => string } =
{
	plain: n => n.toString(),
	english: formatNumber({ integerSeparator: ',' }),
	spanish: formatNumber({ integerSeparator: '.' }),
};
const CENTER_OFFSET_TOP_Y = -40;
const CENTER_OFFSET_BOTTOM_Y = 30;

export default class StackSeriesLabelDrawer
{
	public static draw(context: AnimationContext, frame: FrameInfo, series: PlotSeries): void
	{
		const seriesIndex = frame.series.indexOf(series);
		const point = StackSeriesLabelDrawer.getPoint(context, frame, seriesIndex);
		StackSeriesLabelDrawer.drawInternal(context, frame, series, point);
	}

	public static drawCenter(context: AnimationContext, frame: FrameInfo, series: PlotSeries): void
	{
		const seriesIndex = frame.series.indexOf(series);
		if (seriesIndex > 1)
			throw new Error('Expecting only two series');
		const isFirstSeries = seriesIndex === 0;
		const scaledY = LineScaledPointsGenerator.scaleValue(0, false, frame.scaleBoundaries);
		const canvasY = CanvasPointsGenerator.scaleValue(scaledY, false, context.layout.plotArea);
		const offsetY = isFirstSeries ?
			CENTER_OFFSET_TOP_Y :
			CENTER_OFFSET_BOTTOM_Y;
		const lastPoint = series.points[series.points.length - 1];
		const x = lastPoint.x + context.color.series.label.stackedArea.offset.x;
		const y = canvasY + offsetY;
		StackSeriesLabelDrawer.drawInternal(context, frame, series, { x, y });
	}

	private static drawInternal(context: AnimationContext, frame: FrameInfo, series: PlotSeries, point: Point)
	{
		// Base
		const formatter = FORMATTERS[context.options.stackedAreaNumberFormat];
		if (!formatter)
			throw new Error(`Stacked area number format not found: ${context.options.stackedAreaNumberFormat}`);
		const lastPoint = series.points[series.points.length - 1];

		// Get number
		const rawNumber = StackSeriesLabelDrawer.getFirstParentY(lastPoint);
		const formattedNumber = formatter(Math.floor(rawNumber));

		// Get percent
		const total = Enumerable
			.from(frame.series)
			.select(serie => serie.points)
			.select(points => points.find(p => +p.date === +lastPoint.date))
			.where(p => !!p)
			.select(p => StackSeriesLabelDrawer.getFirstParentY(p))
			.sum();
		const percent = Math.floor(rawNumber / total * 100);

		// Draw label
		const label = `${series.code}\n${formattedNumber} (${percent}%)`;
		context.writer.drawText(
			label,
			context.color.series.label.font,
			context.color.series.label.color,
			point,
			context.layout.seriesLabelsArea);

		// Draw box
		const boxConfig = context.color.series.label.stackedArea.box;
		const box: Box = {
			left: point.x + boxConfig.left,
			right: point.x + boxConfig.right,
			top: point.y + boxConfig.top,
			bottom: point.y + boxConfig.bottom
		};
		context.writer.drawRectangle(box, series.areaColor);
	}

	private static getPoint(context: AnimationContext, frame: FrameInfo, seriesIndex: number): Point
	{
		const stackedArea = context.color.series.label.stackedArea;
		const series = frame.series[seriesIndex];
		const lastPoint = series.points[series.points.length - 1];
		const x = lastPoint.x + stackedArea.offset.x;
		const lastIndex = context.series.length - 1;
		const previousY = seriesIndex === lastIndex ?
			0 :
			StackSeriesLabelDrawer.getPoint(context, frame, seriesIndex + 1).y;
		const minY = seriesIndex === lastIndex ?
			context.layout.plotArea.bottom - stackedArea.minYOffset:
			previousY - stackedArea.minYDistance;
		const y = Math.min(
			minY,
			lastPoint.y + stackedArea.offset.y);
		return { x, y };
	}

	private static getFirstParentY(point: PlotPoint|undefined): number
	{
		if (!point)
			return 0;
		if (point.parent)
			return StackSeriesLabelDrawer.getFirstParentY(point.parent);

		return point.y;
	}
}
