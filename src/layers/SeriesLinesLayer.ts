
import { FrameInfo, AnimationContext, Layer, PlotSeries, PlotPoint } from '../util/Types';

export default class SeriesLinesLayer implements Layer
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
			// Get sections
			const sections = Array.from(this.getSections(series));
			if (!sections.length)
				continue;

			// Draw sections
			for (const section of sections)
				this.drawPolyline(series.color, section);

			// Draw gaps
			if (sections.length > 1)
			{
				sections.forEach((section, index) =>
				{
					if (index === 0)
						return;
					const previous = sections[index - 1];
					const current = section;
					const pointFrom = previous[previous.length - 1];
					const pointTo = current[0];
					this.drawPolyline(
						series.color,
						[pointFrom, pointTo],
						true);
				});
			}

			// Get last
			const lastSection = sections[sections.length - 1];
			this.drawCircle(series.color, lastSection);
		}
	}

	private *getSections(series: PlotSeries): Generator<PlotPoint[]>
	{
		if (series.points.length < 2)
			return;
		if (!series.gaps || !series.gaps.length)
		{
			yield series.points;
			return;
		}

		let startDate = series.points[0].date;
		for (const gap of series.gaps)
		{
			const endDate = gap.from;
			const points = series.points.filter(p =>
				+p.date >= +startDate &&
				+p.date <= +endDate);
			if (points.length >= 1)
				yield points;
			startDate = gap.to;
		}

		const remaining = series.points.filter(p => +p.date >= +startDate);
		if (remaining.length >= 1)
			yield remaining;
	}

	private drawPolyline(color: string, points: PlotPoint[], dashed = false)
	{
		this.context.writer.drawPolyline(
			color,
			this.context.options.seriesLineWidth,
			points,
			this.context.layout.plotArea,
			dashed);
	}

	private drawCircle(color: string, points: PlotPoint[])
	{
		const lastPoint = points[points.length - 1];
		this.context.writer.drawCircle(
			this.context.layout.circleSize,
			color,
			lastPoint,
			this.context.layout.plotArea);
	}
}
