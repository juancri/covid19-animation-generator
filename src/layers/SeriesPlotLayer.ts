

import * as Enumerable from 'linq';
import { DateTime } from 'luxon';

import { FrameInfo, AnimationContext, Layer, PlotSeries, PlotPoint, Point } from '../util/Types';

interface Section {
	color: string;
	areaColor: string;
	points: PlotPoint[];
	dashed: boolean;
}

interface SeriesEvent {
	date: DateTime;
	color?: string;
	dashed?: boolean;
}

const STACKED_AREA = 'stacked-area';

export default class SeriesPlotLayer implements Layer
{
	private context: AnimationContext;
	private isStackedArea: boolean;

	public constructor(context: AnimationContext)
	{
		this.context = context;
		this.isStackedArea = context.options.type === STACKED_AREA;
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
				this.drawSection(
					section.color,
					section.areaColor,
					section.points,
					section.dashed);

			// Draw circle, only for line chart
			if (!this.isStackedArea)
			{
				const lastSection = sections[sections.length - 1];
				this.drawCircle(lastSection);
			}
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
					areaColor: series.areaColor,
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

	private drawSection(color: string, areaColor: string, points: PlotPoint[], dashed = false)
	{
		if (this.isStackedArea)
		{
			const firstPoint = points[0];
			const lastPoint = points[points.length - 1];
			const bottom = this.context.layout.plotArea.bottom;
			const firstBasePoint: Point = { x: firstPoint.x, y: bottom };
			const lastBasePoint: Point = { x: lastPoint.x, y: bottom };
			const polygonPoints = [firstBasePoint, ...points, lastBasePoint];
			this.context.writer.drawPolygon(areaColor, polygonPoints);
		}

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

		// Ignore if it's not visible
		const plotArea = this.context.layout.plotArea;
		if (lastPoint.x < plotArea.left
			|| lastPoint.x > plotArea.right
			|| lastPoint.y < plotArea.top
			|| lastPoint.y > plotArea.bottom)
			return;

		this.context.writer.drawCircle(
			this.context.layout.circleSize,
			section.color,
			lastPoint,
			this.context.layout.seriesCirclesArea);
	}
}
