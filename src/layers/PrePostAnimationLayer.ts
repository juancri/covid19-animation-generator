
import * as fs from 'fs';
import * as path from 'path';

import { FrameInfo, AnimationContext, Layer } from '../util/Types';

const EXTENSION = '.png';

export default class PrePostAnimationLayer implements Layer
{
	private context: AnimationContext;
	private images: string[];
	private currentIndex: number;

	public constructor(context: AnimationContext)
	{
		this.context = context;
		const directory = context.options.postAnimationDirectory;
		this.images = directory ? fs
			.readdirSync(directory)
			.filter(name => name.endsWith(EXTENSION))
			.map(name => path.join(directory, name)) :
			[];
		this.currentIndex = 0;
	}

	public async draw (frame: FrameInfo)
	{
		// Only implemented for post
		if (frame.stage !== 'post')
			return;
		if (this.images.length === 0)
			return;

		// Get image
		const currentImage = this.images[this.currentIndex];
		try
		{
			await this.context.writer.drawScaledImage(currentImage);
		}
		finally
		{
			this.currentIndex++;
		}
	}
}
