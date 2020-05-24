import { Configuration } from './Types';

const LAYOUT_NAME = 'square';

export default class LayoutLoader
{
	public static load(config: Configuration)
	{
		const layout = config.layouts[LAYOUT_NAME];
		if (!layout)
			throw new Error(`Layout not found: ${LAYOUT_NAME}`);
		return layout;
	}
}
