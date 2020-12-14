
import { Animation, PlotSeries, FrameFilterInfo, AnimationContext, ScaleBoundaries } from '../util/Types';
import ScaleBoundariesGenerator from '../scale/ScaleBoundariesGenerator';

export default class TimeAnimation implements Animation
{
	private context: AnimationContext;

	public constructor(context: AnimationContext)
	{
		this.context = context;
	}

	public getName(): string
	{
		return 'Time Animation';
	}

	public countFrames(): number
	{
		const diff = this.context.lastDate
			.diff(this.context.firstDate)
			.as('days');
		const maxDiff = Math.floor(diff);
		const realDays = this.context.options.days === 0 ?
			maxDiff :
			Math.min(maxDiff, this.context.options.days - 1);

		return 1 + this.context.options.frames * realDays;
	}

	public *getFrames(): Generator<FrameFilterInfo>
	{
		// First day with ratio 1
		yield { date: this.context.firstDate, dateRatio: 1 };

		// Rest of the days
		let current = this.context.firstDate.plus({ days: 1 });
		while (current <= this.context.lastDate)
		{
			for (let frame = 1; frame <= this.context.options.frames; frame++)
				yield { date: current, dateRatio: frame / this.context.options.frames };
			current = current.plus({ days: 1 });
		}
	}

	public getScaleBoundaries(filteredSeries: PlotSeries[],
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		_frameFilterInfo: FrameFilterInfo,
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		_frameIndex: number,
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		_stepFrameIndex: number): ScaleBoundaries {
		return ScaleBoundariesGenerator.generate(this.context, filteredSeries);
	}
}
