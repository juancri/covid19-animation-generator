import {
	Animation, FrameFilterInfo, PlotSeries,
	ScaleBoundaries, EasingFunction, AnimationContext
} from '../util/Types';
import ScaleBoundariesGenerator from '../scale/ScaleBoundariesGenerator';
import EasingLoader from '../util/EasingLoader';

interface ZoomStep { frames: number, zoom: boolean | number };
const MAIN_STEPS: ZoomStep[] = [
	{ frames: 240, zoom: true },
	{ frames: 120, zoom: 1 },
	{ frames: 240, zoom: false }
];

const ZOOM_RATIO = 0.6;

export default class ZoomAnimation implements Animation
{
	private context: AnimationContext;
	private frame: FrameFilterInfo;
	private scale: ScaleBoundaries | null;
	private target: ScaleBoundaries | null;
	private easing: EasingFunction;
	private steps: ZoomStep[];

	public constructor(context: AnimationContext)
	{
		this.context = context;
		this.easing = EasingLoader.load(context.options.zoomEasing);
		this.frame = {
			date: context.lastDate,
			ratio: 1
		};
		this.scale = null;
		this.target = null;
		this.steps = [
			{ frames: context.options.extraFrames / 2, zoom: 0 },
			...MAIN_STEPS];
	}

	public getName(): string
	{
		return 'Zoom Animation';
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

	public getScaleBoundaries(filteredSeries: PlotSeries[], frame: FrameFilterInfo,
		frameIndex: number, stepFrameIndex: number): ScaleBoundaries
	{
		if (!this.scale)
			this.scale = ScaleBoundariesGenerator.generate(this.context, filteredSeries);
		if (!this.target)
		{
			const code = this.context.series[this.context.series.length - 1].code;
			const series = filteredSeries.find(serie => serie.code === code);
			if (!series)
				throw new Error(`Series not found: ${code}`);
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
}
