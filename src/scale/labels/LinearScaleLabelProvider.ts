import { ScaleLabelProvider, ScaleLabel, FrameInfo, Options } from '../../util/Types';
import { DateTime } from 'luxon';

const JAN_1 = DateTime.local().startOf('year');

export default class LinearScaleLabelProvider implements ScaleLabelProvider
{
	private options: Options;

	public constructor(options: Options)
	{
		this.options = options;
	}

	public getScaleLabels(frame: FrameInfo, horizontal: boolean): ScaleLabel[]
	{
		const generator = horizontal ?
			this.getDateLabels(frame) :
			this.getValueLabels(frame);
		return Array.from(generator);
	}

	private *getDateLabels(frame: FrameInfo): Generator<ScaleLabel>
	{
		const scale = frame.scaleBoundaries.horizontal;
		const jump = this.options.horizontalJump;
		const min = Math.ceil(scale.min / jump) * jump;
		for (let value = min; value <= scale.max; value += jump)
		{
			const date = JAN_1.plus({ days: value });
			const position = value;
			const text = date.toFormat(this.options.scaleDateFormat);
			yield { position, text };
		}
	}

	private *getValueLabels(frame: FrameInfo): Generator<ScaleLabel>
	{
		const scale = frame.scaleBoundaries.vertical;
		const min = Math.ceil(scale.min);
		for (let labelValue = min; labelValue <= scale.max; labelValue += this.options.verticalJump)
		{
			const position = labelValue;
			const text = labelValue.toString();
			yield { position, text };
		}
	}
}
