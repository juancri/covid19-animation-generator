import { ScaleLabelProvider, Options } from '../../util/Types';
import LogScaleLabelProvider from './LogScaleLabelProvider';
import LinearScaleLabelProvider from './LinearScaleLabelProvider';

const PROVIDERS: { [key: string]: (options: Options) => ScaleLabelProvider } =
{
	'log': options => new LogScaleLabelProvider(options),
	'linear': options => new LinearScaleLabelProvider(options),
	'linear-avg7': options => new LinearScaleLabelProvider(options),
	'linear-avg7-change': options => new LinearScaleLabelProvider(options)
};

export default class ScaleLabelProviderLoader
{
	public static load(options: Options): ScaleLabelProvider
	{
		const provider = PROVIDERS[options.scale];
		if (!provider)
			throw new Error(`Scale label provider not found for scale: ${options.scale}`);
		return provider(options);
	}
}
