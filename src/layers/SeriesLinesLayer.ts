

import * as Enumerable from 'linq';
import { DateTime } from 'luxon';

import { FrameInfo, AnimationContext, Layer, PlotSeries, PlotPoint } from '../util/Types';

interface Section {
	color: string;
	points: PlotPoint[];
	dashed: boolean;
}

interface SeriesEvent {
	date: DateTime;
	color?: string;
	dashed?: boolean;
}

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
				this.drawPolyline(section.color, section.points, section.dashed);

			// Get last
			const lastSection = sections[sections.length - 1];
			this.drawCircle(lastSection);
		}
	}

	private *getSections(series: PlotSeries): Generator<Section>
	{
		// No way we can draw
		if (series.points.length < 2)
			return;

		// Get all events
		const milestoneEvents: SeriesEvent[] = series.milestones.map(milestone => ({
			date: milestone.date,
			color: milestone.color
		}));
		const gapEvents: SeriesEvent[][] = series.gaps.map(gap => [
			{ date: gap.from, dashed: true },
			{ date: gap.to.plus({ days: 1 }), dashed: false }
		]);
		const lastEvent: SeriesEvent = {
			date: series.points[series.points.length - 1].date.plus({ days: 1})
		};

		const firstDate = series.points[0].date;
		const allEvents = Enumerable
			.from([milestoneEvents, ...gapEvents, [lastEvent]])
			.selectMany(x => x)
			.where(x => +x.date > +firstDate)
			.orderBy(x => +x.date)
			.toArray();

		let currentColor = series.color;
		let currentDashed = false;
		let currentStart = series.points[0].date;
		let lastPoint = series.points[0];
		for (const event of allEvents)
		{
			const sectionPoints = series.points.filter(p =>
				+p.date >= +currentStart &&
				+p.date <= +event.date);
			const points = currentDashed ?
				[ lastPoint, sectionPoints[sectionPoints.length - 1] ] :
				[ lastPoint, ...sectionPoints ];
			if (sectionPoints.length > 1)
			{
				yield {
					color: currentColor,
					dashed: currentDashed,
					points
				};
			}

			currentColor = event.color ?? currentColor;
			currentDashed = event.dashed ?? currentDashed;
			currentStart = event.date;
			lastPoint = sectionPoints[sectionPoints.length - 1];
		}
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

	private drawCircle(section: Section)
	{
		const points = section.points;
		const lastPoint = points[points.length - 1];
		this.context.writer.drawCircle(
			this.context.layout.circleSize,
			section.color,
			lastPoint,
			this.context.layout.seriesCirclesArea);
	}
}
