import { Animation, FrameFilterInfo, PlotSeries, Scale, EasingFunction } from '../util/Types';
import DynamicScaleGenerator from '../scale/DynamicScaleGenerator';

interface ZoomStep { frames: number, zoom: boolean | number };
const MAIN_STEPS: ZoomStep[] = [
	{ frames: 240, zoom: true },
	{ frames: 120, zoom: 1 },
	{ frames: 240, zoom: false }
];

const ZOOM_RATIO = 0.6;

export default class ZoomAnimation implements Animation
{
	private code: string;
	private frame: FrameFilterInfo;
	private scale: Scale | null;
	private target: Scale | null;
	private easing: EasingFunction;
	private steps: ZoomStep[];

	public constructor(series: PlotSeries[], code: string,
		easing: EasingFunction, initialFrames: number)
	{
		this.code = code;
		this.easing = easing;
		this.frame = {
			date: this.getLastDate(series),
			ratio: 1
		};
		this.scale = null;
		this.target = null;
		this.steps = [
			{ frames: initialFrames, zoom: 0 },
			...MAIN_STEPS];
	}

	public countFrames(): number
	{
		return this.steps
			.map(s => s.frames)
			.reduce((a, b) => a + b, 0);
	}

	public *getFrames(): Generator<FrameFilterInfo>
	{
		for (let i = 1; i <= this.countFrames(); i++)
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

		const factor = this.easing(this.getFactor(stepFrameIndex)) * ZOOM_RATIO;
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
		for (const step of this.steps)
		{
			if (current <= step.frames)
			{
				if (typeof step.zoom === 'number')
					return step.zoom;
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
