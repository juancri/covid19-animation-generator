

import * as ProgressBar from 'progress';
import { FrameInfo, Animation, ScaleBoundaries, AnimationContext } from '../util/Types';
import TimeAnimation from './TimeAnimation';
import FixedFrameAnimation from './FixedFrameAnimation';
import DataFrameFilter from '../drawing/DataFrameFilter';
import ScaledPointsGenerator from '../drawing/ScaledPointsGenerator';
import CanvasPointsGenerator from '../drawing/CanvasPointsGenerator';
import ZoomAnimation from './ZoomAnimation';
import CoverFrameAnimation from './CoverFrameAnimation';
import EmptyAnimation from './EmptyAnimation';
import ScaleBoundariesGenerator from '../scale/ScaleBoundariesGenerator';
import PostAnimation from './PostAnimation';
import SeriesRankingAnimation from './SeriesRankingAnimation';

export default class AnimationGenerator
{
	private context: AnimationContext;
	private animations: Animation[];

	public constructor(context: AnimationContext)
	{
		this.context = context;
		this.animations = [
			new TimeAnimation(context),
			context.options.showRank ?
				new SeriesRankingAnimation(context) :
				new EmptyAnimation(),
			context.options.skipZoom ?
				new EmptyAnimation() :
				new ZoomAnimation(context),
			new FixedFrameAnimation(context),
			context.options.postAnimationDirectory ?
				new PostAnimation(context) :
				new EmptyAnimation(),
			new CoverFrameAnimation(context)
		];
	}

	public *generate(): Generator<FrameInfo>
	{
		const totalFrames = this.animations
			.map(animation => animation.countFrames())
			.reduce((a, b) => a + b, 0);
		const bar = new ProgressBar(' generating animation [:bar] :current/:total frames :percent :etas', {
			complete: '=',
			incomplete: ' ',
			width: 40,
			total: totalFrames
		});
		let frameIndex = 1;
		let lastScale: ScaleBoundaries | null = null;
		for (const animation of this.animations.filter(a => a.countFrames() > 0))
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
					totalFrames,
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
}
