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

const PRE_PROCESSORS: { [key: string]: PreProcessor } = {
	dailyChange: DailyChangePreProcessor.run,
	datePlus: DatePlusPreProcessor.run,
	forceCode: ForceCodePreProcessor.run,
	forceColor: ForceColorPreProcessor.run,
	forceGaps: ForceGapsPreProcessor.run,
	limit: LimitPreProcessor.run,
	sum: SumPreProcessor.run,
	sortDesc: SortDescPreProcessor.run,
	requireForcedCodes: RequireForcedCodes.run,
	join: JoinPreProcessor.run,
	filter: FilterPreProcessor.run,
	filterOut: FilterOutPreProcessor.run,
	rename: RenamePreProcessor.run,
	formula: FormulaPreProcessor.run,
	override: OverridePreProcessor.run,
	avg7: Avg7PreProcessor.run,
	fillZero: FillZeroPreProcessor.run,
	fillInterpolation: FillInterpolationPreProcessor.run,
	removeDate: RemoveDatePreProcessor.run,
	runningTotal: RunningTotalPreProcessor.run,
	removeGap: RemoveGapPreProcessor.run,
	loadMilestones: LoadMilestonesPreProcessor.run
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
