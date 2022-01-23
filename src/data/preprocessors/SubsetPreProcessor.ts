
// Dependencies
import { PreProcessorConfig, TimeSeries } from "@/util/Types";
import PreProcessorLoader from "./PreProcessorLoader";

interface SubsetParams
{
	filter: string;
	filterRegex: string;
	preProcessors: PreProcessorConfig[]
}

/**
 * Applies a list of pre processors only to a subset of the series
 */
export default class SubsetPreProcessor
{
	public static async run(series: TimeSeries[], params: unknown): Promise<TimeSeries[]>
	{
		// Filter
		const subsetParams = params as SubsetParams;
		const filtered = SubsetPreProcessor.filterSeries(series, subsetParams);
		const rest = series.filter(s => !filtered.includes(s));

		// Apply pre-processors
		const processed = await SubsetPreProcessor.applyPreProcessors(
			filtered,
			subsetParams.preProcessors);

		// Join
		return [...rest, ...processed];
	}

	private static filterSeries(series: TimeSeries[], params: SubsetParams): TimeSeries[]
	{
		if (params.filter)
			return [...series.filter(s => s.name === params.filter)];
		if (params.filterRegex)
		{
			const regex = new RegExp(params.filterRegex);
			return [...series.filter(s => regex.test(s.name))];
		}

		throw new Error('No filter found for this subset pre-processor');
	}

	private static async applyPreProcessors(series: TimeSeries[], preProcessors: PreProcessorConfig[]): Promise<TimeSeries[]>
	{
		// Call all pre processors
		let tempData = series;
		for (const preProcessor of preProcessors)
			tempData = await PreProcessorLoader.load(preProcessor, tempData, false);

		// Done
		return tempData;
	}
}
