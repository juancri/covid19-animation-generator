
export default class PromisePipe
{
	public static pipe(input: NodeJS.ReadableStream, output: NodeJS.WritableStream): Promise<void>
	{
		return new Promise((resolve, reject) => input
			.pipe(output)
			.on('finish', resolve)
			.on('error', reject));
	}
}
