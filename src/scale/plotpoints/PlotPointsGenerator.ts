
import { DataPoint, PlotPoint, Options, TimeGap } from '../../util/Types';
import LogPlotPointsGenerator from './LogPlotPointsGenerator';
import LinearPlotPointsGenerator from './LinearPlotPointsGenerator';

const GENERATORS: { [key: string]: (points: DataPoint[], gaps: TimeGap[], seriesIndex: number) => PlotPoint[]} = {
	'log': LogPlotPointsGenerator.generate,
	'linear': LinearPlotPointsGenerator.generate,
	'linear-avg7': LinearPlotPointsGenerator.generateAvg7,
	'linear-avg7-change': LinearPlotPointsGenerator.generateAvg7Change,
	'linear-avg7-change-center': LinearPlotPointsGenerator.generateAvg7ChangeCenter,
};

export default class PlotPointsGenerator
{
	public static generate(options: Options, points: DataPoint[],
		gaps: TimeGap[] = [], seriesIndex: number = 0): PlotPoint[]
	{
		const generator = GENERATORS[options.scale];
		if (!generator)
			throw new Error(`Generator not found for scale: ${options.scale}`);
		return generator(points, gaps, seriesIndex);
	}
}
