import { FrameInfo, PlotSeries, Animation, Box, EasingFunction, Scale } from '../util/Types';
import TimeAnimation from './TimeAnimation';
import FixedFrameAnimation from './FixedFrameAnimation';
import DataFrameFilter from '../drawing/DataFrameFilter';
import ScaledPointsGenerator from '../drawing/ScaledPointsGenerator';
import CanvasPointsGenerator from '../drawing/CanvasPointsGenerator';
import ZoomAnimation from './ZoomAnimation';
import CoverFrameAnimation from './CoverFrameAnimation';
import EmptyAnimation from './EmptyAnimation';
import DynamicScaleGenerator from '../scale/DynamicScaleGenerator';

export default class AnimationPipeline
{
	private series: PlotSeries[];
	private plotArea: Box;
	private animations: Animation[];

	public constructor(series: PlotSeries[], plotArea: Box, frames: number,
		extraFrames: number, days: number, zoonEasing: EasingFunction,
		skipZoom: boolean, scaleGenerator: DynamicScaleGenerator)
	{
		const lastCode = series[series.length - 1].code;
		this.series = series;
		this.plotArea = plotArea;
		this.animations = [
			new TimeAnimation(series, frames, days, scaleGenerator),
			skipZoom ?
				new EmptyAnimation() :
				new ZoomAnimation(
					series, lastCode, zoonEasing,
					extraFrames / 2, scaleGenerator),
			new FixedFrameAnimation(series, extraFrames),
			new CoverFrameAnimation(series)
		];
	}

	public *generate(): Generator<FrameInfo>
	{
		const totalFrames = this.animations
			.map(animation => animation.countFrames())
			.reduce((a, b) => a + b, 0);
		let frameIndex = 1;
		let lastScale: Scale | null = null;
		for (const animation of this.animations)
		{
			let stepFrameIndex = 1;
			for (const frame of animation.getFrames())
			{
				const filtered = DataFrameFilter.generate(this.series, frame);
				const scale: Scale|null =
					(animation.getScale
						&& animation.getScale(
							filtered, frame,
							frameIndex, stepFrameIndex))
					|| lastScale;
				if (!scale)
					throw new Error('No scale returned by the animation and no previous scale');
				lastScale = scale;
				const scaled = ScaledPointsGenerator.generate(filtered, scale);
				const canvas = CanvasPointsGenerator.generate(scaled, this.plotArea);
				yield {
					date: frame.date,
					series: canvas,
					currentFrame: frameIndex,
					totalFrames,
					name: frame.name,
					drawCover: frame.drawCover,
					scale
				};
				frameIndex++;
				stepFrameIndex++;
			}
		}
	}
}
