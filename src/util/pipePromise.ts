
export default (stream: NodeJS.WritableStream) =>
	new Promise((resolve, reject) => {
		stream.on('end', resolve);
		stream.on('error', reject);
	});
