
import { DateTime } from "luxon";

import { GapConfiguration, TimeGap } from "./Types";

const OPTS = { zone: 'UTC' };

export default class Gaps
{
	public static parseGaps(gapsConfig: GapConfiguration[]): TimeGap[]
	{
		return gapsConfig.map(g => Gaps.parseGap(g));
	}

	public static parseGap(gapConfig: GapConfiguration): TimeGap
	{
		return {
			from: DateTime.fromISO(gapConfig.from, OPTS),
			to: DateTime.fromISO(gapConfig.to, OPTS)
		};
	}
}
