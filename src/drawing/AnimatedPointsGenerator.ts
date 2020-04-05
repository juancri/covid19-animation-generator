import { PlotPoint } from '../util/Types';

export default class AnimatedPointsGenerator
{
	private frames: number;

	public constructor(framesPerDataPoint: number)
	{
		this.frames = framesPerDataPoint;
	}

	public generate(points: PlotPoint[]): PlotPoint[]
	{
		return Array.from(this.getGenerator(points));
	}

	public *getGenerator(points: PlotPoint[]): Generator<PlotPoint>
	{
		if (!points.length)
			return;

		// Initial frame
		yield { date: points[0].date, x: 0, y: 0 };

		for (let pointIndex = 0; pointIndex < points.length; pointIndex++)
		{
			const currentPoint = points[pointIndex];
			const previousPoint = pointIndex === 0 ?
				{ x: 0, y:0 } :
				points[pointIndex - 1];
			const diffX = currentPoint.x - previousPoint.x;
			const diffY = currentPoint.y - previousPoint.y;
			for (let frame = 1; frame <= this.frames; frame++)
			{
				const ratio = frame / this.frames;
				yield {
					date: currentPoint.date,
					x: previousPoint.x + diffX * ratio,
					y: previousPoint.y + diffY * ratio
				};
			}
		}
	}
}
