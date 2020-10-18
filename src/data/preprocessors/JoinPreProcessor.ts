
import { TimeSeries, DataSource } from '../../util/Types';
import DataLoader from '../DataLoader';
import RateJoiner from './joiners/RateJoiner';

type Joiner = (series1: TimeSeries[], series2: TimeSeries[]) => TimeSeries[];

const JOINERS: { [key: string]: Joiner } = {
	rate: RateJoiner.join
};

interface JoinParams
{
	dataSource: DataSource;
	kind: string;
};

/**
 * Joins the original series with a second datasource
 * applying the provided kind
 */
export default class JoinPreProcessor
{
	public static async run(series: TimeSeries[], params: JoinParams)
	{
		const joiner = JOINERS[params.kind];
		if (!joiner)
			throw new Error(`Join kind not found: ${params.kind}`);
		const second = await DataLoader.load(params.dataSource);
		return joiner(series, second);
	}
}
