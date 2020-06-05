import { ScaleLabelProvider, ScaleLabel, FrameInfo, Options } from '../../util/Types';

const MAGNITUDES = new Map<number, string>([
	[1_000_000, 'M'],
	[1_000, 'K']
]);

export default class LogScaleLabelProvider implements ScaleLabelProvider
{
	private options: Options;

	public constructor(options: Options)
	{
		this.options = options;
	}

	public getScaleLabels(frame: FrameInfo, horizontal: boolean): ScaleLabel[]
	{
		return Array.from(this.getLabels(frame, horizontal));
	}

	private *getLabels(frame: FrameInfo, horizontal: boolean): Generator<ScaleLabel>
	{
		const scale = horizontal ?
			frame.scaleBoundaries.horizontal :
			frame.scaleBoundaries.vertical;
		const min = Math.ceil(scale.min);
		const jump = horizontal ?
			this.options.horizontalJump :
			this.options.verticalJump;
		for (let labelValue = min; labelValue <= scale.max; labelValue += jump)
		{
			const position = labelValue;
			const text = this.getLabelText(Math.pow(10, labelValue));
			yield { position, text };
		}
	}

	private getLabelText(value: number): string
	{
		for (const magnitudeValue of MAGNITUDES.keys())
			if (value >= magnitudeValue)
				return `${Math.floor(value / magnitudeValue)}${MAGNITUDES.get(magnitudeValue)}`;
		return value.toString();
	}
}
