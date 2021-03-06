
import * as ProgressBar from 'progress';
import { FrameInfo, Animation, ScaleBoundaries, AnimationContext } from '../util/Types';
import TimeAnimation from './TimeAnimation';
import FixedFrameAnimation from './FixedFrameAnimation';
import DataFrameFilter from '../drawing/DataFrameFilter';
import ScaledPointsGenerator from '../drawing/ScaledPointsGenerator';
import CanvasPointsGenerator from '../drawing/CanvasPointsGenerator';
import ZoomAnimation from './ZoomAnimation';
import CoverFrameAnimation from './CoverFrameAnimation';
import ScaleBoundariesGenerator from '../scale/ScaleBoundariesGenerator';
import PostAnimation from './PostAnimation';
import SeriesRankingAnimation from './SeriesRankingAnimation';
import logger from '../util/Logger';
import SampleFrameAnimation from './SampleFrameAnimation';

const PROGRESS_BAR_FORMAT = ' generating animation [:bar] :current/:total frames :percent :etas';
const PROGRESS_BAR_OPTIONS = {
	complete: '=',
	incomplete: ' ',
	width: 40
};

export default class AnimationGenerator
{
	private context: AnimationContext;

	public constructor(context: AnimationContext)
	{
		this.context = context;
	}

	public *generate(): Generator<FrameInfo>
	{
		const animations = Array.from(this.getAnimations());
		const total = animations
			.map(animation => animation.countFrames())
			.reduce((a, b) => a + b, 0);
		const bar = new ProgressBar(
			PROGRESS_BAR_FORMAT,
			{ ...PROGRESS_BAR_OPTIONS, total });
		let frameIndex = 1;
		let lastScale: ScaleBoundaries | null = null;
		for (const animation of animations.filter(a => a.countFrames() > 0))
		{
			let stepFrameIndex = 1;
			for (const frame of animation.getFrames())
			{
				const filtered = DataFrameFilter.generate(this.context.series, frame);
				const scale: ScaleBoundaries|null =
					(animation.getScaleBoundaries
						&& animation.getScaleBoundaries(
							filtered, frame,
							frameIndex, stepFrameIndex))
					|| lastScale
					|| ScaleBoundariesGenerator.generate(this.context, filtered);
				lastScale = scale;
				const scaled = ScaledPointsGenerator.generate(filtered, scale, this.context.options.type);
				const canvas = CanvasPointsGenerator.generate(scaled, this.context.layout.plotArea);
				bar.tick();
				yield {
					date: frame.date,
					series: canvas,
					currentFrame: frameIndex,
					totalFrames: total,
					name: frame.name,
					stage: frame.stage ?? 'main',
					scaleBoundaries: scale,
					labelPositionRatio: frame.labelPositionRatio,
					animationName: animation.getName()
				};
				frameIndex++;
				stepFrameIndex++;
			}
		}
	}

	private *getAnimations(): Generator<Animation>
	{
		if (this.context.options.sample)
		{
			logger.info('Sample parameter is used. Generating only one frame.');
			yield new SampleFrameAnimation(this.context);
			yield new CoverFrameAnimation(this.context);
			return;
		}

		yield new TimeAnimation(this.context);
		if (this.context.options.showRank)
			yield new SeriesRankingAnimation(this.context);
		if (!this.context.options.skipZoom)
			yield new ZoomAnimation(this.context);
		yield new FixedFrameAnimation(this.context);
		if (this.context.options.postAnimationDirectory)
			yield new PostAnimation(this.context);
		yield new CoverFrameAnimation(this.context);
	}
}
