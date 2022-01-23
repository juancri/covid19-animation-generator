
import { PreProcessor, PreProcessorConfig, TimeSeries } from '../../util/Types';
import logger from '../../util/Logger';

import AvgPreProcessor from './AvgPreProcessor';
import Avg7PreProcessor from './Avg7PreProcessor';
import DailyChangePreProcessor from './DailyChangePreProcessor';
import DatePlusPreProcessor from './DatePlusPreProcessor';
import DuplicatePreProcessor from './DuplicatePreProcessor';
import FillInterpolationPreProcessor from './FillInterpolationPreProcessor';
import FillZeroPreProcessor from './FillZeroPreProcessor';
import FilterOutPreProcessor from './FilterOutPreProcessor';
import FilterOutRegexPreProcessor from './FilterOutRegexPreProcessor';
import FilterPreProcessor from './FilterPreProcessor';
import FilterRegexPreProcessor from './FilterRegexPreProcessor';
import ForceCodePreProcessor from './ForceCodePreProcessor';
import ForceColorPreProcessor from './ForceColorPreProcessor';
import ForceGapsPreProcessor from './ForceGapsPreProcessor';
import FormulaPreProcessor from './FormulaPreProcessor';
import JoinPreProcessor from './JoinPreProcessor';
import LimitPreProcessor from './LimitPreProcessor';
import LoadMilestonesPreProcessor from './LoadMilestonesPreProcessor';
import MultiplyByPreProcessor from './MultiplyByPreProcessor';
import OverridePreProcessor from './OverridePreProcessor';
import PercentagePreProcessor from './PercentagePreProcessor';
import RemoveDatePreProcessor from './RemoveDatePreProcessor';
import RemoveGapPreProcessor from './RemoveGapPreProcessor';
import RemoveValuePreProcessor from './RemoveValuePreProcessor';
import RenamePreProcessor from './RenamePreProcessor';
import RequireForcedCodes from './RequireForcedCodes';
import RunningTotalPreProcessor from './RunningTotalPreProcessor';
import SortDescPreProcessor from './SortDescPreProcessor';
import SumPreProcessor from './SumPreProcessor';
import SubsetPreProcessor from './SubsetPreProcessor';

const PRE_PROCESSORS: { [key: string]: PreProcessor } = {
	avg: AvgPreProcessor.run,
	avg7: Avg7PreProcessor.run,
	dailyChange: DailyChangePreProcessor.run,
	datePlus: DatePlusPreProcessor.run,
	duplicate: DuplicatePreProcessor.run,
	fillInterpolation: FillInterpolationPreProcessor.run,
	fillZero: FillZeroPreProcessor.run,
	filter: FilterPreProcessor.run,
	filterOut: FilterOutPreProcessor.run,
	filterOutRegex: FilterOutRegexPreProcessor.run,
	filterRegex: FilterRegexPreProcessor.run,
	forceCode: ForceCodePreProcessor.run,
	forceColor: ForceColorPreProcessor.run,
	forceGaps: ForceGapsPreProcessor.run,
	formula: FormulaPreProcessor.run,
	join: JoinPreProcessor.run,
	limit: LimitPreProcessor.run,
	loadMilestones: LoadMilestonesPreProcessor.run,
	multiplyBy: MultiplyByPreProcessor.run,
	override: OverridePreProcessor.run,
	percentage: PercentagePreProcessor.run,
	removeDate: RemoveDatePreProcessor.run,
	removeGap: RemoveGapPreProcessor.run,
	removeValue: RemoveValuePreProcessor.run,
	rename: RenamePreProcessor.run,
	requireForcedCodes: RequireForcedCodes.run,
	runningTotal: RunningTotalPreProcessor.run,
	sortDesc: SortDescPreProcessor.run,
	subset: SubsetPreProcessor.run,
	sum: SumPreProcessor.run,
};

export default class PreProcessorLoader
{
	public static async load(
		input: PreProcessorConfig | string | undefined,
		series: TimeSeries[],
		debug: boolean): Promise<TimeSeries[]>
	{
		const config = PreProcessorLoader.getPreProcessorConfig(input);
		if (!config)
		{
			if (debug)
				logger.info('Ignoring pre processor');
			return series;
		}

		const preProcessor = PRE_PROCESSORS[config.name];
		if (!preProcessor)
			throw new Error(`Pre-processor not found: ${config.name}`);
		return await preProcessor(series, config.parameters, debug);
	}

	private static getPreProcessorConfig(input: PreProcessorConfig | string | undefined)
	{
		if (!input)
			return null;
		return typeof input === 'string' ?
			{ name: input, parameters: null } :
			input;
	}
}
