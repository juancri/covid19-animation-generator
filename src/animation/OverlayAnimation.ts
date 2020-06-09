
import * as fs from 'fs';

import { Animation, FrameFilterInfo, AnimationStage } from '../util/Types';
import { DateTime } from 'luxon';

const EXTENSION = '.png';

export default abstract class OverlayAnimation implements Animation
{
	private frame: FrameFilterInfo;
	private numberOfFrames: number;

	public constructor(stage: AnimationStage, date: DateTime, directory: string)
	{
		this.numberOfFrames = fs
			.readdirSync(directory)
			.filter(name => name.endsWith(EXTENSION))
			.length;
		this.frame = {
			date,
			stage,
			ratio: 1
		};
	}

	public getName(): string
	{
		return `Overlay Animation (${this.frame.stage})`;
	}

	public countFrames(): number
	{
		return this.numberOfFrames;
	}

	public *getFrames(): Generator<FrameFilterInfo>
	{
		for (let i = 1; i <= this.numberOfFrames; i++)
			yield this.frame;
	}
}
