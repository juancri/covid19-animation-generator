
import { TimeSeries } from '../../../util/Types';

export default class MergeJoiner
{
	public static join (series1: TimeSeries[], series2: TimeSeries[]): TimeSeries[]
	{
		return [...series1, ...series2];
	}
}
