
import { TimeSeries } from '../../util/Types';

export default class RunningTotalPreProcessor
{
	public static async run(series: TimeSeries[]): Promise<TimeSeries[]>
	{
		series.forEach(s => {
			s.data.forEach((p, index) => {
				p.value = index === 0 ?
					p.value :
					p.value + s.data[index - 1].value
			});
		});
		return series;
	}
}
