
import * as path from 'path';
import { FrameInfo, AnimationContext } from '../util/Types';
import Layer from './Layer';

const ICON_DIRECTORY = path.join(__dirname, '../../assets');

export default class WatermarkLayer implements Layer
{
	private context: AnimationContext;

	public constructor(context: AnimationContext)
	{
		this.context = context;
	}

	public async draw (frame: FrameInfo)
	{
		// Check
		if (this.context.options.hideWatermark)
			return;
		// FIXME: Is this the right property?
		if (frame.drawCover)
			return;

		// Background
		this.context.writer.drawFilledRectangle(
			this.context.layout.watermark.area,
			this.context.color.watermark.background);

		// Icons
		for (const key of Object.keys(this.context.layout.watermark.icons))
			await this.context.writer.drawImage(
				path.join(ICON_DIRECTORY, `${key}.png`),
				this.context.layout.watermark.icons[key]);

		// Labels
		for (const key of Object.keys(this.context.layout.watermark.labels))
			this.context.writer.drawText(
				key,
				this.context.color.watermark.font,
				this.context.color.watermark.color,
				this.context.layout.watermark.labels[key]);
	}
}
