
import { TimeSeries, DataSource } from '../../util/Types';
import DataLoader from '../DataLoader';
import MergeJoiner from './joiners/MergeJoiner';
import RateJoiner from './joiners/RateJoiner';

type Joiner = (series1: TimeSeries[], series2: TimeSeries[]) => TimeSeries[];

const JOINERS: { [key: string]: Joiner } = {
	merge: MergeJoiner.join,
	rate: RateJoiner.join
};

interface JoinParams
{
	dataSource: DataSource;
	kind: string;
}

/**
 * Joins the original series with a second datasource
 * applying the provided kind
 */
export default class JoinPreProcessor
{
	public static async run(series: TimeSeries[], params: unknown): Promise<TimeSeries[]>
	{
		const joinParams = params as JoinParams;
		const joiner = JOINERS[joinParams.kind];
		if (!joiner)
			throw new Error(`Join kind not found: ${joinParams.kind}`);
		const second = await DataLoader.load(joinParams.dataSource);
		return joiner(series, second);
	}
}
