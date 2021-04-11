import { PreProcessor, PreProcessorConfig, TimeSeries } from '../../util/Types';
import logger from '../../util/Logger';
import SumPreProcessor from './SumPreProcessor';
import LimitPreProcessor from './LimitPreProcessor';
import SortDescPreProcessor from './SortDescPreProcessor';
import ForceColorPreProcessor from './ForceColorPreProcessor';
import ForceCodePreProcessor from './ForceCodePreProcessor';
import RequireForcedCodes from './RequireForcedCodes';
import JoinPreProcessor from './JoinPreProcessor';
import ForceGapsPreProcessor from './ForceGapsPreProcessor';
import DailyChangePreProcessor from './DailyChangePreProcessor';
import FilterPreProcessor from './FilterPreProcessor';
import FilterOutPreProcessor from './FilterOutPreProcessor';
import RenamePreProcessor from './RenamePreProcessor';
import FormulaPreProcessor from './FormulaPreProcessor';
import OverridePreProcessor from './OverridePreProcessor';
import Avg7PreProcessor from './Avg7PreProcessor';
import FillZeroPreProcessor from './FillZeroPreProcessor';
import RunningTotalPreProcessor from './RunningTotalPreProcessor';
import FillInterpolationPreProcessor from './FillInterpolationPreProcessor';
import RemoveGapPreProcessor from './RemoveGapPreProcessor';
import LoadMilestonesPreProcessor from './LoadMilestonesPreProcessor';
import DatePlusPreProcessor from './DatePlusPreProcessor';
import RemoveDatePreProcessor from './RemoveDatePreProcessor';
import PercentagePreProcessor from './PercentagePreProcessor';
import AvgPreProcessor from './AvgPreProcessor';
import FilterRegexPreProcessor from './FilterRegexPreProcessor';
import FilterOutRegexPreProcessor from './FilterOutRegexPreProcessor';
import MultiplyByPreProcessor from './MultiplyByPreProcessor';

const PRE_PROCESSORS: { [key: string]: PreProcessor } = {
	avg: AvgPreProcessor.run,
	avg7: Avg7PreProcessor.run,
	dailyChange: DailyChangePreProcessor.run,
	datePlus: DatePlusPreProcessor.run,
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
	rename: RenamePreProcessor.run,
	requireForcedCodes: RequireForcedCodes.run,
	runningTotal: RunningTotalPreProcessor.run,
	sortDesc: SortDescPreProcessor.run,
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
