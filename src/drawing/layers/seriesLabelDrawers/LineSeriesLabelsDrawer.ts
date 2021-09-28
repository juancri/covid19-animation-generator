
import * as util from 'util';

import { FrameInfo, PlotSeries, AnimationContext } from '../../../util/Types';
import LabelsDrawerHelper from './LabelsDrawerHelper';

const LABEL_LINE_ALPHA = 0.6;

export default class LineSeriesLabelDrawer
{
	public static draw(context: AnimationContext, frame: FrameInfo, series: PlotSeries): void
	{
		const iconPath = util.format(context.options.seriesIconPathFormat, series.icon);
		const lastPoint = series.points[series.points.length - 1];
		const labelArea = context.color.series.label.linearArea;
		const seriesIndex = frame.series.indexOf(series);
		const labelPosition = LabelsDrawerHelper.getPoint(
			context, frame,
			labelArea, seriesIndex);
		const hasIcons = !!context.options.seriesIconPathFormat;
		if (hasIcons)
		{
			const iconX = labelPosition.x + context.options.seriesIconOffsetX;
			const iconY = labelPosition.y + context.options.seriesIconOffsetY;
			context.writer.drawImage(iconPath, { x: iconX, y: iconY });
		}

		const labelX = labelPosition.x + (hasIcons ? context.options.seriesIconLabelOffsetX : 0);
		const labelY = labelPosition.y + (hasIcons ? context.options.seriesIconLabelOffsetY : 0);
		context.writer.drawText(
			series.code,
			context.color.series.label.font,
			context.color.series.label.color,
			{ x: labelX, y: labelY },
			context.layout.seriesLabelsArea);

		if (frame.labelPositionRatio)
			context.writer.drawLineAlpha(
				series.color,
				context.options.seriesLineWidth,
				lastPoint,
				labelPosition,
				frame.labelPositionRatio * LABEL_LINE_ALPHA,
				true);
	}
}
