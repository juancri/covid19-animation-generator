import TransposeCsvDataProcessor from './TransposeCsvDataProcessor';
import { CsvDataProcessor } from '../../util/Types';

const PROCESSORS: { [key: string]: CsvDataProcessor } = {
	transpose: TransposeCsvDataProcessor.run
};

export default class CsvDataProcessorLoader
{
	public static load(name: string, data: any[]): any[]
	{
		const found = PROCESSORS[name];
		if (!found)
			throw new Error(`CSV Data Processor not found: ${name}`);
		return found(data);
	}
}
