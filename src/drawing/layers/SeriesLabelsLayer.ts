
import { FrameInfo, AnimationContext, Layer, PlotSeries } from '../../util/Types';
import StackSeriesLabelDrawer from './seriesLabelDrawers/StackSeriesLabelsDrawer';
import LineSeriesLabelDrawer from './seriesLabelDrawers/LineSeriesLabelsDrawer';

type LabelDrawer = (context: AnimationContext, frame: FrameInfo, series: PlotSeries) => void;
const LABEL_DRAWER: { [key: string]: LabelDrawer } = {
	'line': LineSeriesLabelDrawer.draw,
	'stacked-area': StackSeriesLabelDrawer.draw,
	'stacked-area-center': StackSeriesLabelDrawer.drawCenter,
};

export default class SeriesLabelsLayer implements Layer
{
	private context: AnimationContext;
	private labelDrawer: LabelDrawer;

	public constructor(context: AnimationContext)
	{
		this.context = context;
		this.labelDrawer = LABEL_DRAWER[context.options.type];
		if (!this.labelDrawer)
			throw new Error(`Series label drawer not found for type: ${context.options.type}`);

	}

	public async draw (frame: FrameInfo)
	{
		for (const series of frame.series)
		{
			// Draw only if there's any line
			if (!series.points.length)
				continue;

			// Skip if the point is not visible
			const lastPoint = series.points[series.points.length - 1];
			if (lastPoint.x < this.context.layout.plotArea.left ||
				lastPoint.x > this.context.layout.plotArea.right ||
				lastPoint.y < this.context.layout.plotArea.top ||
				lastPoint.y > this.context.layout.plotArea.bottom)
				continue;

			// Draw label
			this.labelDrawer(this.context, frame, series);
		}
	}
}
