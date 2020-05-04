import { FrameInfo, PlotSeries, Animation, Box } from '../util/Types';
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
		extraFrames: number, days: number)
	{
		this.series = series;
		this.plotArea = plotArea;
		this.animations = [
			new TimeAnimation(series, frames, days),
			new FixedFrameAnimation(series, extraFrames / 2),
			new ZoomAnimation(series, 'CL'), // FIXME: constant?
			new FixedFrameAnimation(series, extraFrames)
		];
	}

	public *generate(): Generator<FrameInfo>
	{
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
				yield { date: frame.date, series: canvas, scale };
				frameIndex++;
				stepFrameIndex++;
			}
		}
	}
}
