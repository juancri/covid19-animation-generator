
import * as util from 'util';
import formatNumber from 'format-number';
import * as Enumerable from 'linq';
import { FrameInfo, AnimationContext, Layer, PlotSeries } from '../util/Types';

const LABEL_LINE_ALPHA = 0.6;
const EXTRA_X_OFFSET = 30;
const FORMATTERS: { [key: string]: (n: number) => string } =
{
	plain: n => n.toString(),
	english: formatNumber({ integerSeparator: ',' }),
	spanish: formatNumber({ integerSeparator: '.' }),
};


export default class SeriesLabelsLayer implements Layer
{
	private context: AnimationContext;
	private formatter: (n: number) => string;
	private hasIcons: boolean;

	public constructor(context: AnimationContext)
	{
		this.context = context;
		this.formatter = FORMATTERS[context.options.stackedAreaNumberFormat];
		if (!this.formatter)
			throw new Error(`Stacked area number format not found: ${context.options.stackedAreaNumberFormat}`);
		this.hasIcons = !!this.context.options.seriesIconPathFormat;
	}

	public async draw (frame: FrameInfo)
	{
		for (const series of frame.series)
		{
			// Draw only if there's any line
			if (!series.points.length)
				continue;

			// Skip if the point is not visible
			const lastPoint = series.points[series.points.length - 1];
			if (lastPoint.x < this.context.layout.plotArea.left ||
				lastPoint.x > this.context.layout.plotArea.right ||
				lastPoint.y < this.context.layout.plotArea.top ||
				lastPoint.y > this.context.layout.plotArea.bottom)
				continue;

			// Draw
			if (this.context.options.type === 'stacked-area')
				this.drawStackedAreaLabel(frame, series);
			else
				this.drawLineLabel(frame, series);
		}
	}

	private drawLineLabel(frame: FrameInfo, series: PlotSeries)
	{
		const iconPath = util.format(this.context.options.seriesIconPathFormat, series.icon);
		const offset = this.context.color.series.label.offset;
		const lastPoint = series.points[series.points.length - 1];
		const x = lastPoint.x + offset.x
			+ EXTRA_X_OFFSET * (frame.labelPositionRatio ?? 0);
		const y = this.getLabelPosition(frame, series) + offset.y;

		if (this.hasIcons)
		{
			const iconX = x + this.context.options.seriesIconOffsetX;
			const iconY = y + this.context.options.seriesIconOffsetY;
			this.context.writer.drawImage(iconPath, { x: iconX, y: iconY });
		}

		const labelX = x + (this.hasIcons ? this.context.options.seriesIconLabelOffsetX : 0);
		const labelY = y + (this.hasIcons ? this.context.options.seriesIconLabelOffsetY : 0);
		const changed = y !== lastPoint.y + offset.y;
		this.context.writer.drawText(
			series.code,
			this.context.color.series.label.font,
			this.context.color.series.label.color,
			{ x: labelX, y: labelY },
			this.context.layout.seriesLabelsArea);

		if (frame.labelPositionRatio && changed)
			this.context.writer.drawLineAlpha(
				series.color,
				this.context.options.seriesLineWidth,
				lastPoint,
				{ x, y },
				frame.labelPositionRatio * LABEL_LINE_ALPHA);
	}

	private drawStackedAreaLabel(frame: FrameInfo, series: PlotSeries)
	{
		// Base
		const lastPoint = series.points[series.points.length - 1];
		const x = lastPoint.x + this.context.color.series.label.stackedAreaOffset.x;
		const y = lastPoint.y + this.context.color.series.label.stackedAreaOffset.y;

		// Get number
		const rawNumber = lastPoint.parent?.parent?.y ?? 0;
		const formattedNumber = this.formatter(Math.floor(rawNumber));

		// Get percent
		const total = Enumerable
			.from(frame.series)
			.select(serie => serie.points)
			.select(points => points.find(p => +p.date === +lastPoint.date))
			.select(point => point?.parent?.parent?.y ?? 0)
			.sum();
		const percent = Math.floor(rawNumber / total * 100);

		// Draw
		const label = `${series.code}\n${formattedNumber} (${percent}%)`;
		this.context.writer.drawText(
			label,
			this.context.color.series.label.font,
			this.context.color.series.label.color,
			{ x, y },
			this.context.layout.seriesLabelsArea);
	}

	private getLabelPosition(frame: FrameInfo, series: PlotSeries): number
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
