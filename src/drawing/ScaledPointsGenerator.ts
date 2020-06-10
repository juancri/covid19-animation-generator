
import { ScaleBoundaries, PlotSeries } from '../util/Types';
import StackedAreaScaledPointsGenerator from './StackedAreaScaledPointsGenerator';
import LineScaledPointsGenerator from './LineScaledPointsGenerator';

const STACKED_AREA = 'stacked-area';

export default class ScaledPointsGenerator {

	public static generate(series: PlotSeries[], scale: ScaleBoundaries, type: string): PlotSeries[]
	{
		return type === STACKED_AREA ?
			StackedAreaScaledPointsGenerator.generate(series, scale) :
			LineScaledPointsGenerator.generate(series, scale);
	}
}
