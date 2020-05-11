import { FrameInfo, PlotSeries, Animation, Box, EasingFunction } from '../util/Types';
import TimeAnimation from './TimeAnimation';
import FixedFrameAnimation from './FixedFrameAnimation';
import DataFrameFilter from '../drawing/DataFrameFilter';
import ScaledPointsGenerator from '../drawing/ScaledPointsGenerator';
import CanvasPointsGenerator from '../drawing/CanvasPointsGenerator';
import ZoomAnimation from './ZoomAnimation';

export default class AnimationPipeline
{
	private series: PlotSeries[];
	private plotArea: Box;
	private animations: Animation[];

	public constructor(series: PlotSeries[], plotArea: Box, frames: number,
		extraFrames: number, days: number, zoonEasing: EasingFunction)
	{
		const lastCode = series[series.length - 1].code;
		this.series = series;
		this.plotArea = plotArea;
		this.animations = [
			new TimeAnimation(series, frames, days),
			new FixedFrameAnimation(series, extraFrames / 2),
			new ZoomAnimation(series, lastCode, zoonEasing),
			new FixedFrameAnimation(series, extraFrames)
		];
	}

	public *generate(): Generator<FrameInfo>
	{
		const totalFrames = this.animations
			.map(animation => animation.countFrames())
			.reduce((a, b) => a + b, 0);
		let frameIndex = 1;
		for (const animation of this.animations)
		{
			let stepFrameIndex = 1;
			for (const frame of animation.getFrames())
			{
				const filtered = DataFrameFilter.generate(this.series, frame);
				const scale = animation.getScale(filtered, frame, frameIndex, stepFrameIndex);
				const scaled = ScaledPointsGenerator.generate(filtered, scale);
				const canvas = CanvasPointsGenerator.generate(scaled, this.plotArea);
				yield {
					date: frame.date,
					series: canvas,
					currentFrame: frameIndex,
					totalFrames,
					scale
				};
				frameIndex++;
				stepFrameIndex++;
			}
		}
	}
}
