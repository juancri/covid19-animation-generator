
import formatNumber from 'format-number';
import * as Enumerable from 'linq';
import { FrameInfo, AnimationContext, Layer, PlotSeries } from '../util/Types';

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

	public constructor(context: AnimationContext)
	{
		this.context = context;
		this.formatter = FORMATTERS[context.options.stackedAreaNumberFormat];
		if (!this.formatter)
			throw new Error(`Stacked area number format not found: ${context.options.stackedAreaNumberFormat}`);
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
				this.drawLineLabel(series);
		}
	}

	private drawLineLabel(series: PlotSeries)
	{
		const lastPoint = series.points[series.points.length - 1];
		const x = lastPoint.x + this.context.color.series.label.offset.x;
		const y = lastPoint.y + this.context.color.series.label.offset.y;
		this.context.writer.drawText(
			series.code,
			this.context.color.series.label.font,
			this.context.color.series.label.color,
			{ x, y },
			this.context.layout.seriesLabelsArea);
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
}
