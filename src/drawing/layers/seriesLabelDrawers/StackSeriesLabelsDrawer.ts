
import formatNumber from 'format-number';
import * as Enumerable from 'linq';

import { AnimationContext, FrameInfo, PlotSeries, PlotPoint, Point, Box } from '../../../util/Types';
import CanvasPointsGenerator from '../../CanvasPointsGenerator';
import LineScaledPointsGenerator from '../../LineScaledPointsGenerator';
import LabelsDrawerHelper from './LabelsDrawerHelper';

const FORMATTERS: { [key: string]: (n: number) => string } =
{
	plain: formatNumber({ truncate: 0 }),
	english: formatNumber({ integerSeparator: ',', truncate: 0 }),
	spanish: formatNumber({ integerSeparator: '.', truncate: 0 }),
};
const PERCENTAGE_FORMATTERS: { [key: string]: (n: number) => string } =
{
	plain: formatNumber({ truncate: 0 }),
	english: formatNumber({ integerSeparator: ',', decimal: '.', truncate: 1 }),
	spanish: formatNumber({ integerSeparator: '.', decimal: ',', truncate: 1 }),
};
const CENTER_OFFSET_TOP_Y = -40;
const CENTER_OFFSET_BOTTOM_Y = 30;

export default class StackSeriesLabelDrawer
{
	public static draw(context: AnimationContext, frame: FrameInfo, series: PlotSeries): void
	{
		const seriesIndex = frame.series.indexOf(series);
		const labelArea = context.color.series.label.stackedArea;
		const point = LabelsDrawerHelper.getPoint(
			context, frame, labelArea, seriesIndex);
		StackSeriesLabelDrawer.drawInternal(context, frame, series, point, true);
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
		StackSeriesLabelDrawer.drawInternal(context, frame, series, { x, y }, false);
	}

	private static drawInternal(
		context: AnimationContext, frame: FrameInfo, series: PlotSeries,
		point: Point, drawRectangle: boolean)
	{
		// Draw label
		const label = this.getLabel(context, frame, series);
		context.writer.drawText(
			label,
			context.color.series.label.font,
			context.color.series.label.color,
			point,
			context.layout.seriesLabelsArea);

		// Draw box
		if (drawRectangle)
		{
			const boxConfig = context.color.series.label.stackedArea.box;
			const box: Box = {
				left: point.x + boxConfig.left,
				right: point.x + boxConfig.right,
				top: point.y + boxConfig.top,
				bottom: point.y + boxConfig.bottom
			};
			context.writer.drawRectangle(box, series.areaColor);
		}
	}

	private static getLabel(context: AnimationContext, frame: FrameInfo, series: PlotSeries): string
	{
		const includePercentage = context.options.stackedAreaIncludePercentage;
		const includeValue = context.options.stackedAreaIncludeValue;
		if (includePercentage && includeValue)
			return `${series.code}\n${this.getFormattedNumber(context, series)} (${this.getPercent(context, frame, series)}%)`;
		if (includeValue)
			return `${series.code}\n${this.getFormattedNumber(context, series)}`;
		if (includePercentage)
			return `${series.code}\n${this.getPercent(context, frame, series)}%`;

		throw new Error('stackedAreaIncludePercentage and stackedAreaIncludeValue are both false');
	}

	private static getFormattedNumber(context: AnimationContext, series: PlotSeries): string
	{
		const formatter = FORMATTERS[context.options.stackedAreaNumberFormat];
		if (!formatter)
			throw new Error(`Stacked area number format not found: ${context.options.stackedAreaNumberFormat}`);
		const lastPoint = series.points[series.points.length - 1];
		const rawNumber = StackSeriesLabelDrawer.getFirstParentY(lastPoint);
		return formatter(rawNumber);
	}

	private static getPercent(context: AnimationContext, frame: FrameInfo, series: PlotSeries): string
	{
		const formatter = PERCENTAGE_FORMATTERS[context.options.stackedAreaPercentageFormat];
		if (!formatter)
			throw new Error(`Stacked area percentage format not found: ${context.options.stackedAreaPercentageFormat}`);
		const lastPoint = series.points[series.points.length - 1];
		const total = Enumerable
			.from(frame.series)
			.select(s => s.points)
			.select(points => points.find(p => +p.date === +lastPoint.date))
			.where(p => !!p)
			.select(p => StackSeriesLabelDrawer.getFirstParentY(p))
			.sum();
		const rawNumber = StackSeriesLabelDrawer.getFirstParentY(lastPoint);
		const rawPercent = rawNumber / total * 100;
		return formatter(rawPercent);
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
