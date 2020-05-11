import { Animation, FrameFilterInfo, PlotSeries, Scale } from '../util/Types';
import DynamicScaleGenerator from '../scale/DynamicScaleGenerator';
import Easing from '../util/Easing';

const STEPS = [
	{ frames: 240, zoom: true },
	{ frames: 120, zoom: null },
	{ frames: 240, zoom: false }
];

const TOTAL_FRAMES = STEPS.map(s => s.frames).reduce((a, b) => a + b, 0);
const ZOOM_RATIO = 0.6;

export default class ZoomAnimation implements Animation
{
	private code: string;
	private frame: FrameFilterInfo;
	private scale: Scale | null;
	private target: Scale | null;

	public constructor(series: PlotSeries[], code: string)
	{
		this.code = code;
		this.frame = {
			date: this.getLastDate(series),
			ratio: 1
		};
		this.scale = null;
		this.target = null;
	}

	public countFrames(): number
	{
		return TOTAL_FRAMES;
	}

	public *getFrames(): Generator<FrameFilterInfo>
	{
		for (let i = 1; i <= TOTAL_FRAMES; i++)
			yield this.frame;
	}

	public getScale(filteredSeries: PlotSeries[], frame: FrameFilterInfo,
		frameIndex: number, stepFrameIndex: number): Scale
	{
		if (!this.scale)
			this.scale = DynamicScaleGenerator.generate(filteredSeries);
		if (!this.target)
		{
			const series = filteredSeries.find(serie => serie.code === this.code);
			if (!series)
				throw new Error(`Series not found: ${this.code}`);
			const targetCenter = series.points[series.points.length - 1];
			this.target = {
				horizontal: {
					min: targetCenter.x,
					max: targetCenter.x
				},
				vertical: {
					min: targetCenter.y,
					max: targetCenter.y
				}
			};
		}

		const factor = Easing.easeInOutCubic(this.getFactor(stepFrameIndex)) * ZOOM_RATIO;
		return {
			horizontal:
			{
				min: this.applyFactor(this.scale.horizontal.min, this.target.horizontal.min, factor),
				max: this.applyFactor(this.scale.horizontal.max, this.target.horizontal.max, factor)
			},
			vertical:
			{
				min: this.applyFactor(this.scale.vertical.min, this.target.vertical.min, factor),
				max: this.applyFactor(this.scale.vertical.max, this.target.vertical.max, factor)
			}
		};
	}

	private getFactor(index: number)
	{
		let current = index;
		for (const step of STEPS)
		{
			if (current <= step.frames)
			{
				if (step.zoom === null)
					return 1;
				return step.zoom ?
					current / step.frames :
					1 - (current / step.frames);
			}
			current -= step.frames;
		}

		throw new Error('Should not reach here for index: ' + index);
	}

	private applyFactor(origin: number, destination: number, ratio: number)
	{
		const diff = destination - origin;
		return origin + diff * ratio;
	}

	private getLastDate(series: PlotSeries[])
	{
		const firstPoints = series[0].points;
		const lastIndex = firstPoints.length - 1;
		const lastDataPoint = firstPoints[lastIndex];
		return lastDataPoint.date;
	}
}
