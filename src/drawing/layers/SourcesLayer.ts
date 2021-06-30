
import { AnimationContext, Layer } from '../../util/Types';

export default class SourcesLayer implements Layer
{
	private context: AnimationContext;

	public constructor(context: AnimationContext)
	{
		this.context = context;
	}

	public async draw (): Promise<void>
	{
		const sources = this.context.dataSource.sources;
		if (!sources)
			return;

		const allTexts = [this.context.layout.sources.prefix, ...sources];
		const text = allTexts.join('\n');
		this.context.writer.drawText(
			text,
			this.context.color.sources.font,
			this.context.color.sources.color,
			this.context.layout.sources.position);
	}
}
