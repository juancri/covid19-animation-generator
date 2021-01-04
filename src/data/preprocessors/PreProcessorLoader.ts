import { PreProcessor, PreProcessorConfig, TimeSeries } from '../../util/Types';
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
import OVerridePreProcessor from './OverridePreProcessor';

const PREPROCESSORS: { [key: string]: PreProcessor } = {
	dailyChange: DailyChangePreProcessor.run,
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
	override: OVerridePreProcessor.run
};

export default class PreProcessorLoader
{
	public static async load(
		input: PreProcessorConfig | string | undefined,
		series: TimeSeries[]): Promise<TimeSeries[]>
	{
		const config = PreProcessorLoader.getPreProcessorConfig(input);
		if (!config)
			return series;

		const preProcessor = PREPROCESSORS[config.name];
		if (!preProcessor)
			throw new Error(`Pre-processor not found: ${config.name}`);
		return await preProcessor(series, config.parameters);
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
