
import * as Enumerable from 'linq';

import { DataPoint, DataSource, Milestone, TimeSeries } from '../../util/Types';
import DataLoader from '../DataLoader';

interface ColorParam
{
	color: string;
	value: number;
}

interface LoadMilestonesParams
{
	dataSource: DataSource;
	colors: ColorParam[];
}

type MilestonesMap = Map<string, Milestone[]>;

export default class LoadMilestonesPreProcessor
{
	public static async run(series: TimeSeries[], unknownParams: unknown): Promise<TimeSeries[]>
	{
		const params = unknownParams as LoadMilestonesParams;
		const milestones = await LoadMilestonesPreProcessor.loadMilestones(params);
		return series.map(s => ({
			...s,
			forceMilestones: milestones.get(s.name)
		}));
	}

	private static async loadMilestones(params: LoadMilestonesParams): Promise<MilestonesMap>
	{
		const milestonesSeries = Enumerable
			.from(await DataLoader.load(params.dataSource))
			.toObject(
				ms => ms.name,
				ms => LoadMilestonesPreProcessor.dataPointsToMilestones(ms, params.colors));
		return new Map(Object.entries(milestonesSeries));
	}

	private static dataPointsToMilestones(ms: TimeSeries, colors: ColorParam[]): Milestone[]
	{
		try
		{
			return LoadMilestonesPreProcessor
				.groupAdjacentPoints(ms.data)
				.map(p => ({
					color: LoadMilestonesPreProcessor.findColor(p, colors),
					date: p.date
				}));
		}
		catch (e)
		{
			throw new Error(`Error loading milestones series ${ms.name}: ${e}`);
		}
	}

	private static groupAdjacentPoints(points: DataPoint[]): DataPoint[]
	{
		return Array.from(LoadMilestonesPreProcessor.generateGroupAdjacentPoints(points));
	}

	private static *generateGroupAdjacentPoints(points: DataPoint[]): Generator<DataPoint>
	{
		// Check
		if (!points.length)
			return;
		let last: DataPoint = points[0];

		// Yield first
		yield last;

		// Check
		if (points.length === 1)
			return;

		// Go with the rest
		for (let index = 1; index < points.length; index++)
		{
			const current = points[index];
			if (current.value === last.value)
				continue;

			yield current;
			last = current;
		}
	}

	private static findColor(point: DataPoint, colors: ColorParam[]): string
	{
		const found = colors.find(c => c.value === point.value);
		if (!found)
			throw new Error(`No color found for value: ${point.value} date: ${point.date} extra: ${point.extra}`);
		return found.color;
	}
}
