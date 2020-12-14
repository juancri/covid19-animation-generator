
import formatNumber from 'format-number';
import { DateTime } from 'luxon';

import { ScaleLabelProvider, ScaleLabel, FrameInfo, Options } from '../../util/Types';
import NumberSuffix from '../../util/NumberSuffix';

const JAN_1 = DateTime.local().startOf('year');
const FORMATTERS: { [key: string]: (n: number) => string } =
{
	'plain': n => n.toString(),
	'spanish': formatNumber({ integerSeparator: '.' }),
	'suffix': n => NumberSuffix.format(n),
	'suffix-abs': n => Math.abs(n) < 1000 ? Math.abs(n).toString() : NumberSuffix.format(Math.abs(n)),
	'percent': n => `${n}%`
};

export default class LinearScaleLabelProvider implements ScaleLabelProvider
{
	private options: Options;
	private formatter: (n: number) => string;

	public constructor(options: Options)
	{
		this.options = options;
		this.formatter = FORMATTERS[options.scaleNumberFormat];
		if (!this.formatter)
			throw new Error(`Scale number format not found: ${options.scaleNumberFormat}`);
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
		const jump = this.options.verticalJump;
		const min = Math.ceil(scale.min / jump) * jump;
		for (let value = min; value <= scale.max; value += jump)
		{
			const position = value;
			const text = this.formatter(value);
			yield { position, text };
		}
	}
}
