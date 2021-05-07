
import * as util from 'util';
import * as Enumerable from 'linq';

import { FrameInfo, PlotSeries, AnimationContext } from '../../../util/Types';

const LABEL_LINE_ALPHA = 0.6;
const EXTRA_X_OFFSET = 30;

export default class LineSeriesLabelDrawer
{
	public static draw(context: AnimationContext, frame: FrameInfo, series: PlotSeries): void
	{
		const iconPath = util.format(context.options.seriesIconPathFormat, series.icon);
		const offset = context.color.series.label.offset;
		const lastPoint = series.points[series.points.length - 1];
		const x = lastPoint.x + offset.x
			+ EXTRA_X_OFFSET * (frame.labelPositionRatio ?? 0);
		const y = LineSeriesLabelDrawer.getLabelPosition(frame, series) + offset.y;
		const hasIcons = !!context.options.seriesIconPathFormat;
		if (hasIcons)
		{
			const iconX = x + context.options.seriesIconOffsetX;
			const iconY = y + context.options.seriesIconOffsetY;
			context.writer.drawImage(iconPath, { x: iconX, y: iconY });
		}

		const labelX = x + (hasIcons ? context.options.seriesIconLabelOffsetX : 0);
		const labelY = y + (hasIcons ? context.options.seriesIconLabelOffsetY : 0);
		const changed = y !== lastPoint.y + offset.y;
		context.writer.drawText(
			series.code,
			context.color.series.label.font,
			context.color.series.label.color,
			{ x: labelX, y: labelY },
			context.layout.seriesLabelsArea);

		if (frame.labelPositionRatio && changed)
			context.writer.drawLineAlpha(
				series.color,
				context.options.seriesLineWidth,
				lastPoint,
				{ x, y },
				frame.labelPositionRatio * LABEL_LINE_ALPHA,
				true);
	}

	private static getLabelPosition(frame: FrameInfo, series: PlotSeries): number
	{
		const lastPoint = series.points[series.points.length - 1];
		const origin = lastPoint.y;
		if (!frame.labelPositionRatio)
			return origin;
		const seriesPoints = Enumerable
			.from(frame.series)
			.where(serie => serie.points.length > 0)
			.select(serie => ({
				serie,
				y: serie.points[serie.points.length - 1].y
			}));
		const min = seriesPoints.min(item => item.y);
		const max = seriesPoints.max(item => item.y);
		const rank = seriesPoints
			.orderBy(item => item.y)
			.select(item => item.serie)
			.indexOf(series);
		const items = seriesPoints.count();
		const destination = min + (rank / (items - 1)) * (max - min);
		const diff = destination - origin;
		return origin + diff * frame.labelPositionRatio;
	}
}
