import {
	Animation, FrameFilterInfo,
	EasingFunction, AnimationContext
} from '../util/Types';
import EasingLoader from '../util/EasingLoader';

interface PositionStep { frames: number, in: boolean | number };
const LINE_TYPE = 'line';
const LINEAR_SCALES = ['linear', 'linear-avg7'];
const MAIN_STEPS: PositionStep[] = [
	{ frames: 120, in: true },
	{ frames: 240, in: 1 },
	{ frames: 120, in: false }
];

export default class SeriesRankingAnimation implements Animation
{
	private frame: FrameFilterInfo;
	private easing: EasingFunction;
	private steps: PositionStep[];

	public constructor(context: AnimationContext)
	{
		if (context.options.type !== LINE_TYPE)
			throw new Error('Can not use series ranking for non-line type animations');
		if (!LINEAR_SCALES.includes(context.options.scale))
			throw new Error('Can not use series ranking for non-linear scale animations');
		this.easing = EasingLoader.load(context.options.rankEasing);
		this.frame = {
			date: context.lastDate,
			dateRatio: 1
		};
		this.steps = [
			{ frames: context.options.extraFrames / 2, in: 0 },
			...MAIN_STEPS
		];
	}

	public getName(): string
	{
		return 'Series Ranking Animation';
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
		{
			yield {
				...this.frame,
				labelPositionRatio: this.easing(this.getFactor(i))
			};
		}
	}

	private getFactor(index: number)
	{
		let current = index;
		for (const step of this.steps)
		{
			if (current <= step.frames)
			{
				if (typeof step.in === 'number')
					return step.in;
				return step.in ?
					current / step.frames :
					1 - (current / step.frames);
			}
			current -= step.frames;
		}

		throw new Error('Should not reach here for index: ' + index);
	}
}
