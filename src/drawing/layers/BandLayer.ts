
import { FrameInfo, AnimationContext, Layer, PlotBand } from '../../util/Types';

export default class BandLayer implements Layer
{
	private context: AnimationContext;

	public constructor(context: AnimationContext)
	{
		this.context = context;
	}

	public async draw (frame: FrameInfo)
	{
		frame.series.forEach(s => this.drawBand(s.band));
	}

	private drawBand(band: PlotBand | null)
	{
		if (!band)
			return;
		const points = [ ...band.upper, ...band.lower.reverse() ];
		this.context.writer.drawPolygon(
			band.color, points,
			this.context.layout.plotArea);
	}
}
