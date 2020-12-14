import { Configuration, Layout, Options } from './Types';

export default class LayoutLoader
{
	public static load(config: Configuration, options: Options): Layout
	{
		const layout = config.layouts[options.layout];
		if (!layout)
			throw new Error(`Layout not found: ${options.layout}`);
		return layout;
	}
}
