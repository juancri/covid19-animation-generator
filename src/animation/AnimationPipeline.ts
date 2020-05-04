import { FrameInfo, PlotSeries, Animation, Box } from '../util/Types';
import TimeAnimation from './TimeAnimation';
import FixedFrameAnimation from './FixedFrameAnimation';
import DataFrameFilter from '../drawing/DataFrameFilter';
import ScaledPointsGenerator from '../drawing/ScaledPointsGenerator';
import CanvasPointsGenerator from '../drawing/CanvasPointsGenerator';

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
			new FixedFrameAnimation(series, extraFrames)
		];
	}

	public *generate(): Generator<FrameInfo>
	{
		for (const animation of this.animations)
		{
			for (const frame of animation.getFrames())
			{
				const filtered = DataFrameFilter.generate(this.series, frame);
				const scale = animation.getScale(frame, filtered);
				const scaled = ScaledPointsGenerator.generate(filtered, scale);
				const canvas = CanvasPointsGenerator.generate(this.plotArea, scaled);
				yield { date: frame.date, series: canvas, scale };
			}
		}
	}
}
