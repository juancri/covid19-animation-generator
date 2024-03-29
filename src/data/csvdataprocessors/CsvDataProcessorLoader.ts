import TransposeCsvDataProcessor from './TransposeCsvDataProcessor';
import { CsvDataProcessor, CsvDataProcessorConfig } from '../../util/Types';
import JoinColumnsCsvDataProcessor from './JoinColumnsCsvDataProcessor';
import ExpandDatesCsvDataProcessor from './ExpandDatesCsvDataProcessor';
import MapValuesCsvDataProcessor from './MapValuesCsvDataProcessor';

const PROCESSORS: { [key: string]: CsvDataProcessor } = {
	expand: ExpandDatesCsvDataProcessor.run,
	joinColumns: JoinColumnsCsvDataProcessor.run,
	mapValues: MapValuesCsvDataProcessor.run,
	transpose: TransposeCsvDataProcessor.run
};

export default class CsvDataProcessorLoader
{
	public static load(processor: string | CsvDataProcessorConfig, data: unknown[]): unknown[]
	{
		const config = CsvDataProcessorLoader.getConfig(processor);
		const found = PROCESSORS[config.name];
		if (!found)
			throw new Error(`CSV Data Processor not found: ${config.name}`);
		return found(data, config.parameters);
	}

	private static getConfig(input: string | CsvDataProcessorConfig): CsvDataProcessorConfig
	{
		return typeof input === 'string' ?
			{ name: input, parameters: null } :
			input;
	}
}
